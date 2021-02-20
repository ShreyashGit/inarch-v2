let Booking = require('mongoose').model('Booking');
let Product = require('mongoose').model('Product');
let Payment = require('mongoose').model('Payment');
let Moment = require('moment');
mongoose = require('mongoose');
const common = require('../common');
const {config} = require('../config');
const User = require('../models/user.model');
const receiptBl = require("../businessLogic/receiptBl");
const CronJob = require('cron').CronJob;

async function updateBalanceAmount() {
    await Payment.update({
        status: ["SUCCESS", "REJECTED"],
        mode: "Cash"
    }, {$set: {providerResponse: {}}}, {multi: true});
    let payments = await Payment.find({status: "SUCCESS"}).select({providerResponse: 0});

    let bookingIds = [...new Set(payments.map(x => x.bookingId.toString()))];
    let bookingList = await Booking.find({_id: {$in: bookingIds}});

    for (let booking of bookingList) {
        let paymentList = payments.filter(x => x.bookingId === booking._id.toString());
        let actualPaymentList = await receiptBl.getActualPaymentList(paymentList);
        booking.balanceAmount = await receiptBl.getBalanceAmount(booking, actualPaymentList);
        booking.save();
        console.log("CRONJOB : Updating booking amount in = ",booking._id);
    }
}

// let testCron = new CronJob({
//     cronTime: "32 15 * * *",
//     onTick: async function() {
//         await updateBalanceAmount()
//     },
//     start: false,
//     timeZone: "Asia/Kolkata"
// });
// testCron.start();

//#region Exports
module.exports.updateBalanceAmount = updateBalanceAmount;

//#endregion