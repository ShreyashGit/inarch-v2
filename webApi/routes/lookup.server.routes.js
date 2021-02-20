//#region Imports
const lookUpService = require("../services/lookupService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/lookups")
        .get(auth, lookUpService.getLookUps)
};
//#endregion