/**
 * Class Name: smsService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle requests related to PayU Money.
 */

//#region Imports
//#endregion

//#region Public Functions
async function formatResponse(response) {

    let data = {};
        data.mode = "Online",
        data.amount = response.amount,
        data.transactionId = response.payuMoneyId,
        data.bookingId = response.bookingId,
        data.providerResponse = response,
        data.status = response.status ? response.status.toUpperCase() : response.txnStatus.toUpperCase(),
        data.bankRef = response.bank_ref_num,
        data.refNo = response.txnid ? response.txnid : response.paymentId,
        data.hash = response.hash,
        data.firstname = response.firstname,
        data.productinfo = response.productinfo;
    return data;
}

//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.formatResponse = formatResponse;

//#endregion