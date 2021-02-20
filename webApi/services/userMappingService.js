/**
 * Class Name: userMappingService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to User Mapping.
 */

//#region Imports
const userMappingBl = require("../businessLogic/userMappingBl");
//#endregion

//#region Public Functions
async function getUserMapping(req, res) {
    let blResponse = await userMappingBl.getUserMapping(req);
    return res.status(200).json(blResponse);
}

async function addUserMapping(req, res) {
    let blResponse = await userMappingBl.addUserMapping(req);
    return res.status(200).json(blResponse);
}

async function updateUserMapping(req, res) {
    let blResponse = await userMappingBl.updateUserMapping(req);
    return res.status(200).json(blResponse);
}

async function deleteUserMapping(req, res) {
    let blResponse = await userMappingBl.deleteUserMapping(req);
    return res.status(200).json(blResponse);
}

async function getAvailableSubSection(req, res) {
    let blResponse = await userMappingBl.getAvailableSubSection(req);
    return res.status(200).json(blResponse);
}

//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getUserMapping = getUserMapping;
module.exports.addUserMapping = addUserMapping;
module.exports.updateUserMapping = updateUserMapping;
module.exports.deleteUserMapping = deleteUserMapping;
module.exports.getAvailableSubSection = getAvailableSubSection;
//#endregion