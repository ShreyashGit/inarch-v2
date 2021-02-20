//#region Imports
const userMappingService = require("../services/userMappingService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/userMapping")
        .get( auth, userMappingService.getUserMapping)
        .post( auth, userMappingService.addUserMapping)
        .put( auth, userMappingService.updateUserMapping)
        .delete( auth, userMappingService.deleteUserMapping);
    app.route("/userMapping/availableSubSections")
        .get( auth, userMappingService.getAvailableSubSection);
};
//#endregion