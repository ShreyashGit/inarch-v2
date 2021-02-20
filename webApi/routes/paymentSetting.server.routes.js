//#region Imports
const paymentSettingService = require("../services/paymentSetting.service");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {

    app.route("/paymentSettings")
        .get(auth, paymentSettingService.getPaymentSettings)
        .post(auth, paymentSettingService.savePaymentSetting)
        .put(auth, paymentSettingService.updatePaymentSetting);

};
//#endregion