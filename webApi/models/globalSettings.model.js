const mongoose = require('mongoose');
const {moment} = require("../common");

const globalsettingsSchema = mongoose.Schema({
    booking_app_url: String,
    bookings_page: String,
    new_booking_page: String,
    my_earnings_page: String,
    incentives_page: String,
    about_us_page: String,
    disclaimer_page: String,
    sequence: Number,
    receiptSeq: Number,
    current_year: Number,
    lastSentFinancerId: String,
    payUCredentials: Array,
    hdfcCredentials: Array
}, { timestamps: true });

globalsettingsSchema.methods.toJSON = function() {
    let obj = this.toObject();
    delete obj._id;
    return obj;
};

globalsettingsSchema.statics.getNextSequenceNo = async function(){
    let current_year = moment().year();
    let settings = await GlobalSettings.findOneAndUpdate({}, { $inc: { sequence: 1 }}, {new: true});

    if (!settings.current_year || current_year > settings.current_year){
        settings = await GlobalSettings.findOneAndUpdate({}, { "sequence": 1, "current_year": current_year}, {new: true});
    }

    return `MAC/${moment().format('DD-MMM-YYYY')}/${String(settings.sequence).padStart(4,'0')}`;
};

globalsettingsSchema.statics.getNextReceiptSequenceNo = async function(){
    let current_year = moment().year();
    let settings = await GlobalSettings.findOneAndUpdate({}, { $inc: { receiptSeq: 1 }}, {new: true});

    if (!settings.current_year || current_year > settings.current_year){
        settings = await GlobalSettings.findOneAndUpdate({}, { "receiptSeq": 1, "current_year": current_year}, {new: true});
    }

    return `R-MAC/${moment().format('DD-MMM-YYYY')}/${String(settings.receiptSeq).padStart(4,'0')}`;
};

const GlobalSettings = mongoose.model('globalsettings', globalsettingsSchema);

module.exports = GlobalSettings;