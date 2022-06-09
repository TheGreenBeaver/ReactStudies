const cloneDeep = require('lodash/cloneDeep');


module.exports = {
  retrieveMe: user => {
    const serialized = cloneDeep(user.dataValues);
    delete serialized.newPassword;
    serialized.passwordChangeRequested = !!user.newPassword;
    return serialized;
  }
}
