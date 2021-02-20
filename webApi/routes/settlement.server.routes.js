//#region Imports
const settlementService = require("../services/settlementService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function (app) {
    app.route("/settlements")
        .get(auth,settlementService.getSettlements)
        .put(auth,settlementService.putSettlements);
    app.route("/settlements/updateStatus")
        .put(auth,settlementService.putBookingStatus);

    app.route("/settlements/myEarnings")
        .get(auth, settlementService.getEarnings);


};
//#endregion