const express = require('express');
const path = require('path');
const fs = require('fs');
const { SAMPLE_IMAGES_DIR, NON_FIELD_ERRORS } = require('../settings');
const { Task, AdditionalTaskInfo, TaskAssertion } = require('../models');
const { retrieve, list } = require('../util/viewset-methods');
const applyMulter = require('../middleware/multer');
const { DataError } = require('../util/custom-errors');
const { serializeTask } = require('../serializers/task');
const { TASK_FOR_TEACHER, TASK_BASIC, TASK_MIN } = require('../util/query-options');
const httpStatus = require('http-status');
const applyAuthorization = require('../middleware/authorization');
const { now } = require('lodash');

const router = express.Router();

const SAMPLE_IMAGE = 'sampleImage';
const ADDITIONAL = 'additionalAssets';

function destination(req, file, cb) {
  // TODO: Editing existing tasks.
  //  1) Save to same directory if no related solutions under test rn
  //  2) If smth related is under test rn, save to Temp and enqueue a task to move the file

  const { fieldname } = file;
  const timestamp = applyMulter.multerUtils.useSingleTs(req);
  const pathParts = [SAMPLE_IMAGES_DIR, `teacher-${req.user.id}`, `task-${timestamp}`];
  if (fieldname === ADDITIONAL) {
    pathParts.push('additional');
  }
  const dir = path.join(...pathParts);
  fs.mkdir(dir, { recursive: true }, () => {
    cb(null, dir);
  });
}

function filename(req, file, cb) {
  const { fieldname, originalname } = file;
  let fName;
  if (fieldname === SAMPLE_IMAGE) {
    const ext = path.extname(originalname);
    fName = `sample.snap${ext}`;
  } else {
    const idx = applyMulter.multerUtils.useIndexation(req);
    fName = `(${idx})-${originalname}`;
  }
  cb(null, fName);
}

function fileFilter(req, file, cb) {
  const { fieldname, mimetype } = file;
  const Model = fieldname === SAMPLE_IMAGE ? Task : AdditionalTaskInfo;
  const fits = Model.validateFileType(mimetype);
  const cbArgs = fits
    ? [null, true]
    : [new DataError({ [fieldname]: [`Files of type ${mimetype} are not supported`] })];
  cb(...cbArgs);
}

applyAuthorization(router);

const fields = [{ name: SAMPLE_IMAGE, maxCount: 1 }, { name: ADDITIONAL }];
applyMulter(router, fields, destination, {
  fieldType: 'fields', filename, fileFilter, routes: [{ route: '/', method: 'post' }]
});
router.post('/', async (req, res, next) => {
  if (!req.user.isTeacher) {
    return res.status(httpStatus.FORBIDDEN).json({
      [NON_FIELD_ERRORS]: ['Only teachers are allowed to create tasks']
    });
  }

  try {
    const { title, additionalText, assertions } = req.body;
    const allFiles = req.files;
    const sampleImage = allFiles[SAMPLE_IMAGE][0].path;
    const additionalAssets = allFiles[ADDITIONAL];

    const newTask = await req.user.createTask({
      title, sampleImage,
      infoEntries: [
        ...(additionalText || []).map(content => ({
          content, kind: AdditionalTaskInfo.KINDS.text
        })),
        ...(additionalAssets || []).map(f => ({
          content: f.path, kind: AdditionalTaskInfo.KINDS.asset
        }))
      ], assertions
      }, {
        include: [
          { model: AdditionalTaskInfo, as: 'infoEntries' },
          { model: TaskAssertion, as: 'assertions' }
        ]
      }
    );

    return res.json(serializeTask({ ...newTask.dataValues, user: req.user }));
  } catch (e) {
    next(e);
  }
});

router.get('/', (...args) => list(...args, {
  Model: Task, options: TASK_MIN
}));

router.get('/:id', (req, ...otherArgs) => retrieve(req, ...otherArgs, {
  Model: Task, serializer: serializeTask, options: req.user.isTeacher ? TASK_FOR_TEACHER : TASK_BASIC
}));

module.exports = router;