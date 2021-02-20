/**
 * Class Name: schemeService
 * Author: Piyush Thacker
 * Purpose: Service class to handle HTTP requests related to schemes.
 */

//#region Imports
const schemeBl = require("../businessLogic/schemeBl");
//#endregion

//#region Public Functions
async function getSchemes(req, res) {
    let id = req.query._id;
    let blResponse;

    if (id) {
        blResponse = await schemeBl.getSchemeById(id);
    } else {
        blResponse = await schemeBl.getSchemes(req);
    }

    return res.status(200).json(blResponse);
}

function postSchemes(req, res) {
    let blResponse = schemeBl.addScheme(req);
    return res.status(200).json(blResponse);
}

async function putSchemes(req, res) {
    let blResponse = await schemeBl.updateScheme(req);
    return res.status(200).json(blResponse);
}

function deleteSchemes(req, res) {
    let blResponse = schemeBl.deleteScheme(req);
    return res.status(200).json(blResponse);
}

async function updateSchemesStatus(req, res) {
    let blResponse = await schemeBl.updateSchemesStatus(req);
    return res.status(200).json(blResponse);
}
//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getSchemes = getSchemes;
module.exports.postSchemes = postSchemes;
module.exports.putSchemes = putSchemes;
module.exports.deleteSchemes = deleteSchemes;
module.exports.updateSchemesStatus = updateSchemesStatus;
//#endregion