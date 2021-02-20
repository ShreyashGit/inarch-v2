//#region Imports
const divisionService = require("../services/divisionService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/division")
        .get( auth, divisionService.getDivision)
        .post( auth, divisionService.postDivision)
        .put( auth, divisionService.putDivision)

    app.route("/division/availableSections")
        .get( auth, divisionService.getFiltredSection);

    app.route("/division/updateStatus")
        .put( auth, divisionService.updateDivisionStatus);

    app.route("/division/templates")
        .get( auth, divisionService.getTemplate)
        .post( auth, divisionService.postTemplate)
        .put( auth, divisionService.putTemplate)
        .delete( auth, divisionService.deleteTemplate);
};
//#endregion