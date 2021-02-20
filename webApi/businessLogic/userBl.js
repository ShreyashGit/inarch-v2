/**
 * Class Name: userBl
 * Author: Piyush Thacker
 * Purpose: Business logic class for users.
 */

//#region Imports
const User = require('../models/user.model');
let Division = require('mongoose').model('Division');
let  UserAssignedSectionSchema = require('mongoose').model('UserAssignedSection');
let Lookup = require('mongoose').model('Lookup');
const GlobalSettings = require('../models/globalSettings.model');
mongoose = require('mongoose');
const optLib = require('otplib');
const common = require('../common');
const {smsService} = require('../services');
const {config} = require('../config');
//#endregion

//#region Public Functions

/**
 * Gets user list
 * @param req
 * @returns {{p: string}}s
 */
async function getUsers(req) {

    let searchText = req.query.searchText;
    let type = req.query.type;    // 0:Super User,1:Gramin Mitra Manager,2:Gramin Mitra,3:Showroom Floor Manager,4:Showroom Floor Executive,5:Customer,20=Gm,AM,SFE,BD,SD,SM
    let filter = req.query.filter;
    let page = req.query.currentPage;
    let pageSize = 10;
    let query = {};
    let selectQuery, searchValue;


    if (parseInt(type) !== 20) {
        query['type'] = type;
    }

    if (parseInt(type) === 20) {
        query['type'] = {$in: [1, 2, 4, 5, 8, 9]};
    }

    if(filter){
        selectQuery = { fullName:1 };
    }else {
        selectQuery = {
            fullName: 1,
            phoneNo: 1,
            managerName:1,
            status: 1,
            createdAt: 1,
            colorDetails: 1,
            documentNo: 1
        };

    }

    if (searchText && searchText !== "") {
        searchValue = '/' + searchText + '/i';
        query["$or"] = [];
        query["$or"].push({fullName: eval(searchValue)});
        query["$or"].push({managerName: eval(searchValue)});
        query["$or"].push({phoneNo: eval(searchValue)});
        query["$or"].push({documentNo: eval(searchValue)});
    }

    let recordsTotal = await User.count(query);

    let userList = await User.find(query).select(selectQuery).sort({updateAt: -1})
        .skip(page===1? 0 : (page - 1) * pageSize).limit(pageSize);

    return {recordsTotal: recordsTotal, records: userList};

}

/**
 * Gets a user by Id
 * @returns {{p: string}}
 * @param id
 */
async function getUserById(id) {
    let users = await User.find({_id: id}).select({updatedAt: 0, updatedBy: 0, password: 0, tokens: 0});

    if (users[0].type === 2) {

        let assignedAreas = await UserAssignedSectionSchema.find({userId: users[0]._id});
        if( assignedAreas.length > 0 ) {
            let areas = [];
            let makes = [];
            for(let item of assignedAreas){
                if(item.type === "area"){
                    areas.push(item.value);
                }
               else{
                    makes.push(item.value);
                }
            }
            users[0].assignedAreas = areas;
            users[0].assignedMakes = makes;
        }
    }
    return {recordsTotal: users.length, records: users};
}

/**
 * Adds a new user
 * @param req
 * @returns {{user, token: *}}
 */
async function addUser(req) {
    let user = req.body.data;
    const userModel = new User(req.body);
    userModel.type = user.type;
    userModel.managerId =   user.managerId;
    userModel.managerName = user.managerName;
    userModel.firstName = user.firstName;
    userModel.middleName = user.middleName;
    userModel.lastName = user.lastName;
    userModel.fullName = user.firstName+" "+user.middleName+" "+user.lastName;
    userModel.phoneNo = user.phoneNo;
    userModel.email = user.email;

    userModel.addressLine = user.addressLine;
    userModel.addressLine2 = user.addressLine2;
    userModel.city = user.city;
    userModel.area = user.area;

    // userModel.district = user.district;
    // userModel.talukaId = user.talukaId;
    // userModel.taluka = user.taluka;
    // userModel.villageCode = user.villageCode;
    // userModel.village = user.village;
    userModel.state = user.state;
    userModel.pincode = user.pincode;
    userModel.bankName = user.accNo;
    userModel.panNo = user.panNo;
    userModel.accNo = user.accNo;
    userModel.AddharNo = user.AddharNo;
    userModel.ifsc = user.ifsc;
    userModel.bankAdd = user.bankAdd;
    userModel.notAssignedDivision = user.notAssignedDivision;
    userModel.notAssignedDistrict = user.notAssignedDistrict;
    userModel.role = [user.type];
    userModel.password = getOTP();
    userModel.status = 'Active';
    userModel.createdBy = req.user._id;

    await userModel.save();
    if(user.type === 2 && user.assignedAreas.length !==0){
        await addUserAssignedSection(user.assignedAreas, userModel._id, req, type="area");
    }
    if(user.type === 2 && user.assignedMakes.length !==0){
        await addUserAssignedSection(user.assignedMakes, userModel._id, req, type="make");
    }
    const token = await userModel.generateAuthToken();
    return { _id: userModel._id.toString(), phoneNo: user.phoneNo, token: token };
}

/**
 * Updates an existing user
 * @param req
 * @returns {{p: string}}
 */
async function updateUser(req) {
    let _id = req.body._id;
    let user = req.body.data;
    user.fullName = user.firstName+" "+user.middleName+" "+user.lastName;
    user.updatedBy = req.user._id;
    if(user.type === 2 ){
        await deleteUserAssignedSections(user._id);
        if(user.assignedAreas.length !==0){
            await addUserAssignedSection(user.assignedAreas, user._id, req, type="area");
        }
        if(user.assignedMakes.length !==0){
            await addUserAssignedSection(user.assignedMakes, user._id, req, type="make");
        }
    }
    delete user.status;
    delete user.assignedAreas;
    delete user.assignedSection;
    delete user.divId;
    delete user.divName;
    await User.update({_id: _id}, {$set: user});
}

/**
 * Deletes a user
 * @param req
 * @returns {{p: string}}
 */
function deleteUser(req) {
    return {p: "n"};
}

async function updateUserStatus(req) {
    let status = req.body.status;
    let userId = req.body._id;
    await User.update({_id: userId}, {$set: {status: status, updatedBy: req.user._id}});
}

async function loginUser(req){
    const { phoneNo, password } = req.body;

    const user = await User.findByCredentials(phoneNo, password);
    if (!user) {
        throw new Error("Login failed! Check authentication credentials");
    }

    const token = await user.generateAuthToken();

    let globalSettings = await GlobalSettings.findOne({}).select({
        payUCredentials: 0,
        hdfcCredentials: 0,
        lastSentFinancerId: 0,
        current_year: 0,
        sequence: 0,
        updatedAt: 0
    });
    return {
        id: user._id.toString(),
        email: user.email,
        token: token,
        fullName: user.fullName,
        role: user.role,
        type: user.type,
        settings: globalSettings.toJSON()
    };
}

async function logout(req){
    req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token
    });
    await req.user.save();
    return {"success": true};
}

async function logoutAll(req){
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();
    return {"success": true};
}

async function preLogin(req, res){
    let phoneNo = req.body.phoneNo;
    if (!phoneNo) {
        throw new Error("Permission denied!");
    }

    let user = await User.findByPhoneNo(phoneNo);
    // let referer = req.headers.referer || [config.BOOKING_APP_URL];

    //New user cannot register from admin portal
    if (!user){
        return {success:false, status: 401, message: "Your phone number is incorrect."};
    }

    //block (Online customer ,floor executive and gramin mitra ) login into admin portal
    // if (user && isInRole (user.role, [2,4,10]) && referer.includes(config.ADMIN_PORTAL_URL)){
    //     return {success:false, status: 401, message: "You are not authorized to access this resource."};
    // }

    //block (Area manager/Ex-change manager/sales manager/ cashier/sub-dealer/branch outlet) login in booking app
    // if (user && isInRole (user.role, [1,3,5,7,8,9]) && referer.includes(config.BOOKING_APP_URL)){
    //     return {success:false, status: 401, message: "You are not authorized to access this resource."};
    // }


    // if (user === null){
    //     user = new User();
    //     user.phoneNo = phoneNo;
    //     user.type = 10;
    //     user.status = "Active";
    //     user.role.push(10);
    //     user = await user.save();
    // }

    let otp = getOTP();
    await user.setOTP(otp);
    await smsService.sendOtpSms(phoneNo,otp);
    return {success:true};
}

async function getUserData(req) {
    let globalSettings = await GlobalSettings.findOne({}).select({
        payUCredentials: 0,
        hdfcCredentials: 0,
        lastSentFinancerId: 0,
        current_year: 0,
        sequence: 0,
        updatedAt: 0
    });
    return {
        id: req.user._id.toString(),
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        type: req.user.type,
        settings: globalSettings.toJSON()
    };

}
// #endregion

//#region Private Functions
function getOTP(){
    optLib.authenticator.options = { digits: 4 };
    let otp = optLib.authenticator.generate(process.env.OTP_SECRET);
    common.logger.verbose('otp ' + otp);

    return 1111;
}

function isInRole(userRoles, roles){
    return userRoles.every((val) => roles.includes(val));
}

async function addUserAssignedSection(data, userId, req, type) {
    let assignedSections = [];
   data.forEach((x, index) => {
        let userAssignedSection = new UserAssignedSectionSchema();
        userAssignedSection.value = x;
        userAssignedSection.userId = userId;
        userAssignedSection.type = type
        assignedSections.push(userAssignedSection);
    });
    await UserAssignedSectionSchema.insertMany(assignedSections);
}

async function deleteUserAssignedSections(userId) {
    await UserAssignedSectionSchema.remove({userId: userId});
}
//#endregion

//#region Exports
module.exports.getUsers = getUsers;
module.exports.getUserById = getUserById;
module.exports.addUser = addUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.loginUser = loginUser;
module.exports.logout = logout;
module.exports.logoutAll = logoutAll;
module.exports.preLogin = preLogin;
module.exports.getUserData = getUserData;
module.exports.updateUserStatus = updateUserStatus;
//#endregion