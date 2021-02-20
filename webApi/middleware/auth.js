const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const acl = require('../businessLogic/authBl');
const common = require('../common');

const auth = async(req, res, next) => {

    try {
        const header = req.header('Authorization');
        if (!header) {
            throw new Error("Bearer token not found");
        }
        const token = header.replace('Bearer ', '');
        const data = jwt.verify(token, process.env.JWT_KEY);
        let user = {};

        if(data.userId){
          // For Pdf download
            user = await User.findOne({
                _id: data.userId,
                status: "Active"
            });
        }else{
            user = await User.findOne({
                _id: data._id ,
                'tokens.token': token,
                status: "Active"
            });
        }

        if (!user) {
            throw new Error("User not found");
        }

        const role = await Role.findOne({roleId: user.role[0]});

        if (!role) {
            throw new Error("User role not found");
        }

        req.user = user;
        req.token = token;
        req.userRole = role;


        if (!await acl.can(user.role, req.path, acl.permissions[req.method.toLocaleLowerCase()])){
            throw new Error("Permission denied!");
        }
        next();
    } catch (error) {
        common.logger.error(error);
        res.status(401).send({message: "You are not authorized to access this resource."});
    }

};

async function authPayment(req) {
    try {
        const token = req.body.auth;
        if (!token)  return {errorMsg: "Token not found"};

        const data = jwt.verify(token, process.env.JWT_KEY);
        let user = {};

        user = await User.findOne({
            _id: data._id,
            'tokens.token': token,
            status: "Active"
        });

        if (!user) return {errorMsg: "User not found"};

        const role = await Role.findOne({roleId: user.role[0]});

        if (!role)  return {errorMsg: "User role not found"};

        req.user = user;
        req.token = token;
        req.userRole = role;

        if (!await acl.can(user.role, req.path, acl.permissions[req.method.toLocaleLowerCase()])) return {errorMsg: "Permission denied!"};
        return {success: true}

    } catch (error) {
        common.logger.error(error);
        return {errorMsg: "You are not authorized to access this resource."}
    }

}

module.exports = auth;
module.exports.authPayment = authPayment;