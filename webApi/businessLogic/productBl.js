/**
 * Class Name: productBl
 * Author: Piyush Thacker
 * Purpose: Business logic class for products.
 */

//#region Imports
let Product = require('mongoose').model('Product');
mongoose = require('mongoose');
let Moment = require('moment');
const {config} = require('../config');
//#endregion

//#region Public Functions

/**
 * Gets product list
 * @param req
 * @returns {{p: string}}s
 */
async function getProducts(req) {
    let searchText = req.query.searchText;
    let type = req.query.type;
    let divId = req.query.divId;
    let modelId = req.query.modelId;
    let page = req.query.currentPage;
    let isExcel = req.query.isExcel;
    let pageSize = req.query.pageSize ? parseInt(req.query.pageSize): 10;
    let referer = req.headers.referer || [config.BOOKING_APP_URL];
    let query = {};
    let searchValue;
    let selectQuery;

    if(modelId && req.query.send === "All") return getAllProductsByModelId(modelId);

    query['status'] = {$ne:"Delete"};

    if (referer.includes(config.BOOKING_APP_URL)){
        query['status'] = "Active";
    }

    if (divId) query['divId'] = divId;

    if (modelId) query['modelId'] = modelId;

    if(isExcel) {
        query['excelStatus'] = "imported";
        query['lastUpdatedSource'] = "excel";
        query['status'] = "Disabled";
    }

    if (searchText && searchText !== "") {
        searchValue = '/' + searchText + '/i';
        query["$or"] = [];
        query["$or"].push({productName: eval(searchValue)});
        query["$or"].push({status: eval(searchValue)});
        query["$or"].push({documentNo: eval(searchValue)});
    }

    if (type === "Options") {
        selectQuery = {productName: 1}
    }else {
        selectQuery = {
            type: 1,
            productName: 1,
            priceDetails: 1,
            status: 1,
            createdAt: 1,
            colorDetails: 1,
            documentNo: 1,
            brochureUrl: 1,
            variant : 1
        };
    }

    let recordsTotal = await Product.count(query);
    let productList = await Product.find(query).select(selectQuery).sort({productName: 1})
        .skip(page===1? 0: (page-1)*pageSize).limit(pageSize);

    if ( type !== "Options") {
        productList.forEach(x => {
            x.colorDetails = x.colorDetails[0];
            x.priceDetails = x.priceDetails[0];
        });
    }

    return {recordsTotal: recordsTotal, records: productList};

}

/**
 * Adds a new product
 * @param req
 * @returns {{p: string}}
 */
async function addProduct(req) {
    let product = req.body.data;

    let productModel = new Product();
    productModel.type = product.type;
    productModel.modelId = product.modelId;
    productModel.divId = product.divId;
    productModel.sectionId = product.sectionId;
    productModel.subSectionId = product.subSectionId;
    productModel.vcNo = product.vcNo;
    productModel.description = product.description;
    productModel.model = product.model;
    productModel.variant = product.variant;
    productModel.productName = product.model + " " + product.variant;
    productModel.totalPrice = product.totalPrice;
    productModel.brochureUrl = product.brochureUrl;
    productModel.brochureId = product.brochureId;
    productModel.fileName = product.fileName;
    productModel.insuranceDetails = product.insuranceDetails;
    productModel.defaultAccessories = product.defaultAccessories;
    productModel.customAccessories = product.customAccessories;
    productModel.priceDetails = product.priceDetails;
    productModel.colorDetails = product.colorDetails;
    productModel.compare = product.compare;
    productModel.companyOffers = product.companyOffers;
    productModel.status = 'Disabled';
    productModel.createdBy = req.user._id;
    await productModel.save();
    return productModel;
}


/**
 * Updates an existing product
 * @param req
 * @returns {{p: string}}
 */
async function updateProduct(req) {
    let _id = req.body._id;
    let product = req.body.data;
    delete product.status;
    product.updatedBy = req.user._id;
    product.productName = product.model + " " + product.variant;
    product.excelStatus = 'processed';
    product.lastUpdatedSource = 'portal';

    await Product.update({_id: _id}, {$set: product});

}

/**
 * Deletes a product
 * @param req
 * @returns {{p: string}}
 */
function deleteProduct(req) {
    return {p: "Status updated"};
}

function getProductsImages(req){
    return {p:"hello"}
}

async function updateProductsStatus(req) {
    let isExcel =  req.body.isExcel;
    let productList =  req.body.productList;
    let status = req.body.status;
    let ProductId = req.body._id;

    if(isExcel){
        let ids = [...new Set(productList.map(x => x._id.toString()))];
        let setData = {
            status: "Active",
            excelStatus: 'processed',
            lastUpdatedSource: 'portal',
            updatedBy: req.user._id
        };
        await Product.update({_id: {$in: ids}}, {$set: setData}, {multi: true});
        return {success: true}
    }
    await Product.update({_id: ProductId}, {$set: {status: status, updatedBy: req.user._id}});
    return {success: true}
}

// #endregion

//#region Private Functions

async function getProductById(id) {
    let products = await Product.find({_id: id}).select({updatedAt: 0, updatedBy: 0});
    return {recordsTotal: products.length, records: products};
}

async function getAllProductsByModelId(modelId) {
    let products = await Product.find({modelId: modelId}).select({productName: 1, type: 1, variant: 1});
    return {recordsTotal: products.length, records: products};
}


//#endregion

//#region Exports
module.exports.getProducts = getProducts;
module.exports.addProduct = addProduct;
module.exports.updateProduct = updateProduct;
module.exports.deleteProduct = deleteProduct;
module.exports.getProductsImages = getProductsImages;
module.exports.getProductById = getProductById;
module.exports.updateProductsStatus = updateProductsStatus;
//#endregion
