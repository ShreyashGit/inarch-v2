/**
 * Class Name: bookingService
 * Author: Piyush Thacker
 * Purpose: Service class to handle HTTP requests related to bookings.
 */

//#region Imports
const bookingBl = require("../businessLogic/bookingBl");
//#endregion

//#region Public Functions
async function getBookings(req, res) {
    let _id = req.query._id;
    console.log("?????",_id)
    if(_id){
        let blResponse =  await bookingBl.getBookingById(_id,req);
        return res.status(200).json(blResponse);
    }


    let role = req.userRole;
    let type = req.query.type;

    if(role.name !== "superuser" && type === 0){
        res.status(401).send({message: "You are not authorized to access this resource."});
        return ;
    }

    let blResponse = await bookingBl.getBookings(req, role);
    return res.status(200).json(blResponse);
}

async function postBookings(req, res) {
    let blResponse = await bookingBl.addBooking(req);
    return res.status(200).json(blResponse);
}

async function putBookings(req, res) {
    let blResponse = await bookingBl.updateBooking(req);
    return res.status(200).json(blResponse);
}

async function deleteBookings(req, res) {
    let blResponse = await bookingBl.deleteBooking(req);
    return res.status(200).json(blResponse);
}

async function cancelBooking(req, res) {
    let blResponse = await bookingBl.cancelBooking(req);
    return res.status(200).json(blResponse);
}

async function updateFinance(req, res) {
    let blResponse = await bookingBl.updateFinance(req);
    return res.status(200).json(blResponse);
}

async function ExcAmount(req, res) {
    let blResponse = await bookingBl.ExcAmount(req);
    return res.status(200).json(blResponse);
}

async function getCustomerResponse(req, res) {
    let blResponse = await bookingBl.getCustomerResponse(req);
    return res.status(200).json(blResponse);
}

async function postCustomerResponse(req, res) {
    let blResponse = await bookingBl.postCustomerResponse(req);
    return res.status(200).json(blResponse);
}

//#endregion

//#region Private Functions

//#endregion

//#region Exports
module.exports.getBookings = getBookings;
module.exports.postBookings = postBookings;
module.exports.putBookings = putBookings;
module.exports.deleteBookings = deleteBookings;
module.exports.cancelBooking = cancelBooking;
module.exports.updateFinance = updateFinance;
module.exports.ExcAmount = ExcAmount;
module.exports.getCustomerResponse = getCustomerResponse;
module.exports.postCustomerResponse = postCustomerResponse;
//#endregion