//#region Imports
const schemeService = require("../services/schemeService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/schemes")
                .get(auth, schemeService.getSchemes)
                .post(auth, schemeService.postSchemes)
                .put(auth, schemeService.putSchemes)
                .delete(auth, schemeService.deleteSchemes);
    app.route("/schemes/changeStatus")
        .put(auth,schemeService.updateSchemesStatus);
};
//#endregion