const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');
const { isDirectory } = require('./misc');
const { Transform } = require('stream');
const { ErrorWithSource } = require('./custom-errors');


const SOURCES = {
  internal: 'internal',
  corrupted: 'corrupted',
};

/**
 * @typedef {Object} ZipStatistics
 * @property {number} createdFiles - amount of created files
 * @property {number} bytesRead - total amount of bytes read
 */
/**
 *
 * @param {string} extractFrom - path to the .zip archive
 * @param {function(e: Error | null, statistics: ZipStatistics?)} callback
 * @param {string=} saveTo - where to save files to (the same directory as the original archive by default)
 * @param {function(pathToExtractedFile: string, cb: function(confirmationErr: Error?))} confirmFile
 */
function unzip(extractFrom, callback, {
  saveTo = path.dirname(extractFrom),
  confirmFile = (pathToExtractedFile, cb) => cb(null)
} = {}) {
  // Open the whole archive
  yauzl.open(extractFrom, { lazyEntries: true }, (archiveOpeningErr, zipFile) => {
    if (archiveOpeningErr) {
      return callback(new ErrorWithSource(
        SOURCES.corrupted,
        archiveOpeningErr.message
      ));
    }

    const statistics = {
      createdFiles: 0,
      bytesRead: 0
    };
    let openFileHandlesAmount = 0;

    function onFileHandleOpen() {
      ++openFileHandlesAmount;
    }

    function onFileHandleClose() {
      if (--openFileHandlesAmount === 0) {
        callback(null, statistics);
      }
    }

    onFileHandleOpen();
    zipFile.on('close', onFileHandleClose);

    // Read the first compressed entry to start the process
    zipFile.readEntry();

    zipFile.on('entry', entry => {
      const fileName = path.join(saveTo, entry.fileName);
      const isDir = isDirectory(fileName);
      // If the entry is a directory, create it
      // If it is a file, ensure the directory to contain it exists
      const dirToCreate = isDir ? fileName : path.dirname(fileName);
      fs.mkdir(dirToCreate, { recursive: true }, dirCreationErr => {
        if (dirCreationErr) {
          return callback(new ErrorWithSource(
            SOURCES.internal,
            dirCreationErr.message
          ));
        }

        // No file creation / writing needed for directories, just move on
        if (isDir) {
          zipFile.readEntry();
          return;
        }

        zipFile.openReadStream(entry, function (fileAccessErr, readStream) {
          if (fileAccessErr) {
            return callback(new ErrorWithSource(
              SOURCES.corrupted,
              fileAccessErr.message
            ));
          }

          // To transform the zip data into a standard byte buffer
          const filter = new Transform();

          filter._transform = (chunk, encoding, transformCb) => {
            statistics.bytesRead += chunk.length;
            transformCb(null, chunk);
          };
          filter._flush = cb => {
            cb();
            // Read the next entry whenever we finish writing the current file
            confirmFile(fileName, confirmationErr => {
              if (confirmationErr) {
                // TODO: Delete what's already created on error
                return callback(confirmationErr);
              }
              zipFile.readEntry();
            });
          };

          const writeStream = fs.createWriteStream(fileName);
          writeStream.on('close', () => {
            statistics.createdFiles++;
            onFileHandleClose();
          });
          readStream.pipe(filter).pipe(writeStream);
        });
      });
    });
  });
}

unzip.SOURCES = SOURCES;

module.exports = unzip;