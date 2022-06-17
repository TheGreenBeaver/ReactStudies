const httpStatus = require('http-status');
const { NON_FIELD_ERR } = require('../settings');


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

class AccessError extends CustomError {
  constructor(shouldBe, property) {
    super();
    this.shouldBe = shouldBe;
    this.property = property;
  }

  send(res) {
    const text = this.shouldBe ? this.property : `non-${this.property}`;
    return res.status(httpStatus.FORBIDDEN).json({ [NON_FIELD_ERR]: [`Only allowed for ${text} users`] });
  }
}

module.exports = {
  DataError, StatusError, CustomError, AccessError
}
