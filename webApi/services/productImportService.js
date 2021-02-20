/**
 * Class Name: productImportService
 * Purpose: Service class to handle HTTP requests related to product import and export.
 */


//#region Imports
const productImportBl = require("../businessLogic/productImportBl");
//#endregion

async function importProducts(req, res) {
    let blResponse = await productImportBl.importProduct(req, res);
    return;
}

async function getUploadedExcelStatus(req, res){
    let blResponse = await productImportBl.getUploadedExcelStatus(req);
    return res.status(200).json(blResponse);
}

async function exportProduct(req, res){
    await productImportBl.exportProducts(req, res);
}

//#region Exports
module.exports.importProducts = importProducts;
module.exports.exportProduct = exportProduct;
module.exports.getUploadedExcelStatus = getUploadedExcelStatus;
//#endregion