const Validators = require('../../util/validation');
const { string } = require('yup');

module.exports = {
  signIn: {
    body: Validators.strictObject({
      email: string().email(),
      password: string().max(100)
    }),
    query: Validators.ensureEmpty()
  },
  logOut: {
    body: Validators.ensureEmpty(),
    query: Validators.ensureEmpty()
  }
}
