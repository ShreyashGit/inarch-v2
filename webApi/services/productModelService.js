/**
 * Class Name: productModelService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to productModels.
 */

//#region Imports
const productModelBl = require("../businessLogic/productModelBl");
//#endregion

//#region Public Functions
async function getProductModels(req, res) {
    let blResponse = await productModelBl.getProductModels(req);
    return res.status(200).json(blResponse);
}

async function postProductModels(req, res) {
    let blResponse = await productModelBl.addProductModel(req);
    return res.status(200).json(blResponse);
}

async function putProductModels(req, res) {
    let blResponse = await productModelBl.updateProductModel(req);
    return res.status(200).json(blResponse);
}

function deleteProductModels(req, res) {
    let blResponse = productModelBl.deleteProductModel(req);
    return res.status(200).json(blResponse);
}

async function updateModelStatus(req, res){
    let blResponse = await productModelBl.updateModelStatus(req);
    return res.status(200).json(blResponse);
}

async function addImages(req, res){
    let blResponse = await productModelBl.addImages(req);
    return res.status(200).json(blResponse);
}

async function addAccessories(req, res){
    let blResponse = await productModelBl.addAccessories(req);
    return res.status(200).json(blResponse);
}

async function addBrochure(req, res){
    let blResponse = await productModelBl.addBrochure(req);
    return res.status(200).json(blResponse);
}

//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getProductModels = getProductModels;
module.exports.postProductModels = postProductModels;
module.exports.putProductModels = putProductModels;
module.exports.deleteProductModels = deleteProductModels;
module.exports.updateModelStatus = updateModelStatus;
module.exports.addImages = addImages;
module.exports.addAccessories = addAccessories;
module.exports.addBrochure = addBrochure;
//#endregion