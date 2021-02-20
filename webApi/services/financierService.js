/**
 * Class Name: financierService
 * Author: Piyush Thacker
 * Purpose: Service class to handle HTTP requests related to financiers.
 */

//#region Imports
const financierBl = require("../businessLogic/financierBl");
//#endregion

//#region Public Functions
async function getFinanciers(req, res) {

    let _id = req.query._id;
    let amount = req.query.amount;
    let tenure = req.query.tenure;
    let blResponse;

    if (_id) {
        blResponse = await financierBl.getFinancierById(_id);
    } else if (amount && tenure) {
        blResponse = await financierBl.getFinancierByTenure(amount, tenure);
    } else {
        blResponse = await financierBl.getFinanciers(req);
    }

    return res.status(200).json(blResponse);
}

async function postFinanciers(req, res) {
    let blResponse = await financierBl.addFinancier(req);
    return res.status(200).json(blResponse);
}

function putFinanciers(req, res) {
    let blResponse = financierBl.updateFinancier(req);
    return res.status(200).json(blResponse);
}

function deleteFinanciers(req, res) {
    let blResponse = financierBl.deleteFinancier(req);
    return res.status(200).json(blResponse);
}

async function updateFinanciersStatus(req, res) {
    let blResponse = await financierBl.updateFinanciersStatus(req);
    return res.status(200).json(blResponse);
}

//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getFinanciers = getFinanciers;
module.exports.postFinanciers = postFinanciers;
module.exports.putFinanciers = putFinanciers;
module.exports.deleteFinanciers = deleteFinanciers;
module.exports.updateFinanciersStatus = updateFinanciersStatus;

//#endregion