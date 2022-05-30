const { User_Default, User_List, User_Authentication } = require('../../util/query-options');


module.exports = {
  retrieve: User_Default,
  list: User_List,
  create: User_Authentication,
}
