/**
 * Class Name: settlementsService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to settlements.
 */

//#region Imports
const settlementsBl = require("../businessLogic/settlementBl");
//#endregion

//#region Public Functions
async function getSettlements(req, res) {
    let blResponse = await settlementsBl.getSettlements(req);
    return res.status(200).json(blResponse);
}

async function putSettlements(req, res) {
    let blResponse = await settlementsBl.updateSettlements(req);
    return res.status(200).json(blResponse);
}

async function putBookingStatus(req, res) {
    let blResponse = await settlementsBl.updateBookingStatus(req);
    return res.status(200).json(blResponse);
}

async function getEarnings(req, res) {
    let blResponse = await settlementsBl.getEarnings(req);
    return res.status(200).json(blResponse);
}

//#endregion

//#region Private Functions

//#endregion

//#region Exports
module.exports.getSettlements = getSettlements;
module.exports.putSettlements = putSettlements;
module.exports.putBookingStatus = putBookingStatus;
module.exports.getEarnings = getEarnings;

//#endregion