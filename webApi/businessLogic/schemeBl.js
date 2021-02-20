/**
 * Class Name: schemeBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for schemes.
 */

//#region Imports
let Scheme = require('mongoose').model('Scheme');
let Division = require('mongoose').model('Division');
mongoose = require('mongoose');
const {config} = require('../config');
//#endregion

//#region Public Functions

/**
 * Gets scheme list
 * @param req
 * @returns {{p: string}}s
 */
async function getSchemes(req){
    let searchText = req.query.searchText;
    let type = req.query.type;    // 0:Super User,1:Gramin Mitra Manager,2:Gramin Mitra,3:Showroom Floor Manager,4:Showroom Floor Executive,5:Customer
    let page = req.query.currentPage;
    let pageSize = 10;
    let searchValue;
    let query = {};
    let referer = req.headers.referer || [config.BOOKING_APP_URL];

    if (referer.includes(config.BOOKING_APP_URL)){
        query['status'] = "Active";
    }

    if (type) {
        query['userType'] = type;
    }

    if (searchText && searchText !== "") {
        searchValue = '/' + searchText + '/i';
        query["$or"] = [];
        query["$or"].push({model: eval(searchValue)});
    }

    let recordsTotal = await Scheme.count(query);
    let schemeList = await Scheme.find(query).sort({updatedAt: -1})
        .skip(page===1?0: (page-1)*pageSize).limit(pageSize);
    let ids = [...new Set(schemeList.map(x => x.sectionId)), ...new Set(schemeList.map(x => x.divId)), ...new Set(schemeList.map(x => x.subSectionId))];
    let divisions = await  Division.find({_id: {$in: ids}}).select({value: 1});
    for(let item of schemeList){
        let divName = divisions.find(x => x._id.toString() === item.divId);
        let sectionName = divisions.find(x => x._id.toString() === item.sectionId);
        let subSectionName = divisions.find(x => x._id.toString() === item.subSectionId);
        item.divName = divName ? divName.value : "";
        item.sectionName = sectionName ? sectionName.value : "";
        item.subSectionName = subSectionName ? subSectionName.value : "";
    }
    return {recordsTotal: recordsTotal, records: schemeList};
}

/**
 * Gets a scheme by Id
 * @param req
 * @returns {{p: string}}
 */
async function getSchemeById(id){
    let schemes = await Scheme.find({_id: id});

    return {recordsTotal: schemes.length, records: schemes};
}

/**
 * Adds a new scheme
 * @param req
 * @returns {{p: string}}
 */
async function addScheme(req){
    let scheme = req.body.data;

    let schemeModel = new Scheme();
    schemeModel.model = scheme.model;
    schemeModel.modelId = scheme.modelId;
    schemeModel.divId = scheme.divId;
    schemeModel.sectionId = scheme.sectionId;
    schemeModel.subSectionId = scheme.subSectionId;
    schemeModel.userType = scheme.userType;
    schemeModel.incentiveDetails = scheme.incentiveDetails;
    schemeModel.status = "Active";
    schemeModel.createdBy = req.user._id;
    await schemeModel.save();
    return {records:[ schemeModel.toJSON()]};
}

/**
 * Updates an existing scheme
 * @param req
 * @returns {{p: string}}
 */
async function updateScheme(req){
    let _id = req.body._id;
    let schemes = req.body.data;
    schemes.updatedBy = req.user._id;
    delete schemes.divName;
    delete schemes.sectionName;
    delete schemes.subSectionName;
    await Scheme.update({_id: _id}, {$set: schemes});
}

/**
 * Deletes a scheme
 * @param req
 * @returns {{p: string}}
 */
function deleteScheme(req){
    return {p:"n"};
}

async function updateSchemesStatus(req) {
    let status = req.body.status;
    let schemeId = req.body._id;
    await Scheme.update({_id: schemeId}, {$set: {status: status, updatedBy: req.user._id}});
}
// #endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getSchemes = getSchemes;
module.exports.getSchemeById = getSchemeById;
module.exports.addScheme = addScheme;
module.exports.updateScheme = updateScheme;
module.exports.deleteScheme = deleteScheme;
module.exports.updateSchemesStatus = updateSchemesStatus;
//#endregion