/**
 * Class Name: userService
 * Author: Piyush Thacker
 * Purpose: Service class to handle HTTP requests related to users.
 */

//#region Imports
const userBl = require("../businessLogic/userBl");
//#endregion

//#region Public Functions
async function getUsers(req, res) {
    let id = req.query._id;
    let blResponse;

    if(id){
        blResponse = await userBl.getUserById(id);
    }else {
         blResponse = await userBl.getUsers(req);
    }

    return res.status(200).json(blResponse);
}

async function postUsers(req, res) {
    let blResponse = await userBl.addUser(req);
    return res.json(blResponse).status(200);
}

async function putUsers(req, res) {
    let blResponse = await userBl.updateUser(req);
    return res.status(200).json(blResponse);
}

function deleteUsers(req, res) {
    let blResponse = userBl.deleteUser(req);
    return res.status(200).json(blResponse);
}

async function updateUserStatus(req, res) {
    let blResponse = await userBl.updateUserStatus(req);
    return res.status(200).json(blResponse);
}

async function loginUser(req,res){
    let blResponse = await userBl.loginUser(req);
    return res.status(200).json(blResponse);
}

async function logout(req,res){
    let blResponse = await userBl.logout(req);
    return res.status(200).json(blResponse);
}

async function logoutAll(req,res){
    let blResponse = await userBl.logoutAll(req);
    return res.status(200).json(blResponse);
}

async function preLogin(req,res){
    let blResponse = await userBl.preLogin(req, res);
    if (!blResponse.success){
        return res.status(blResponse.status).json(blResponse);
    }
    return res.status(200).json(blResponse);
}

async function getUserData(req,res){
    let blResponse = await userBl.getUserData(req);
    return res.status(200).json(blResponse);
}
//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getUsers = getUsers;
module.exports.postUsers = postUsers;
module.exports.putUsers = putUsers;
module.exports.deleteUsers = deleteUsers;
module.exports.updateUserStatus = updateUserStatus;
module.exports.loginUser = loginUser;
module.exports.logout = logout;
module.exports.logoutAll = logoutAll;
module.exports.preLogin = preLogin;
module.exports.getUserData = getUserData;
//#endregion