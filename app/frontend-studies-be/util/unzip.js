const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');
const { isDirectory } = require('./misc');
const { Transform } = require('stream');


/**
 * @typedef {Object} ZipStatistics
 * @property {number} createdFiles - amount of created files
 * @property {number} bytesRead - total amount of bytes read
 */
/**
 *
 * @param {string} extractFrom - path to the .zip archive
 * @param {string=} saveTo - where to save files to (the same directory as the original archive by default)
 * @param {function(e: Error | null, statistics: ZipStatistics?)} callback
 */
function unzip(extractFrom, saveTo = path.dirname(extractFrom), callback) {
  // Open the whole archive
  yauzl.open(extractFrom, { lazyEntries: true }, (archiveOpeningErr, zipFile) => {
    if (archiveOpeningErr) {
      return callback(archiveOpeningErr);
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
          return callback(dirCreationErr);
        }

        // No file creation / writing needed for directories, just move on
        if (isDir) {
          zipFile.readEntry();
          return;
        }

        zipFile.openReadStream(entry, function (fileAccessErr, readStream) {
          if (fileAccessErr) {
            return callback(fileAccessErr);
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
            zipFile.readEntry();
          };

          const writeStream = fs.createWriteStream(fileName);
          writeStream.on('error', writeErr => callback(writeErr));
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

module.exports = unzip;
