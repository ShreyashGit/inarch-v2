/**
 * Class Name: reportService
 * Purpose: Service class to handle HTTP requests related to report export.
 */


//#region Imports
const reportsBl = require("../businessLogic/reportsBl");
//#endregion


async function exportPaymentReport(req, res){
    await reportsBl.exportPaymentReport(req, res);
}

async function exportSettlementReport(req, res){
    await reportsBl.exportSettlementReport(req, res);
}

async function exportBookingReport(req, res){
    await reportsBl.exportBookingReport(req, res);
}

//#region Exports
module.exports.exportPaymentReport = exportPaymentReport;
module.exports.exportSettlementReport = exportSettlementReport;
module.exports.exportBookingReport = exportBookingReport;
//#endregion