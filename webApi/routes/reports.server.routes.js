//#region Imports
const reportService = require("../services/reportsService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/exportPayment")
        .get(auth,reportService.exportPaymentReport);
    app.route("/exportSettlement")
        .get(auth,reportService.exportSettlementReport);
    app.route("/exportBooking")
        .get(auth,reportService.exportBookingReport);
};
//#endregion