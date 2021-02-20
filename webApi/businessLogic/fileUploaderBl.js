
/**
 * Class Name: fileUploaderBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for file Uploader.
 */

//#region Imports
mongoose = require('mongoose');
const uuid = require('uuid/v4');
const common = require('../common');
const path = require('path');
//#endregion

//#region Public Functions

async function addFile(req) {
    let {file} = req.files;
    let fileName = uuid();
    let filePath = path.resolve(`../public/brochure/${fileName}.pdf`);
    file.mv(filePath, function (err) {
        if (err) {
            common.logger.error(err)
        }
    });
    return {fileName:file.name,brochureId:fileName,url:`brochure/${fileName}.pdf`}
}

async function updateFile(req) {
    let {file} = req.files;
    let brochureId = req.body.brochureId;
    let filePath = path.resolve(`../public/brochure/${brochureId}.pdf`);
    file.mv(filePath, function (err) {
        if (err) {
            common.logger.error(err)
        }
    });
    return {fileName:file.name,brochureId:brochureId,url:`brochure/${brochureId}.pdf`}
}
// #endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.addFile = addFile;
module.exports.updateFile = updateFile;
//#endregion