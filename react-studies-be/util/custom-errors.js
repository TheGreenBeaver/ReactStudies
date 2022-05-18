const httpStatus = require('http-status');


class CustomError extends Error {
  send() {
    return null;
  }
}

class StatusError extends CustomError {
  constructor(status = httpStatus.BAD_REQUEST) {
    super();
    this.status = status;
  }

  send(res) {
    return res.status(this.status).end();
  }
}

class DataError extends CustomError {
  constructor(data, status = httpStatus.BAD_REQUEST) {
    super();
    this.status = status;
    this.data = data;
  }

  send(res) {
    return res.status(this.status).json(this.data);
  }
}

class ErrorWithSource extends Error {
  constructor(source, message) {
    super(message);
    this.source = source;
  }
}

module.exports = {
  DataError, StatusError, CustomError, ErrorWithSource
}