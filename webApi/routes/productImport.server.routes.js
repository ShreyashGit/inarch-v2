//#region Imports
const productImportService = require("../services/productImportService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/productImport")
        .post(auth, productImportService.importProducts)
        .get(auth, productImportService.getUploadedExcelStatus);

    app.route("/exportProducts")
        .get(auth, productImportService.exportProduct);
};
//#endregion