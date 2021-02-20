/**
 * Class Name: paymentBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for payment.
 */

//#region Imports

let PaymentSetting = require('mongoose').model('PaymentSetting');
let Division = require('mongoose').model('Division');
//#endregion

//#region Public Functions

/**
 * Gets Payment Setting list
 * @param req
 * @returns {{p: string}}s
 */
async function getPaymentSettings(req) {

    let productSettingList = await PaymentSetting.find().sort({updatedAt: -1});
    let productSettingListIds = [...new Set(productSettingList.map(x => x.divId))];
    let divisions = await Division.find({_id: {$in: productSettingListIds}}).select({value: 1});

    for(let setting of productSettingList){
        setting.url = await maskString(setting.url);
        setting.responseUrl = await maskString(setting.responseUrl);
        setting.workingKey = await maskString(setting.workingKey);
        setting.accessCode = await maskString(setting.accessCode);
        setting.merchantId = await maskString(setting.merchantId);
        setting.MerchantKey = await maskString(setting.MerchantKey);
        setting.MerchantSalt = await maskString(setting.MerchantSalt);
        setting.AuthHeader = await maskString(setting.AuthHeader);
        setting.successUrl = await maskString(setting.successUrl);
        setting.failureUrl = await maskString(setting.failureUrl);

        setting.divName = divisions.find(x => x._id.toString() === setting.divId).value;
    }

    return {recordsTotal: productSettingList.length, records: productSettingList};
}

/**
 * Add a new payment setting
 * @param req
 * @returns {{p: string}}
 */
async function addPaymentSetting(req) {
    let paymentSetting = req.body.data;

    let productSetting = await PaymentSetting.findOne({divId: paymentSetting.divId , paymentProvider: paymentSetting.paymentProvider, platform: paymentSetting.platform});

    if(productSetting) throw new Error("Setting already present for selected division and payment provider");

    let paymentSettingModel = new PaymentSetting();
    paymentSettingModel.paymentProvider = paymentSetting.paymentProvider;
    paymentSettingModel.platform = paymentSetting.platform;
    paymentSettingModel.url = paymentSetting.url;
    paymentSettingModel.responseUrl = paymentSetting.responseUrl;
    paymentSettingModel.MerchantKey = paymentSetting.MerchantKey;
    paymentSettingModel.MerchantSalt = paymentSetting.MerchantSalt;
    paymentSettingModel.AuthHeader = paymentSetting.AuthHeader;
    paymentSettingModel.workingKey = paymentSetting.workingKey;
    paymentSettingModel.accessCode = paymentSetting.accessCode;
    paymentSettingModel.merchantId = paymentSetting.merchantId;
    paymentSettingModel.successUrl = paymentSetting.successUrl;
    paymentSettingModel.failureUrl = paymentSetting.failureUrl;
    paymentSettingModel.divId = paymentSetting.divId;
    paymentSettingModel.accName = paymentSetting.accName;
    paymentSettingModel.bnkName = paymentSetting.bnkName;
    paymentSettingModel.accNo = paymentSetting.accNo;
    paymentSettingModel.ifsc = paymentSetting.ifsc;
    paymentSettingModel.branch = paymentSetting.branch;
    paymentSettingModel.gstNo = paymentSetting.gstNo;
    await paymentSettingModel.save();
    return paymentSettingModel;
}

/**
 * Updates an existing product
 * @param req
 * @returns {{p: string}}
 */
async function updatePaymentSetting(req) {
    let _id = req.body._id;
    let paymentSetting = req.body.data;

    if(unMaskString(paymentSetting.url)) delete paymentSetting.url;
   if(unMaskString(paymentSetting.responseUrl)) delete paymentSetting.responseUrl;
    if(unMaskString(paymentSetting.workingKey)) delete paymentSetting.workingKey;
    if(unMaskString(paymentSetting.workingKey)) delete paymentSetting.workingKey;
    if(unMaskString(paymentSetting.accessCode)) delete paymentSetting.accessCode;
    if(unMaskString(paymentSetting.merchantId)) delete paymentSetting.merchantId;
    if(unMaskString(paymentSetting.MerchantKey)) delete paymentSetting.MerchantKey;
    if(unMaskString(paymentSetting.MerchantSalt)) delete paymentSetting.MerchantSalt;
    if(unMaskString(paymentSetting.AuthHeader)) delete paymentSetting.AuthHeader;
    if(unMaskString(paymentSetting.successUrl)) delete paymentSetting.successUrl;
    if(unMaskString(paymentSetting.failureUrl)) delete paymentSetting.failureUrl;

    delete paymentSetting.divName;

    return await PaymentSetting.findOneAndUpdate({_id: _id}, {$set: paymentSetting}, {new: true});
}

// #endregion

//#region Private Functions

async function maskString(str){
    if(!str) return "";
    let stringLength = str.length;
    let per = Math.round((10/100) * stringLength);
    var first = str.substring(0, per);
    var last = str.substring(str.length - per);
    let mask = "X".repeat(str.substring(per, str.length - per).length);
   return first+mask+last;
}

 function unMaskString(str){
    if(!str) return true;
    return str.includes("XXX");
}

//#endregion

//#region Exports
module.exports.addPaymentSetting = addPaymentSetting;
module.exports.getPaymentSettings = getPaymentSettings;
module.exports.updatePaymentSetting = updatePaymentSetting;

//#endregion