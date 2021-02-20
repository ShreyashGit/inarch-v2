/**
 * Class Name: commonImports
 * Author: Piyush Thacker
 * Purpose: All common imports to be kept here to avoid repetitive imports in every file
 */

const verbose = require('debug')('verbose');
const info = require('debug')('info');
const error = require('debug')('error');
const moment = require('moment');

//#region Exports
module.exports.logger = {
    verbose,
    info,
    error
};
module.exports.moment = moment;

module.exports.request = require('request');

//#endregion