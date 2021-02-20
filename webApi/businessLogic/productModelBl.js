/**
 * Class Name: productBl
 * Author: Piyush Thacker
 * Purpose: Business logic class for products.
 */

//#region Imports
let ProductModel = require('mongoose').model('productModel');
let Division = require('mongoose').model('Division');
let Product = require('mongoose').model('Product');
let Scheme = require('mongoose').model('Scheme');
mongoose = require('mongoose');
const {config} = require('../config');
const fileUplaod = require('./fileUploaderBl');
//#endregion

//#region Public Functions

/**
 * Gets product list
 * @param req
 * @returns {{p: string}}s
 */
async function getProductModels(req) {
    let _id = req.query._id;
    let searchText = req.query.searchText;
    let sectionId = req.query.sectionId;
    let subSectionId = req.query.subSectionId;
    let divId = req.query.divId;
    let page = parseInt(req.query.currentPage);
    let pageSize = 10;
    let query = {status : {$ne:"Delete"}};
    let sort = {updatedAt: -1, _id: -1};
    let send = req.query.type; // All, AllBooking, AllBookingAdmin

    let referer = req.headers.referer || [config.BOOKING_APP_URL];

    if (referer.includes(config.BOOKING_APP_URL))  sort = {model: 1};

    if(_id) query['_id'] = _id;

    if (divId) query['divId'] = divId;

    if (sectionId) query['sectionId'] = sectionId;

    if(subSectionId) query['subSectionId'] = subSectionId;

    if (searchText && searchText !== "") {
        searchValue = '/' + searchText + '/i';
        query["$or"] = [];
        query["$or"].push({model: eval(searchValue)});
    }

    if(send === "All"){
        let productModelList = await ProductModel.find(query).select({model:1})
        return {recordsTotal: productModelList.length, records: productModelList};
    }

    if (send === "AllBooking") return resolveModelVariants2(query, sort, send, sectionId, subSectionId, divId, page, pageSize);

    if (send === "AllBookingAdmin" )      return resolveModelVariantsAdmin(query, sort, send, sectionId, subSectionId, divId, page, pageSize);

    let recordsTotal = await ProductModel.count(query);
    let skipRecords = (page - 1) * pageSize;
    let productModelList = await ProductModel.find(query).sort(sort)
        .skip(page === 1 ? 0 : skipRecords).limit(pageSize);

    // if(sectionId || subSectionId) {
    //     let key = sectionId ? "sectionId" : "subSectionId";
    //     let records = await getModelsVarientBySubSectionId(productModelList, key);
    //     return {recordsTotal: recordsTotal, records: records};
    // }

    let Ids = [...new Set(productModelList.map(x => x.divId)), ...new Set(productModelList.map(x => x.sectionId)), ...new Set(productModelList.map(x => x.subSectionId))];
    Ids = Ids.filter(x => x);

    let divisions = await Division.find({_id: {$in: Ids}}).select({value: 1});
    for (let item of productModelList) {
        divName = divisions.find(x => x._id.toString() === item.divId);
        sectionName = divisions.find(x => x._id.toString() === item.sectionId);
        subSectionName = divisions.find(x => x._id.toString() === item.subSectionId);
        item.divName = divName ? divName.value : "";
        item.sectionName = sectionName ? sectionName.value : "";
        item.subSectionName = subSectionName ? subSectionName.value : "";
    }

    return {recordsTotal: recordsTotal, records: productModelList};
}

/**
 * Adds a new product
 * @param req
 * @returns {{p: string}}
 */
async function addProductModel(req) {
    let model = req.body.data;

    let productmodelModel = new ProductModel();
    productmodelModel.makeName = model.makeName;
    productmodelModel.status = 'Active';
    await productmodelModel.save();
    return productmodelModel;
}


/**
 * Updates an existing product
 * @param req
 * @returns {{p: string}}
 */
async function updateProductModel(req) {
    let productModel = req.body.data;
    productModel.updatedBy = req.user._id;
    delete productModel.status;
    delete productModel.variants;
    delete productModel.colorDetails;
    await ProductModel.update({_id: productModel._id}, {$set: productModel});

   let productVariant = await Product.find({modelId : productModel._id});

    if (productVariant.length > 0) {
        for (let item of productVariant) {
            let data = {
                model: productModel.model,
                modelId: productModel._id,
                divId : productModel.divId,
                sectionId : productModel.sectionId,
                subSectionId : productModel.subSectionId,
                productName: productModel.model + " " + item.variant,
                updatedBy : req.user._id
            };
            await Product.update({_id: item._id}, {$set: data});
        }
    }

    await Scheme.update({modelId: productModel._id}, {
        $set: {
            model: productModel.model,
            updatedBy: req.user._id
        }
    }, {multi: true});

    return getProductModelById(productModel._id);
}

async function updateModelStatus(req) {
    let productModel = req.body.data;
    await ProductModel.update({_id: productModel._id}, {
        $set: {
            status: productModel.status,
            updatedBy : req.user._id
        }
    });
    let productVariant = await Product.find({modelId: productModel._id});
    let Ids = productVariant.map(x => x._id);
    await Product.update({_id: {$in: Ids}}, {$set: {status: productModel.status}}, {multi: true});

    return getProductModelById(productModel._id);

}

async function addImages(req) {
    let imageObj = req.body.data;

    let response = await Product.update({
            modelId: imageObj.modelId, colorDetails: {$elemMatch: {dummy: true}},
            status: {$ne: "Delete"}
        },
        {
            $set: {
                "colorDetails.$[element].colorName": imageObj.imageMetadata.colorName,
                "colorDetails.$[element].colorCode": imageObj.imageMetadata.colorCode,
                "colorDetails.$[element].image": imageObj.imageMetadata.image,
                "colorDetails.$[element].dummy": false
            }
        },
        {arrayFilters: [{"element.dummy": true}], multi: true}
    );
    if(response.nModified > 0){
        return {"status" : true};
    }
    await Product.update(  {modelId: imageObj.modelId,
        $or: [{colorDetails: {$elemMatch: {dummy: {$in: [false, undefined]}}}} , {
            colorDetails: {
                $exists: true,
                $size: 0
            }
        }],
        status : {$ne:"Delete"}},  { $push: { colorDetails: imageObj.imageMetadata}}, {multi:true});
return {"status" : true}
}

async function addAccessories(req) {
    let AccObj = req.body.data.accessoryDetails;
    let key = req.body.data.key === "default" ? "defaultAccessories" : "customAccessories";
    await Product.update(  {modelId:  req.body.data.modelId , status : {$ne:"Delete"}},  { $push: { [key]: AccObj}}, {multi:true});
    if(key === "defaultAccessories"){
        await Product.updateMany({
            modelId:  req.body.data.modelId , status : {$ne:"Delete"}, "priceDetails.key" : "ACCESSORIES"
        },
        {$inc: {"priceDetails.$.amount": AccObj.amount}});
    }
    return {"status" : true}
}

async function addBrochure(req) {
    let { modelId } = req.body;
    let products = await Product.find({modelId: modelId});
    for(let product of products){
        if(product.brochureId){
            // req.files = req.files;
            req.body.brochureId = product.brochureId;
            let response = await fileUplaod.updateFile(req);
            product.fileName = response.fileName;
            await Product.update({_id: product._id}, {$set: product});
        }
        if(!product.brochureId){
            let response = await fileUplaod.addFile(req);
            product.brochureUrl = response.url;
            product.brochureId = response.brochureId;
            product.fileName = response.fileName;
            await Product.update({_id: product._id}, {$set: product});
        }
    }

    return {"status" : true}
}

/**
 * Deletes a product
 * @param req
 * @returns {{p: string}}
 */
function deleteProductModel(req) {

}


// #endregion

//#region Private Functions

async function resolveModelVariants2(query, sort, send, sectionId, subSectionId, divId, page, pageSize) {
    let key = sectionId ? "sectionId" : "subSectionId";
    query['status'] = "Active";
    let allModels = await Product.find(query).distinct("modelId");
    let recordsTotal = allModels.length;
    let skipRecords = (page - 1) * pageSize;
    let filtertModel = await Product.aggregate(
        [
            {"$match": query},
            {"$group": {"_id": "$modelId", model: { $max: "$model" } }},
            {"$sort": {"model": 1}},
            {"$skip": page === 1 ? 0 : skipRecords},
            {"$limit": pageSize}
        ]
    );

    let modelIds = [...new Set(filtertModel.map(x => x._id.toString()))];
    let productModelList = await ProductModel.find({_id: {$in: modelIds}}).sort({model: 1});
    let ids = [...new Set(productModelList.map(x => x[key]))];
    let products = await Product.find({[key]: {$in: ids}, modelId: {$in: modelIds}, status: "Active"});
    let variants = products.map((item) => {
        return {
            _id: item._id,
            productName: item.productName,
            modelId: item.modelId
        }
    });

    productModelList.forEach(item => {
        let product = products.find(x => x[key] === item[key] && x.modelId === item._id.toString());
        item.variants = variants.filter(x => x.modelId === String(item._id));
        item.colorDetails = product ?  product.colorDetails : {};
    });


    return {recordsTotal: recordsTotal, records: productModelList};

}

async function resolveModelVariantsAdmin(query, sort, send, sectionId, subSectionId, divId, page, pageSize) {
    query['status'] = "Active";
    let productModelList = [];
    productModelList = await ProductModel.find(query).sort(sort);

    let key = sectionId ? "sectionId" : "subSectionId";
    let ids = [...new Set(productModelList.map(x => x[key]))];
    let modelIds = [...new Set(productModelList.map(x => x._id.toString()))];
    let products = await Product.find({[key]: {$in: ids}, modelId: {$in: modelIds}, status: "Active"});
    let variants = products.map((item) => {
        return {
            _id: item._id,
            productName: item.productName,
            modelId: item.modelId
        }
    });
    productModelList.forEach(item => {
        let product = products.find(x => x[key] === item[key] && x.modelId === item._id.toString());
        if (product) item.variants = variants.filter(x => x.modelId === String(item._id))
    });

    return {recordsTotal: productModelList.length, records: productModelList};

}

async function getProductModelById(id) {

    let productModelList = await ProductModel.find({_id: id});
    let Ids = [...new Set(productModelList.map(x => x.divId)), ...new Set(productModelList.map(x => x.sectionId)), ...new Set(productModelList.map(x => x.subSectionId))];
    Ids = Ids.filter(x => x);

    let divisions = await Division.find({_id: {$in: Ids}}).select({value: 1});
    for (let item of productModelList) {
        divName = divisions.find(x => x._id.toString() === item.divId);
        sectionName = divisions.find(x => x._id.toString() === item.sectionId);
        subSectionName = divisions.find(x => x._id.toString() === item.subSectionId);
        item.divName = divName ? divName.value : "";
        item.sectionName = sectionName ? sectionName.value : "";
        item.subSectionName = subSectionName ? subSectionName.value : "";
    }
    return productModelList
}

//#endregion

//#region Exports
module.exports.getProductModels = getProductModels;
module.exports.addProductModel = addProductModel;
module.exports.updateProductModel = updateProductModel;
module.exports.deleteProductModel = deleteProductModel;
module.exports.updateModelStatus = updateModelStatus;
module.exports.addImages = addImages;
module.exports.addAccessories = addAccessories;
module.exports.addBrochure = addBrochure;
//#endregion