/**
 * Class Name: bookingService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to lookUps.
 */

//#region Imports
const lookupBl = require("../businessLogic/lookupBl");
//#endregion

//#region Public Functions
async function getLookUps(req, res) {
    let blResponse = await lookupBl.getLookups(req);
    return res.status(200).json(blResponse);
}

function postLookUps(req, res) {
    let blResponse = lookupBl.addLookup(req);
    return res.status(200).json(blResponse);
}

//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getLookUps = getLookUps;
module.exports.postLookUps = postLookUps;
//#endregion