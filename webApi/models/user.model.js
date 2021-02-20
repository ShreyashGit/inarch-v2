const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//type = 0:Super User,1:Gramin Mitra Manager,2:Gramin Mitra,3:Showroom Floor Manager,4:Showroom Floor Executive,5:Customer

const userSchema = mongoose.Schema({
    documentNo: String,
    type: {
        type: Number,
        required: false,
        trim: true
    },
    managerId: {
        type: String,
        required: false,
        trim: true
    },
    managerName: {
        type: String,
        required: false,
        trim: true
    },
    firstName: {
        type: String,
        required: false,
        trim: true
    },
    middleName: {
        type: String,
        required: false,
        trim: true
    },
    lastName: {
        type: String,
        required: false,
        trim: true
    },
    fullName: {
        type: String,
        required: false,
        trim: true
    },
    phoneNo: {
        type: String,
        required: false,
        unique: true
    },
    addressLine: {
        type: String,
        required: false,
        trim: true
    },
    city: {
        type: String,
        required: false,
        trim: true
    },
    // district: {
    //     type: String,
    //     required: false,
    //     trim: true
    // },
    // talukaId: {
    //     type: String,
    //     required: false,
    //     trim: true
    // },
    // taluka: {
    //     type: String,
    //     required: false,
    //     trim: true
    // },
    // villageCode: {
    //     type: String,
    //     required: false,
    //     trim: true
    // },
    // village: {
    //     type: String,
    //     required: false,
    //     trim: true
    // },
    area : String,
    addressLine2: String,
    state: {
        type: String,
        required: false,
        trim: true
    },
    pincode: {
        type: String,
        required: false,
        trim: true
    },
    accNo: {
        type: String,
        required: false,
        trim: true
    },
    ifsc: {
        type: String,
        required: false,
        trim: true
    },
    bankName: {
        type: String,
        required: false,
        trim: true
    },
    panNo: {
        type: String,
        required: false,
        trim: true
    },
    AddharNo: {
        type: String,
        required: false,
        trim: true
    },
    bankAdd: {
        type: String,
        required: false,
        trim: true
    },
    status: {
        type: String,
        required: false,
        trim: true
    },
    assignAgents: Array,
    assignedAreas: Array,
    role: Array,
    createdBy: {
        type: String,
        required: false,
        trim: true
    },
    updatedBy: {
        type: String,
        required: false,
        trim: true
    },
    modifiedAt: Date,
    email: {
        type: String,
        required: false,
        unique: false,
        lowercase: true,
    },
    password: {
        type: String,
        required: false,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    assignedSection: Array,
    notAssignedDivision: Array,
    notAssignedDistrict: Array,
    divId: String,
    divName: String,
    assignedMakes:Array
}, {timestamps: true});

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this;
    if (user.password && user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
});

userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY, {expiresIn: "10d"});
    user.tokens = user.tokens.concat({token});
    user.password = "";
    await user.save();
    return token;
};

userSchema.statics.findByCredentials = async (phoneNo, password) => {
    // Search for a user by phoneNo and password.
    const user = await User.findOne({phoneNo});

    if (!user) {
        throw new Error("Invalid login credentials");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error("Invalid login credentials");
    }
    return user
};

userSchema.statics.findByPhoneNo = async (phoneNo) => {
    // Search for a user by phoneNo
    return User.findOne({phoneNo: phoneNo});
};

userSchema.methods.setOTP = async function (otp) {
    // Generate an auth token for the user
    const user = this;

    user.password = otp;

    await user.save();
    return user;
};
const User = mongoose.model('User', userSchema);

module.exports = User;