/**
 * Class Name: productService
 * Author: Piyush Thacker
 * Purpose: Service class to handle HTTP requests related to products.
 */

//#region Imports
const productBl = require("../businessLogic/productBl");
//#endregion

//#region Public Functions
async function getProducts(req, res) {
    let _id = req.query._id;
    let blResponse;

    if (_id) {
        blResponse = await productBl.getProductById(_id);
    } else {
        blResponse = await productBl.getProducts(req);
    }

    return res.status(200).json(blResponse);
}

async function postProducts(req, res) {
    let blResponse = await productBl.addProduct(req);
    return res.status(200).json(blResponse);
}

async function putProducts(req, res) {
    let blResponse = await productBl.updateProduct(req);
    return res.status(200).json(blResponse);
}

function deleteProducts(req, res) {
    let blResponse = productBl.deleteProduct(req);
    return res.status(200).json(blResponse);
}

async function getProductsImages(req, res) {
    let blResponse = await productBl.getProductsImages(req);
    return res.status(200).json(blResponse);
}

async function updateProductsStatus(req, res) {
    let blResponse = await productBl.updateProductsStatus(req);
    return res.status(200).json(blResponse);
}
//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getProducts = getProducts;
module.exports.postProducts = postProducts;
module.exports.putProducts = putProducts;
module.exports.deleteProducts = deleteProducts;
module.exports.getProductsImages = getProductsImages;
module.exports.updateProductsStatus = updateProductsStatus;
//#endregion