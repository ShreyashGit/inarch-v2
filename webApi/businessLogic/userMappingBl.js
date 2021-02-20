/**
 * Class Name: lookupBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for divisions.
 */

//#region Imports
let Division = require('mongoose').model('Division');
let UserMapping = require('mongoose').model('UserMapping');

mongoose = require('mongoose');
//#endregion

//#region Public Functions

async function getUserMapping(req) {
    let userId = req.query.userId;
    let userMappingData = await UserMapping.find({userId:userId}).select({updatedAt: 0, updatedBy: 0});

    let divIds = [];
    userMappingData.forEach(x =>{ divIds.push(x.divId) ;divIds.push(x.sectionId); divIds.push(x.subSectionId);});
     divIds = [...new Set(divIds)];

    let divisionData = await Division.find({_id:{$in: divIds}}).select({value:1});

    userMappingData.forEach(item => {
        if(item.divId){
            let divItem = divisionData.find(x => x._id.toString() === item.divId.toString());
            item.divName = divItem.value;
        }

        if(item.sectionId){
            let sectionItem = divisionData.find(x => x._id.toString() === item.sectionId.toString());
            item.sectionName = sectionItem.value;
        }

        if(item.subSectionId){
            let subSectionItem = divisionData.find(x => x._id.toString() === item.subSectionId.toString());
            item.subSectionName = subSectionItem.value;
        }
    });

    return {recordsTotal: userMappingData.length, records: userMappingData};

}

async function addUserMapping(req) {
    let data = req.body.data;
    let mappingData = [];

    data.forEach((x, index) => {
        let UserMappingModel = new UserMapping();
        UserMappingModel.divId = x.divId;
        UserMappingModel.sectionId = x.sectionId;
        UserMappingModel.userId = x.userId;
        UserMappingModel.subSectionId = x.subSectionId;
        UserMappingModel.taluka = x.taluka;
        UserMappingModel.talukaId = x.talukaId;
        // UserMappingModel.createdBy = req.user._id;
        mappingData.push(UserMappingModel);
    });

    await UserMapping.insertMany(mappingData);
}

async function updateUserMapping(req) {
    let data = req.body.data;

    for( let item of data){
        await UserMapping.update({_id: item._id}, {$set: item});
    }
}

async function deleteUserMapping(req) {
    let data = req.body.data;
    deleteMappingIds = data.map(x => x._id);
    await UserMapping.deleteMany({_id:{$in:deleteMappingIds}})
}

async function getAvailableSubSection(req){
    let divId = req.query.divId;
    let sectionId = req.query.sectionId;
    let talukaId = req.query.talukaId;

    let userMappingData = await UserMapping.find({talukaId:talukaId}).select({subSectionId: 1});
    let subSectionIds = userMappingData.map(x => x.subSectionId);
    let childs = await Division.find({parentId: sectionId.toString(), _id: {$nin: subSectionIds}, status:"Active"}).select({
        updatedAt: 0,
        updatedBy: 0
    });
    return {recordsTotal: childs.length, records: childs, childType: 3};
}


// #endregion

//#region Private Functions
async function getChildById(query, childType) {

    let childs = await Division.find(query).select({updatedAt: 0, updatedBy: 0});

    return {recordsTotal: childs.length, records: childs, childType: parseInt(childType)};
}
//#endregion

//#region Exports
module.exports.getUserMapping = getUserMapping;
module.exports.addUserMapping = addUserMapping;
module.exports.updateUserMapping = updateUserMapping;
module.exports.deleteUserMapping = deleteUserMapping;
module.exports.getAvailableSubSection = getAvailableSubSection;
//#endregion