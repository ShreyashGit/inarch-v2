/**
 * Class Name: divisionService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to divisions.
 */

//#region Imports
const divisionBl = require("../businessLogic/divisionBl");
//#endregion

//#region Public Functions
async function getDivision(req, res) {
    let blResponse = await divisionBl.getDivision(req);
    return res.status(200).json(blResponse);
}

async function putDivision(req, res) {
    let blResponse = await divisionBl.updateDivision(req);
    return res.status(200).json(blResponse);
}

async function postDivision(req, res) {
    let blResponse = await divisionBl.postDivision(req);
    return res.status(200).json(blResponse);
}

async function updateDivisionStatus(req, res) {
    let blResponse = await divisionBl.updateDivisionStatus(req);
    return res.status(200).json(blResponse);
}

async function getFiltredSection(req, res) {
    let blResponse = await divisionBl.getFiltredSection(req);
    return res.status(200).json(blResponse);
}

//#Template Functions
async function getTemplate(req, res) {
    let blResponse = await divisionBl.getTemplate(req);
    return res.status(200).json(blResponse);
}

async function putTemplate(req, res) {
    let blResponse = await divisionBl.updateTemplate(req);
    return res.status(200).json(blResponse);
}

async function postTemplate(req, res) {
    let blResponse = await divisionBl.postTemplate(req);
    return res.status(200).json(blResponse);
}

async function deleteTemplate(req, res) {
    let blResponse = await divisionBl.putTemplate(req);
    return res.status(200).json(blResponse);
}


//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getDivision = getDivision;
module.exports.postDivision = postDivision;
module.exports.putDivision = putDivision;
module.exports.updateDivisionStatus = updateDivisionStatus;
module.exports.getFiltredSection = getFiltredSection;

module.exports.getTemplate = getTemplate;
module.exports.postTemplate = postTemplate;
module.exports.putTemplate = putTemplate;
module.exports.deleteTemplate = deleteTemplate;
//#endregion