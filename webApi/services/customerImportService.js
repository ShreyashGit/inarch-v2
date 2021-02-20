/**
 * Class Name: productImportService
 * Purpose: Service class to handle HTTP requests related to product import and export.
 */


//#region Imports
const customerImportBl = require("../businessLogic/customerImportBl");
//#endregion

async function importCustomers(req, res) {
    console.log("I am somehow here");
    let blResponse = await customerImportBl.importCustomers(req, res);
    return;
}

async function getUploadedExcelStatus(req, res){
    let blResponse = await customerImportBl.getUploadedExcelStatus(req);
    return res.status(200).json(blResponse);
}

//#region Exports
module.exports.importCustomers = importCustomers;
module.exports.getUploadedExcelStatus = getUploadedExcelStatus;
//#endregion