/**
 * Class Name: financierBl
 * Author: Piyush Thacker
 * Purpose: Business logic class for financiers.
 */

//#region Imports
let Financier = require('mongoose').model('Financier');
let FinancierEmiDetails = require('mongoose').model('FinancierEmi');
let Moment = require('moment');
//#endregion

//#region Public Functions

/**
 * Gets financier list
 * @param req
 * @returns {{p: string}}s
 */
async function getFinanciers(req) {

    let searchText = req.query.searchText;
    let talukaId = req.query.talukaId;
    let searchValue = '';
    let query = {};
    let page = req.query.currentPage;
    let pageSize = 10;

    if(talukaId){
        query['talukaId'] = talukaId;
    }

    if (searchText && searchText !== "") {
        searchValue = '/' + searchText + '/i';
        query["$or"] = [];
        query["$or"].push({financerName: eval(searchValue)});
        query["$or"].push({talukaName: eval(searchValue)});
        query["$or"].push({documentNo: eval(searchValue)});
    }

    let selectQuery = {
        agencyName: 1,
        financerName: 1,
        phoneNumber: 1,
        talukaName: 1,
        status: 1,
        createdAt: 1,
        documentNo: 1
    };
    let recordsTotal = await Financier.count(query);
    let financierList = await Financier.find(query).select(selectQuery).sort({updatedAt: -1})
        .skip(page === 1? 0: (page-1)*pageSize).limit(pageSize);

    return {recordsTotal: recordsTotal, records: financierList};
}


/**
 * Adds a new financier
 * @param req
 * @returns {{p: string}}
 */
async function addFinancier(req) {
    let financier = req.body.data;

    let financierModel = new Financier();
    financierModel.agencyName = financier.agencyName;
    financierModel.financerName = financier.financerName;
    financierModel.phoneNumber = financier.phoneNumber;
    financierModel.emailId = financier.emailId;
    financierModel.address = financier.address;
    financierModel.documentCharges = financier.documentCharges;
    financierModel.processingCharges = financier.processingCharges;
    financierModel.irr = financier.irr;
    financierModel.discount = financier.discount;
    financierModel.talukaId = financier.talukaId;
    financierModel.talukaName = financier.talukaName;
    financierModel.status = 'Active';
    financierModel.createdBy = req.user._id;
    await financierModel.save();

    let emiDetails = [];
    financier.emiDetails.forEach((x, index) => {
        let financierEmiDetails = new FinancierEmiDetails();
        financierEmiDetails.min = x.min;
        financierEmiDetails.max = x.max;
        financierEmiDetails.loanTenure = x.loanTenure;
        financierEmiDetails.roi = x.roi;
        financierEmiDetails.financerId = financierModel._id;
        financierEmiDetails.createdBy = req.user._id;
        emiDetails.push(financierEmiDetails);
    });
    await FinancierEmiDetails.insertMany(emiDetails);

    return financierModel;
}

/**
 * Updates an existing financier
 * @param req
 * @returns {{p: string}}
 */
async function updateFinancier(req) {
    let _id = req.body._id;
    let financier = req.body.data;
    delete financier.status;
    await FinancierEmiDetails.remove({financerId: financier._id});

    for (let i = 0; i <financier.emiDetails.length; i++) {
        let financierEmiDetails = new FinancierEmiDetails();
        financierEmiDetails.min = financier.emiDetails[i].min;
        financierEmiDetails.max = financier.emiDetails[i].max;
        financierEmiDetails.loanTenure = financier.emiDetails[i].loanTenure;
        financierEmiDetails.roi = financier.emiDetails[i].roi;
        financierEmiDetails.financerId = financier._id;
        financierEmiDetails.createdBy = req.user._id;
        await financierEmiDetails.save();

    }

    financier.emiDetails=[];
    financier.updatedBy = req.user._id;
    await Financier.update({_id: _id}, {$set: financier});
}

/**
 * Deletes a financier
 * @param req
 * @returns {{p: string}}
 */
function deleteFinancier(req) {
    return {recordsTotal: 2, records: [{p: "n"},{z:"ff"}]};
}

async function updateFinanciersStatus(req) {
    let status = req.body.status;
    let financierId = req.body._id;
    await Financier.update({_id: financierId}, {$set: {status: status, updatedBy: req.user._id}});
}

// #endregion

//#region Private Functions

async function getFinancierById(id) {
    financier = await Financier.find({_id: id}).select({updatedAt: 0, updatedBy: 0});
    financierEmiDetails = await FinancierEmiDetails.find({financerId: financier[0]._id}).select({updatedAt: 0, updatedBy: 0});
    financier[0].emiDetails = financierEmiDetails;
    return {recordsTotal: financier.length, records: financier};
}

async function getFinancierByTenure(amount , tenure){
    let emiQuery = {};

    emiQuery['loanTenure'] = tenure;
    emiQuery['min'] = {$lte:amount};
    emiQuery['max'] = {$gte:amount};

    let emiDetails = await FinancierEmiDetails.find(emiQuery).select({updatedAt: 0, updatedBy: 0});
    if(emiDetails.length > 0){
        let financer =[];
        for (let i = 0; i < emiDetails.length; i++) {
            if(financer.find(x=>x._id.toString() === emiDetails[i].financerId)){
                financer.find(x=>x._id.toString() === emiDetails[i].financerId).emiDetails.push(emiDetails[i])
            }else{
                let data = await Financier.findOne({_id:emiDetails[i].financerId,status:"Active"});
                if(data){
                    data.emiDetails.push(emiDetails[i]);
                    financer.push(data);
                }
            }
        }
        return {recordsTotal: financer.length, records: financer};
    }
    else  return {recordsTotal: 0, records: []};
}
//#endregion

//#region Exports
module.exports.getFinanciers = getFinanciers;
module.exports.getFinancierById = getFinancierById;
module.exports.addFinancier = addFinancier;
module.exports.updateFinancier = updateFinancier;
module.exports.deleteFinancier = deleteFinancier;
module.exports.getFinancierById = getFinancierById;
module.exports.getFinancierByTenure = getFinancierByTenure;
module.exports.updateFinanciersStatus = updateFinanciersStatus;
//#endregion