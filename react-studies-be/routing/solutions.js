const express = require('express');
const { DataError, ErrorWithSource } = require('../util/custom-errors');
const path = require('path');
const fs = require('fs');
const { SOLUTIONS_DIR, NON_FIELD_ERRORS } = require('../settings');
const { Solution, Task } = require('../models');
const { retrieve, list } = require('../util/viewset-methods');
const applyMulter = require('../middleware/multer');
const { SOLUTION_BASIC, TASK_BASIC } = require('../util/query-options');
const httpStatus = require('http-status');
const { serializeSolution, serializeSolutionStatusUpd } = require('../serializers/solution');
const runTest = require('../test-engine/run-test');
const unzip = require('../util/unzip');
const { getMimeType, asyncMap } = require('../util/misc');
const { wsServer } = require('../ws');
const log = require('../util/logger');
const applyAuthorization = require('../middleware/authorization');

const router = express.Router();

function multerDestination(req, file, cb) {
  const timestamp = applyMulter.multerUtils.useSingleTs(req);

  const dir = path.join(
    SOLUTIONS_DIR,
    `student-${req.user.id}`,
    `solution-${timestamp}`
  );
  fs.mkdir(dir, { recursive: true }, () => cb(null, dir));
}

function multerFilename(req, file, cb) {
  const { originalname, mimetype } = file;
  const originalExt = path.extname(originalname);
  let fName = originalname;
  if (mimetype === Solution.ZIP && originalExt !== '.zip') {
    const originalBase = path.basename(originalname, originalExt);
    // We'll need to unzip this, thus the extension is to be fixed
    fName = `${originalBase}.zip`;
  }
  cb(null, fName);
}

function multerFileFilter(req, file, cb) {
  const { mimetype, fieldname } = file;
  const fits = Solution.validateFileType(mimetype);
  const cbArgs = fits
    ? [null, true]
    : [new DataError({ [fieldname]: [`Files of type ${mimetype} are not supported`] })];
  cb(...cbArgs);
}

function confirmFile(pathToExtractedFile, cb) {
  getMimeType(pathToExtractedFile, (mimeExtractionErr, mime) => {
    if (mimeExtractionErr) {
      return cb(mimeExtractionErr);
    }
    if (!Solution.validateFileType(mime, true)) {
      return cb(new ErrorWithSource(
        confirmFile.name,
        `Files of type ${mime} are not allowed in archive Solutions`
      ));
    }

    return cb();
  });
}

applyAuthorization(router);

const FILES_FIELD_NAME = 'files';
applyMulter(router, FILES_FIELD_NAME, multerDestination, {
  fieldType: 'array',
  filename: multerFilename,
  fileFilter: multerFileFilter,
  routes: [{ method: 'post', route: '/' }]
});

router.post('/', async (req, res, next) => {
  if (req.user.isTeacher) {
    return res.status(httpStatus.FORBIDDEN).json({
      [NON_FIELD_ERRORS]: ['Only students are allowed to submit solutions']
    });
  }

  let newSolution, theTask, isArchive, destination;
  try {
    const { body, files } = req;
    const { taskId } = body;

    const mixedZips = files.length > 1 && files.some(f => f.mimetype === Solution.ZIP);
    if (mixedZips) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({
          [FILES_FIELD_NAME]: [
            'Either provide a single .zip archive or a set of non-archived project files'
          ]
        });
    }

    // Only need to check the first one: the root directory is same for all files, and if an archive is sent,
    // there's always just one
    const { mimetype } = files[0];
    destination = files[0].destination;
    isArchive = mimetype === Solution.ZIP;

    theTask = await Task.findByPk(taskId, { ...TASK_BASIC, rejectOnEmpty: false });
    if (!theTask) {
      return res.status(httpStatus.BAD_REQUEST).json({ taskId: ['No such task'] });
    }

    newSolution = await req.user.createSentSolution({
      path: destination,
      task_id: taskId,
      status: isArchive ? Solution.STATUSES.preparing : Solution.STATUSES.underTest
    }, { returning: ['id', 'path', 'status'] });
    const serializedSolution = await serializeSolution({
      ...newSolution.dataValues, task: theTask, student: req.user.dataValues
    });
    res.json(serializedSolution);
  } catch (e) {
    next(e);
  }

  let shouldTest = true;
  if (isArchive) {
    let wsMessageStatus, solutionStatus, extraToSend;

    try {
      await new Promise((resolve, reject) => unzip(
        destination,
        (e, statistics) => e ? reject(e) : resolve(statistics),
        { confirmFile }
      ));

      wsMessageStatus = httpStatus.OK;
      solutionStatus = Solution.STATUSES.underTest;
      shouldTest = true;
    } catch (unzippingErr) {
      solutionStatus = Solution.STATUSES.couldNotTest;
      shouldTest = false;

      let comment, field;
      switch (unzippingErr.source) {
        case getMimeType.name:
        case unzip.SOURCES.internal:
          log(log.levels.error, unzippingErr.message);
          comment = 'An internal error has happened while extracting your solution files.' +
            ' Please try re-sending your Solution.';
          wsMessageStatus = httpStatus.INTERNAL_SERVER_ERROR;
          field = NON_FIELD_ERRORS;
          break;
        case confirmFile.name:
        case unzip.SOURCES.corrupted:
          comment = unzippingErr.message;
          wsMessageStatus = httpStatus.BAD_REQUEST;
          field = 'files';
      }
      extraToSend = { [field]: [comment] };
    }

    newSolution.status = solutionStatus;
    await newSolution.save();
    await wsServer.sendTo(req.user.id, {
      status: wsMessageStatus,
      data: { solution: serializeSolutionStatusUpd(newSolution), ...extraToSend },
      action: wsServer.actions.solutionUpd
    });
  }

  if (shouldTest) {
    await runTest(req.user.id, destination, theTask.sampleImage, newSolution.id);
  }
});

// TODO: Think if editing solutions should be allowed. If so, we need to:
//  1) Save to same directory if not under test rn
//  2) If under test rn, save to Temp and enqueue a task to move the file and re-run tests
router.patch('/:id', (_, res) =>
  res.status(httpStatus.METHOD_NOT_ALLOWED).json({
    [NON_FIELD_ERRORS]: ['Solutions can not be edited. Please submit a completely new Solution instead.']
  })
);

router.get('/', async (req, res, next) => {
  const { task } = req.query;

  const options = { ...SOLUTION_BASIC };
  if (task != null && Number.isInteger(+task)) {
    options.where = { task_id: +task };
  }

  if (req.user.isTeacher) {
    return list(req, res, next, {
      Model: Solution, serializer: serializeSolution, options
    });
  }

  try {
    const allStudentsSolutions = await req.user.getSolutions({ ...SOLUTION_BASIC });
    const serialized = await asyncMap(allStudentsSolutions, serializeSolution);
    return res.json(serialized);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  if (req.user.isTeacher) {
    return retrieve(req, res, next, {
      Model: Solution, serializer: serializeSolution, options: SOLUTION_BASIC
    });
  }

  try {
    const allStudentsSolutions = await req.user.getSolutions({
      where: { id: +req.params.id }, ...SOLUTION_BASIC, rejectOnEmpty: true
    });
    const serialized = await serializeSolution(allStudentsSolutions[0]);
    return res.json(serialized);
  } catch (e) {
    next(e);
  }
});

module.exports = router;