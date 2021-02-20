/**
 * Class Name: paymentService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to paymentService.
 */

//#region Imports
const paymentSettingBl = require("../businessLogic/paymentSettingBl");
//#endregion

//#region Public Functions
async function getPaymentSettings(req, res)  {
    let blResponse = await paymentSettingBl.getPaymentSettings(req);
    return res.status(200).json(blResponse);
}

async function savePaymentSetting(req, res)  {
    let blResponse = await paymentSettingBl.addPaymentSetting(req);
    return res.status(200).json(blResponse);
}

async function updatePaymentSetting(req, res)  {
    let blResponse = await paymentSettingBl.updatePaymentSetting(req);
    return res.status(200).json(blResponse);
}

//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.savePaymentSetting = savePaymentSetting;
module.exports.getPaymentSettings = getPaymentSettings;
module.exports.updatePaymentSetting = updatePaymentSetting;
//#endregion