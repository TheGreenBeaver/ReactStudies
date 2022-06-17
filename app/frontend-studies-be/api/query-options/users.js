const { User_List, User_Authentication, User_Private } = require('../../util/query-options');


module.exports = {
  retrieve: User_List,
  list: User_List,
  create: User_Authentication,
  retrieveMe: User_Private
}
