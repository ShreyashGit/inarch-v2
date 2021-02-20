/**
 * Class Name: lookupBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for divisions.
 */

//#region Imports
let ProductModel = require('mongoose').model('productModel');
let Division = require('mongoose').model('Division');
let Product = require('mongoose').model('Product');
let Template = require('mongoose').model('Template');
let  UserAssignedSectionSchema = require('mongoose').model('UserAssignedSection');
const User = require('../models/user.model');
let PaymentSetting = require('mongoose').model('PaymentSetting');
mongoose = require('mongoose');
const {config} = require('../config');
//#endregion

//#region Public Functions

async function getDivision(req) {
    let parentId = req.query._id;
    let childType = req.query.childType;
    let divId = req.query.divId;
    let referer = req.headers.referer || [config.BOOKING_APP_URL];
    let query = {$ne:"Delete"};
    if (referer.includes(config.BOOKING_APP_URL))query = "Active";
    if(parentId) return await getChildById({parentId: parentId,status : query}, childType);
    if(divId) return await getChildById({divId: divId, status : query}, childType);

    let divisionQuery ={type: 1, status : query};
    if(req.user.type === 2 || req.user.type === 4) divisionQuery['_id'] = {$nin: req.user.notAssignedDivision};
    let divisions = await Division.find(divisionQuery).select({updatedAt: 0, updatedBy: 0});

    let divIdIds = [...new Set(divisions.map(x => x._id.toString()))];

    if(req.query.settings){
        let productSettingList = await PaymentSetting.find({divId : {$in: divIdIds}}).select({
            accName: 1,
            bnkName: 1,
            accNo: 1,
            ifsc: 1,
            branch: 1,
            gstNo: 1,
            divName:1,
            divId: 1
        });

        for(let item of divisions){
           paySetting =  productSettingList.find(x => x.divId === item._id.toString());
            item.cashSetting =  paySetting
        }
    }
    return {recordsTotal:divisions.length, records: divisions};
}

async function postDivision(req) {
    let parentName = req.body.parentName;
    let childSection = req.body.childSection;

    return saveSection(parentName,childSection);
}

async function updateDivision(req) {
    let updateItems = req.body.updateItems;
    let division = req.body.division;
    let updateData = updateItems.filter(x => x._id);
    let insertData = updateItems.filter(x => !x._id);
    let childType =  req.body.childType;

    if(division){
        await Division.update({_id: division._id}, {$set: division})
    }

    for (let item of updateData) {
       await Division.update({_id: item._id}, {$set: item})
    }

    if(childType === 2){
        let childSectionDetails = [];
        insertData.forEach((x, index) => {
            let childDivisionModel = new Division();
            childDivisionModel.value = x.value;
            childDivisionModel.parentId = x.parentId;
            childDivisionModel.type = x.type;
            childDivisionModel.status= "Active";
            childDivisionModel.seqNo = x.seqNo;
            childSectionDetails.push(childDivisionModel);
        });
        let subChildSectionDetails = [];
        childSectionDetails.forEach((x, index) => {
            let subChildDivisionModel = new Division();
            subChildDivisionModel.value = x.value;
            subChildDivisionModel.parentId = x._id;
            subChildDivisionModel.divId = x.parentId;
            subChildDivisionModel.type = 3;
            subChildDivisionModel.status= "Active";
            subChildDivisionModel.seqNo = x.seqNo;
            subChildSectionDetails.push(subChildDivisionModel);
        });
        await Division.insertMany(childSectionDetails.concat(subChildSectionDetails));
    }

    if(childType === 3){
        let subChildSectionDetails = [];
            insertData.forEach((x, index) => {
            let subChildDivisionModel = new Division();
            subChildDivisionModel.value = x.value;
            subChildDivisionModel.parentId = x.parentId;
            subChildDivisionModel.divId = x.divId;
            subChildDivisionModel.type = 3;
            subChildDivisionModel.status= "Active";
            subChildSectionDetails.push(subChildDivisionModel);
        });
        await Division.insertMany(subChildSectionDetails);
    }
    return {Success: true};
}

async function updateDivisionStatus(req) {
    let data = req.body.data;
    await Division.update({_id: data._id}, {
        $set: {
            status: data.status,
            updatedBy : req.user._id
        }
    });
    if (Number(data.type) === 1) {
        let section = await Division.find({parentId: data._id});
        let sectionIds = section.map(x => x._id);
        await Division.update({_id: {$in: sectionIds}, status : {$ne:"Delete"}}, {$set: {status: data.status}}, {multi: true});

        let subSection = await Division.find({divId: data._id});
        let subSectionIds = subSection.map(x => x._id);
        await Division.update({_id: {$in: subSectionIds}, status : {$ne:"Delete"}}, {$set: {status: data.status}}, {multi: true});

        let productModel = await ProductModel.find({divId: data._id});
        let productModelIds = productModel.map(x => x._id);
        await ProductModel.update({_id: {$in: productModelIds}, status : {$ne:"Delete"}}, {$set: {status: data.status}}, {multi: true});

        let productVariant = await Product.find({divId: data._id});
        let productVariantIds = productVariant.map(x => x._id);
        await Product.update({_id: {$in: productVariantIds}, status : {$ne:"Delete"}}, {$set: {status: data.status}}, {multi: true});

        return {success:"true"}
    }
    if (Number(data.type) === 2) {
        let subSection = await Division.find({parentId: data._id});
        let subSectionIds = subSection.map(x => x._id);
        await Division.update({_id: {$in: subSectionIds}, status : {$ne:"Delete"}}, {$set: {status: data.status}}, {multi: true});

        let productModel = await ProductModel.find({sectionId: data._id});
        let productModelIds = productModel.map(x => x._id);
        await ProductModel.update({_id: {$in: productModelIds}, status : {$ne:"Delete"}}, {$set: {status: data.status}}, {multi: true});

        let productVariant = await Product.find({sectionId: data._id});
        let productVariantIds = productVariant.map(x => x._id);
        await Product.update({_id: {$in: productVariantIds}, status : {$ne:"Delete"}}, {$set: {status: data.status}}, {multi: true});

        return {success:"true"}
    }

    if (Number(data.type) === 3) {
        let productModel = await ProductModel.find({subSectionId: data._id});
        let productModelIds = productModel.map(x => x._id);
        await ProductModel.update({_id: {$in: productModelIds}}, {$set: {status: data.status}}, {multi: true});

        let productVariant = await Product.find({subSectionId: data._id});
        let productVariantIds = productVariant.map(x => x._id);
        await Product.update({_id: {$in: productVariantIds}}, {$set: {status: data.status}}, {multi: true});

        return {success:"true"}
    }

}

async function getFiltredSection(req) {
    let divId = req.query.divId;
    let userId = req.query.managerId;
    if(!divId) return {recordsTotal: 0, records: [], divId: ""};

    let allSection = await Division.find({parentId: divId, status : "Active"}).select({updatedAt: 0, updatedBy: 0});
    if(userId){
        let assignedSection = await UserAssignedSectionSchema.find({managerId: userId, divId: divId}).select({updatedAt: 0, updatedBy: 0});

        allSection.forEach(x=>{
            x.selected = !!assignedSection.find(y => y.sectionId === x._id.toString());
        });

        return {recordsTotal: allSection.length, records: allSection, divId: divId};
    }
    return {recordsTotal: allSection.length, records: allSection, divId: divId};

    // if(divId && !userId){
    //     let assignedSections = await UserAssignedSectionSchema.find({divId: divId}).select({updatedAt: 0, updatedBy: 0});
    //     let assignedSectionIds =  [...new Set(assignedSections.map(x => x.sectionId.toString()))];
    //     let notAssignedSections = await Division.find({parentId: divId, _id: {$nin: assignedSectionIds}, status : "Active"}).select({updatedAt: 0, updatedBy: 0});
    //     notAssignedSections.forEach(x => x.selected = false);
    //     return {recordsTotal: notAssignedSections.length, records: notAssignedSections, divId: divId};
    //     // }
    // }
    //
    // let assignedSections = await UserAssignedSectionSchema.find({managerId: userId, divId: divId}).select({updatedAt: 0, updatedBy: 0});
    // let assignedSectionIds = assignedSections.length ===0 ? [] : [...new Set(assignedSections.map(x => x.sectionId.toString()))];
    // let notAssignedSections = await Division.find({parentId: divId, _id: {$nin: assignedSectionIds},status :"Active"}).select({updatedAt: 0, updatedBy: 0});
    // let newAssignedSections = await Division.find({parentId: divId, _id: {$in: assignedSectionIds},status : "Active"}).select({updatedAt: 0, updatedBy: 0});
    // newAssignedSections.forEach(x => x.selected = true);
    // notAssignedSections.forEach(x => x.selected = false);
    // let data = newAssignedSections.concat(notAssignedSections);
    // return {recordsTotal: data.length, records: data, divId: divId};
}


//# Template BL

async function getTemplate(req){
    let templateId = req.query._id;
    if(templateId) return await getTemplateById(templateId);
    let templates = await Template.find().select({updatedAt: 0, updatedBy: 0});
    return {recordsTotal:templates.length, records: templates};
}

async function postTemplate(req){
    let template = req.body.data;
    
    let templateModel = new Template();
    templateModel.divId = template.divId,
    templateModel.divName = template.divName,
    templateModel.headerTitle = template.headerTitle,
    templateModel.documentType = template.documentType,
    templateModel.terms = template.terms,
    templateModel.logoImg = template.logoImg,
    templateModel.bookingWatermarkTxt = template.bookingWatermarkTxt,
    templateModel.cancelWatermarkTxt = template.cancelWatermarkTxt,
    templateModel.address = template.address,
    templateModel.receiptHeight = template.receiptHeight,
    templateModel.receiptWidth = template.receiptWidth,
    templateModel.createdBy = template.createdBy
    
    await templateModel.save();
    return templateModel;
}

async function updateTemplate(req){
    let _id = req.body._id;
    let template = req.body.data;
    let response = await Template.findOneAndUpdate({_id: _id}, {$set: template}, {new: true});
    return {records: [response]};
}

async function deleteTemplate(req){
    return {Success: true};
}

// #endregion

//#region Private Functions
async function saveSection(parentName,childSection){
    let parentDivisionModel = new Division();
    parentDivisionModel.value = parentName;
    parentDivisionModel.parentId = "";
    parentDivisionModel.type = 1;
    parentDivisionModel.status= "Disabled";
    await parentDivisionModel.save();

    let childSectionDetails = [];
    childSection.forEach((x, index) => {
        let childDivisionModel = new Division();
        childDivisionModel.value = x.value;
        childDivisionModel.parentId = parentDivisionModel._id;
        childDivisionModel.type = 2;
        childDivisionModel.seqNo = x.seqNo;
        childDivisionModel.status= "Active";
        childSectionDetails.push(childDivisionModel);
    });
    let subChildSectionDetails = [];
    childSectionDetails.forEach((x, index) => {
        let subChildDivisionModel = new Division();
        subChildDivisionModel.value = x.value;
        subChildDivisionModel.parentId = x._id;
        subChildDivisionModel.divId = x.parentId;
        subChildDivisionModel.status= "Active";
        subChildDivisionModel.seqNo = x.seqNo;
        subChildDivisionModel.type = 3;
        subChildSectionDetails.push(subChildDivisionModel);
    });
    await Division.insertMany(childSectionDetails.concat(subChildSectionDetails));
     return {_id : parentDivisionModel._id , divisionName : parentName, sections : childSectionDetails}
}

async function getChildById(query, childType) {

    let childs = await Division.find(query).select({updatedAt: 0, updatedBy: 0});

    return {recordsTotal: childs.length, records: childs, childType: parseInt(childType)};
}

async function getTemplateById(templateId) {
    let template = await Template.find({_id: templateId}).select({updatedAt: 0, updatedBy: 0});

    return {recordsTotal: template.length, records: template};
}
//#endregion

//#region Exports
module.exports.getDivision = getDivision;
module.exports.postDivision = postDivision;
module.exports.updateDivision = updateDivision;
module.exports.updateDivisionStatus = updateDivisionStatus;
module.exports.getFiltredSection = getFiltredSection;

module.exports.getTemplate = getTemplate;
module.exports.postTemplate = postTemplate;
module.exports.updateTemplate = updateTemplate;
module.exports.deleteTemplate = deleteTemplate;
//#endregion