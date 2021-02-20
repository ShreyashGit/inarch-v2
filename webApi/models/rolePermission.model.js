const mongoose = require('mongoose');

const rolePermissionSchema = mongoose.Schema({
    roleId: {
        type: Number,
        required: true
    },
    route :{
        type: String,
        required: true
    },
    permission :{
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    createdBy: String,
    updatedBy: String
}, { timestamps: true });

/*
* 1 = SHOW
* 2 = GET
* 4 = POST
* 8 = PUT
* 16 = DELETE
*/
const RolePermissionModel = mongoose.model('rolepermission', rolePermissionSchema);

module.exports = RolePermissionModel;