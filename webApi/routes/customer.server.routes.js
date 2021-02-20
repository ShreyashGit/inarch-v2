//#region Imports
const customerService = require("../services/customerService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/customers")
        .get(auth,customerService.getCustomer)
};
//#endregion