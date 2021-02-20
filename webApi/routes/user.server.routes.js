//#region Imports
const userService = require("../services/userService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/users")
                .get(userService.getUsers)
                .post(auth,userService.postUsers)
                .put(auth,userService.putUsers)
                .delete(auth,userService.deleteUsers);

    app.route("/users/changeStatus")
        .put(auth,userService.updateUserStatus);

    //#region Auth routes - DO NOT TOUCH
    app.route("/auth/userData")
        .get(auth,userService.getUserData);

    app.route("/auth/pre")
        .post(userService.preLogin);

    app.route("/auth/login")
        .post(userService.loginUser);

    app.route("/auth/logout")
        .post(auth, userService.logout);

    app.route("/auth/logoutAll")
        .post(auth, userService.logoutAll);

    //#endregion
};
//#endregion