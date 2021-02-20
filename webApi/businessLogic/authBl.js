/**
 * Class Name: authBl
 * Author: Piyush Thacker
 * Purpose: Business logic class for authorization.
 */

//#region Imports
const RolePermission = require('../models/rolePermission.model');
const common = require('../common');
//#endregion

//#region Constants

//#endregion

//#region Public Functions
async function can(role, route, verb){
    common.logger.verbose(`Checking for ${role} ${route} ${verb}`);
    let rolePermission = await RolePermission.findOne({roleId: role[0], route: route});
    if (!rolePermission) return false;
    let result = rolePermission.permission & verb;
    return (result === verb);
}
//#endregion

//#region Private Functions


//#endregion

//#region Exports

module.exports.can = can;
module.exports .permissions = {
    show: 1,
    get: 2,
    post: 4,
    put: 8,
    delete: 16
};
//#endregion