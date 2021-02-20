/**
 * Class Name: lookupBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for lookUps.
 */

//#region Imports
let Lookup = require('mongoose').model('Lookup');
// let UassignedTaluka = require('mongoose').model('UassignedTaluka');
mongoose = require('mongoose');
//#endregion

//#region Public Functions

/**
 * Gets booking list
 * @param req
 * @returns {{p: string}}s
 */
async function getLookups(req) {

    let _id = req.query._id;
    let searchText = req.query.searchText;
    let type = req.query.type;
    let query = {};


    if (_id) {
        query['parentId'] = _id;
    }

    if (type) {
        query['tableName'] = type;
    }

    // if(type === "filterTaluka"){
    //
    //     let assignedTaluka = await UassignedTaluka.find({}).select({ talukaId:1});
    //     let assignedTalukaIds = [];
    //     assignedTaluka.forEach(x => assignedTalukaIds.push(x.talukaId));
    //     let list = await Lookup.find({ _id: {$nin: assignedTalukaIds},tableName:"taluka"});
    //     return {recordsTotal: list.length, records: list};
    // }

    if (searchText && searchText !== "") {
        searchValue = '/' + searchText + '/i';
        query["$or"] = [];
        query["$or"].push({valueName: eval(searchValue)});
        query["$or"].push({code: eval(searchValue)});
    }

    let list = await Lookup.find(query);
    return {recordsTotal: list.length, records: list};
}

/**
 * Adds a new lookup
 * @param req
 * @returns {{p: string}}
 */
async function addLookup(req) {
    let lookup = req.body;

    let lookupData = [];

    lookup.forEach((x, index) => {
        let LookupModel = new Lookup();
        LookupModel.tableName = "village";
        LookupModel.valueName = x.name;
        LookupModel.order = index + 1;
        LookupModel.parentId = "5e68bcfb6b9eeb1600519a90";
        LookupModel.code = x.code;
        LookupModel.createdBy = req.user._id;
        lookupData.push(LookupModel);
    });

    await Lookup.insertMany(lookupData);

    return {Success: true};
}

// #endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getLookups = getLookups;
module.exports.addLookup = addLookup;
//#endregion