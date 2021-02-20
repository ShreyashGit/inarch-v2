//#region Imports
const fileUploaderService = require("../services/fileUploaderService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/fileUploads")
        .post(auth,fileUploaderService.postFiles)
        .put(auth,fileUploaderService.putFiles)
};
//#endregion