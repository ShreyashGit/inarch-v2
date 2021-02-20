/**
 * Class Name: fileUploaderService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to file Uploader.
 */

//#region Imports
const financierBl = require("../businessLogic/fileUploaderBl");
//#endregion

//#region Public Functions
async function postFiles(req, res) {
    let blResponse = await financierBl.addFile(req);
    return res.status(200).json(blResponse);
}

async function putFiles(req, res) {
    let blResponse = await financierBl.updateFile(req);
    return res.status(200).json(blResponse);
}

//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.postFiles = postFiles;
module.exports.putFiles = putFiles;
//#endregion