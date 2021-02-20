/**
 * Class Name: settlementsBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for bookings.
 */

//#region Imports
let Booking = require('mongoose').model('Booking');
let Scheme = require('mongoose').model('Scheme');
let UserMapping = require('mongoose').model('UserMapping');
let  UserAssignedSectionSchema = require('mongoose').model('UserAssignedSection');
let  Settlement = require('mongoose').model('Settlement');
const User = require('../models/user.model');
mongoose = require('mongoose');
let Moment = require('moment');
//#endregion

//#region Public Functions

async function getSettlements(req) {

    let userId = req.query.userId;
    let month = req.query.month;
    let page = parseInt(req.query.currentPage);
    let pageSize = 10;
    let query = {};

    query['incentivePaid'] = false;
    if(userId) query['userId'] = userId;

    if (month) {
        let year = new Date().getFullYear().toString();
        let currentMonth = new Date().getMonth().toString() + 1;
        if(month > currentMonth){
            year -- ;
        }
        let startDate = new Date(`${year}-${month}-01`);
        month++;
        if(month === 13) {
            month = 1;
            year ++;
        }
        let endDate = new Date(`${year}-${month}-01`);
        query['createdAt'] = {$gte: startDate, $lt: endDate};
    }

    let recordsTotal = await Settlement.countDocuments(query);
    let skipRecords = (page - 1) * pageSize;
    let settlementList = await Settlement.find(query).sort({updatedAt: -1});

    let ids = [...new Set(settlementList.map(x => x.userId))];
    users = await User.find({_id: {$in: ids}}).select({fullName:1});
    for(let item of settlementList){
        user = users.find(x=> x._id.toString() === item.userId);
        item.assignedUserName = user.fullName ? user.fullName : "";
    }


    return {recordsTotal: recordsTotal, records: settlementList};

}

async function getEarnings(req) {

    let userId = req.query.userId;
    let month = req.query.month;
    let user = await User.findOne({_id: userId}).select({type: 1});
    let query = {
        userId : userId,
        userType : user.type
    };

    if (month) {
        let year = new Date().getFullYear().toString();
        let currentMonth = new Date().getMonth().toString() + 1;
        if(month > currentMonth){
            year -- ;
        }
        let startDate = new Date(`${year}-${month}-01`);
        month++;
        if(month === 13) {
            month = 1;
            year ++;
        }
        let endDate = new Date(`${year}-${month}-01`);
        query['createdAt'] = {$gte: startDate, $lt: endDate};
    }

    query['incentivePaid'] = true;
    let settledBookings = await Settlement.find(query);
    query['incentivePaid'] = false;
    let unSettledBookings = await Settlement.find(query);

    let settledAmt = 0;
    settledBookings.forEach(x =>settledAmt += parseInt(x.incentiveAmt));

    let unSettledAmt = 0;
    unSettledBookings.forEach(x => unSettledAmt += parseInt(x.incentiveAmt));


    return {unSettledBookings, settledBookings, settledAmt, unSettledAmt}

}

async function updateSettlements(req) {
    let records = req.body.records;

    let ids = await records.map(x => x._id);
    await Settlement.update({_id: {$in: ids}}, {$set: {incentivePaid: true}}, {multi: true});
    return true
}

async function updateBookingStatus(req) {
    let bookingId = req.body._id;

    let booking = await Booking.findOne({_id: bookingId});

    if (booking.status !== 2) throw new Error("Can not update Pending or Completed booking");

    if (booking.assignedUserId) {
        let user = await User.findOne({_id: booking.assignedUserId}).select({type: 1});

        if (user.type === 0) return await updateStatus(booking, req);

        if (user.type === 2 || user.type === 4) return await agentCalc(booking, user.type, req);

        if (user.type === 1 || user.type === 8 || user.type === 9 || user.type === 10) return await managerCalc(booking, user.type, req);

        if(user.type === 5) return smCalc(booking, user.type, req);

    }

    throw new Error("Unable to update booking status as booking is not assigned to user");
}

// #endregion

//#region Private Functions
async function updateStatus(booking, req) {
    let data = {
        status : 3,
        completedDate: Moment().valueOf(),
        updatedBy: req.user._id
    };
    let response = await Booking.update({_id: booking._id}, {$set: data});
    return {records: [response]};
}

async function agentCalc(booking, userType, req) {
    let agentBookingCount = await getCompletedBookingCountForAgent(booking.subSectionId, userType, booking.assignedUserId);
    let agentIncentiveAmt = await calculateIncentiveAmt(booking.subSectionId, userType, agentBookingCount);
    let smBooking = await getCompletedBookingCountForSm(booking);
    let smIncentiveAmt = await calculateIncentiveAmt(booking.subSectionId, smBooking.userType, smBooking.completedBookingCount);

    let settlementData = [
        {
            userId: booking.assignedUserId,
            incentiveAmt: parseInt(agentIncentiveAmt),
            userType: userType
        }
    ];

    if  ( smBooking.userType !== null && smBooking.userId !== null) {
        settlementData.push({
            userId: smBooking.userId,
            incentiveAmt: parseInt(smIncentiveAmt),
            userType: smBooking.userType
        })
    }

    let talukaId = booking.addressDetails.talukaId;
    if (talukaId) {
        let managerBooking = await getCompletedBookingCountForManager(booking);
        let managerIncentiveAmt = await calculateIncentiveAmt(booking.subSectionId, managerBooking.userType, managerBooking.completedBookingCount);
        if (managerBooking.userType !== null && managerBooking.userId !== null) {
            settlementData.push({
                userId: managerBooking.userId,
                incentiveAmt: parseInt(managerIncentiveAmt),
                userType: managerBooking.userType
            })
        }
    }

    await addSettlement(booking, settlementData, req);
    return await updateStatus(booking, req);
}

async function managerCalc(booking, userType, req) {
    let smBooking = await getCompletedBookingCountForSm(booking);
    let smIncentiveAmt = await calculateIncentiveAmt(booking.subSectionId, 5, smBooking.completedBookingCount);

    let settlementData =[];

    if  ( smBooking.userType !== null && smBooking.userId !== null) {
        settlementData.push( {
            userId:smBooking.userId,
            incentiveAmt: parseInt(smIncentiveAmt),
            userType: smBooking.userType
        })
    }

    let talukaId = booking.addressDetails.talukaId;
    if (talukaId) {
        let managerBooking = await getCompletedBookingCountForManager(booking);
        let managerIncentiveAmt = await calculateIncentiveAmt(booking.subSectionId, managerBooking.userType, managerBooking.completedBookingCount);
        if (managerBooking.userType !== null && managerBooking.userId !== null) {
            settlementData.push({
                userId: managerBooking.userId,
                incentiveAmt: parseInt(managerIncentiveAmt),
                userType: managerBooking.userType
            })
        }
    }

    await addSettlement(booking, settlementData, req);

    return await updateStatus(booking, req);

}

async function smCalc(booking, userType, req) {
    let smBooking = await getCompletedBookingCountForSm(booking);
    let smIncentiveAmt = await calculateIncentiveAmt(booking.subSectionId, smBooking.userType, smBooking.completedBookingCount);

    let settlementData =[];

    if  ( smBooking.userType !== null && smBooking.userId !== null) {
        settlementData.push( {
            userId:smBooking.userId,
            incentiveAmt: parseInt(smIncentiveAmt),
            userType: smBooking.userType
        })
    }

    await addSettlement(booking, settlementData, req);

    return await updateStatus(booking, req);

}

async function getCompletedBookingCountForAgent(subSectionId, userType, assignedUserId) {
    let completedquery = {};
    completedquery['subSectionId'] = subSectionId;
    completedquery['userId'] = assignedUserId;
    completedquery['completedDate'] = {
        $gte: (Moment().startOf('month').valueOf()).toString(),
        $lte: (Moment().endOf('month').valueOf()).toString()
    };

    return await Settlement.countDocuments(completedquery)
}

async function getCompletedBookingCountForManager(booking) {
    let talukaId = booking.addressDetails.talukaId;
    let subSectionId = booking.subSectionId;
    let sectionId = booking.sectionId;
    let manager = await UserMapping.find({talukaId: talukaId,subSectionId: subSectionId, sectionId: sectionId}).select({userId: 1});

    // if (manager.length === 0) throw new Error("Taluka and sub-section for this booking is not assigned to any manager, Please assign.");
    if (manager.length === 0){
        return {
            completedBookingCount : 0,
            userType: null,
            userId: null
        }
    }

    let user = await User.findOne({_id: manager[0].userId}).select({type: 1});

    let completedquery = {};
    completedquery['sectionId'] = sectionId;
    completedquery['userId'] =  manager[0].userId;
    completedquery['completedDate'] = {
        $gte: (Moment().startOf('month').valueOf()).toString(),
        $lte: (Moment().endOf('month').valueOf()).toString()
    };

    return {
        completedBookingCount : await Settlement.countDocuments(completedquery),
        userType: user.type,
        userId: manager[0].userId
    }
}

async function getCompletedBookingCountForSm(booking){
    let sectionId = booking.sectionId;
    let managers = await UserAssignedSectionSchema.find({sectionId: sectionId}).select({managerId: 1});
    let managerIds = [...new Set(managers.map(x => x.managerId))];
    let manager = await User.find({_id: {$in:managerIds},notAssignedDistrict: {$ne: booking.addressDetails.districtId}}).select({notAssignedDistrict:1});

    // if (manager.length === 0) throw new Error("Section for this booking is not assigned to any sales manager, Please assign.");
    if (manager.length === 0){
        return {
            completedBookingCount : 0,
            userType: null,
            userId: null
        }
    }

    let completedquery = {};
    completedquery['sectionId'] = sectionId;
    completedquery['userId'] = manager[0]._id.toString();
    completedquery['districtId'] = booking.addressDetails.districtId;
    completedquery['completedDate'] = {
        $gte: (Moment().startOf('month').valueOf()).toString(),
        $lte: (Moment().endOf('month').valueOf()).toString()
    };
    return {
        completedBookingCount : await Settlement.countDocuments(completedquery),
        userType: 5,
        userId: manager[0]._id.toString()
    }

}

async function calculateIncentiveAmt(subSectionId, userType, completedBookingsCount) {
    if (userType === null ) return 0;
    let scheme = await Scheme.findOne({
        subSectionId: subSectionId,
        userType: userType,
        status: "Active"
    }).select({incentiveDetails: 1});
    if (scheme === null ) return 0;
    // if (scheme === null ) throw new Error(`Unable to update booking status as scheme is not created for ${getUseNameByType(userType)}`);

    let incentiveAmt = 0;

    for (let i = 0; i < scheme.incentiveDetails.length; i++) {

        if (scheme.incentiveDetails[i].from <= completedBookingsCount + 1 && scheme.incentiveDetails[i].to >= completedBookingsCount + 1
        ) {
            incentiveAmt = scheme.incentiveDetails[i].amount;
            break;
        }
        if (i === scheme.incentiveDetails.length - 1) {
            incentiveAmt = scheme.incentiveDetails[i].amount;
        }
    }

    return incentiveAmt
}

async function addSettlement(booking, data, req){
    let settlementData = [];
    data.forEach((x, index) => {
        let settlementModel = new Settlement();
        settlementModel.bookingId = booking._id;
        settlementModel.bookingNo = booking.bookingNo;
        settlementModel.talukaId = booking.addressDetails.talukaId;
        settlementModel.districtId = booking.addressDetails.districtId;
        settlementModel.divId = booking.divId;
        settlementModel.sectionId = booking.sectionId;
        settlementModel.subSectionId = booking.subSectionId;
        settlementModel.modelId = booking.modelId;
        settlementModel.model = booking.model;
        settlementModel.productId = booking.vehicleDetails.productId;
        settlementModel.variant = booking.vehicleDetails.variant;
        settlementModel.incentivePaid = false;
        settlementModel.incentiveAmt = parseInt(x.incentiveAmt);
        settlementModel.userId = x.userId;
        settlementModel.userType = Number(x.userType);
        settlementModel.completedDate = Moment().valueOf();
        settlementModel.fullName = booking.customerDetails.firstName +" "+booking.customerDetails.middleName+" "+booking.customerDetails.lastName;
        settlementModel.status = 3;
        settlementModel.bookingDate = booking.bookingDate;
        settlementModel.createdBy = req.user._id;
        settlementData.push(settlementModel);
    });

    await Settlement.insertMany(settlementData);
}

function getUseNameByType(type) {
    let name = "MAC Vehicles";
    if (type === 1) name = "Area Manager";
    if (type === 2) name = "Gramin Mitra";
    if (type === 4) name = "Sales Executive";
    if (type === 5) name = "Sales Manager";
    if (type === 8) name = "Sub Dealer";
    if (type === 9) name = "Branch Delivery Outlet";
    if (type === 10) name = "Customer";

    return name;
}

//#endregion

//#region Exports
module.exports.getSettlements = getSettlements;
module.exports.updateSettlements = updateSettlements;
module.exports.updateBookingStatus = updateBookingStatus;
module.exports.getEarnings = getEarnings;
//#endregion
