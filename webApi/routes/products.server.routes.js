//#region Imports
const productService = require("../services/productService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/products")
                .get(auth, productService.getProducts)
                .post(auth, productService.postProducts)
                .put(auth, productService.putProducts)
                .delete(auth, productService.deleteProducts);
    app.route("/products/changeStatus")
             .put(auth,productService.updateProductsStatus);
};
//#endregion