//#region Imports
const financierService = require("../services/financierService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/financiers")
                .get(auth, financierService.getFinanciers)
                .post(auth, financierService.postFinanciers)
                .put(auth, financierService.putFinanciers)
                .delete(auth, financierService.deleteFinanciers);
    app.route("/financiers/changeStatus")
        .put(auth, financierService.updateFinanciersStatus)
};
//#endregion