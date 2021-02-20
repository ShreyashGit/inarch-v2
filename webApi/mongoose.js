let mongoose = require('mongoose');
const common = require('./common');
const {config} = require('./config');

module.exports = function() {
    let db_url = config.MONGO_URL;
    mongoose.connect(db_url, {useNewUrlParser: true, useUnifiedTopology: true});
    let db = mongoose.connection;

    db.on('connected', function(){
       common.logger.verbose(("Mongoose default connection is open"));
    });

    db.on('error', function(err){
        common.logger.verbose("Error connecting mongoose");
    });

    require('./models/product.model');
    require('./models/financier.model');
    require('./models/lookup.model');
    require('./models/booking.model');
    require('./models/role.model');
    require('./models/rolePermission.model');
    require('./models/productModel.model');
    require('./models/scheme.model');
    require('./models/financierEmi.model');
    require('./models/customer.model');
    require('./models/payment.model');
    require('./models/token.model');
    require('./models/userAssignedSection.model');
    require('./models/division.model');
    require('./models/template.model');
    require('./models/userMapping.model');
    require('./models/settlement.model');
    require('./models/uploadedExcel.model');
    require('./models/paymentSetting.model');
    require('./models/customerResponse.model');

    return db;
};
