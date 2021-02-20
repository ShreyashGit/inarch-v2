/**
 * Class Name: customerService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to file customerService.
 */

//#region Imports
const customerBl = require("../businessLogic/customerBl");
//#endregion

//#region Public Functions
async function getCustomer(req, res) {
    let blResponse = await customerBl.getCustomer(req);
    return res.status(200).json(blResponse);
}

//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getCustomer = getCustomer;
//#endregion