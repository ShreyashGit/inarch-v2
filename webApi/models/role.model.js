const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    roleId: {
        type: Number,
        required: true,
        unique: true
    },
    status: {
        type: Number,
        required: true
    },
    createdBy: String,
    updatedBy: String
}, { timestamps: true });

const Role = mongoose.model('role', roleSchema);

module.exports = Role;