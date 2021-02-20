let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ProductSchema = new Schema({
    vcNo: {
        type: String,
        required: true,
        unique: true
    },
    type: String,
    documentNo: String,
    modelId:String,
    divId: String,
    sectionId: String,
    subSectionId: String,
    description: String,
    model: String,
    variant: String,
    productName: String,
    totalPrice: Number,
    brochureUrl : String,
    brochureId: String,
    fileName:String,
    insuranceDetails: [{
        name: {
            type: String,
            required: false
        },
        amount: {
            type: Number,
            required: false
        },
        default: {
            type: Boolean,
            required: false
        },
        showTag: {
            type: Boolean,
            required: false
        },
        tagDetails: {
            name: {
                type: String,
                required: false
            },
            amount: {
                type: Number,
                required: false
            }
        }
    }],
    defaultAccessories: [{
        name: {
            type: String,
            required: false
        },
        amount: {
            type: Number,
            required: false
        },
        tax: {
            type: Number,
            required: false
        }
    }],
    customAccessories:  [{
        name: {
            type: String,
            required: false
        },
        amount: {
            type: Number,
            required: false
        },
        tax: {
            type: Number,
            required: false
        }
    }],
    priceDetails: [{
        key: {
            type: String,
            required: false
        },
        label: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            required: false
        },
        type: {
            type: String,
            required: true
        },
        isTag: {
            type: Boolean,
            required: false
        }
    }],
    colorDetails: [{
        colorName: {
            type: String,
            required: false
        },
        colorCode: {
            type: String,
            required: false
        },
        premiumPrice: {
            type: String,
            required: false
        },
        image: {
            type: String,
            required: false
        },
        dummy : Boolean
    }],
    compare: Array,
    companyOffers: [{
        offer: {
            type: String,
            required: false
        }
    }],
    status: String,
    excelStatus: String,
    lastUpdatedSource: String,
    createdBy: String,
    updatedBy: String,
    excel: Boolean
}, { timestamps: true });

mongoose.model('Product', ProductSchema);