//#region Imports
const productModelService = require("../services/productModelService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/productModels")
        .get(auth, productModelService.getProductModels)
        .post(auth, productModelService.postProductModels)
        .put(auth, productModelService.putProductModels)
        .delete(auth, productModelService.deleteProductModels);

    app.route("/productModels/updateStatus")
        .put( auth,productModelService.updateModelStatus);

    app.route("/productModels/addImages")
        .put( productModelService.addImages);
    
    app.route("/productModels/addAccessories")
        .put(auth, productModelService.addAccessories);

    app.route("/productModels/addBrochure")
        .post(auth, productModelService.addBrochure);
};
//#endregion