/**
 * Class Name: customerBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for customer.
 */

//#region Imports
let Customer = require('mongoose').model('Customer');
mongoose = require('mongoose');
//#endregion

//#region Public Functions

async function getCustomer(req) {
    let phoneNo = req.query.phoneNo;
    let query = {};

    if (phoneNo) {
        query['phoneNo'] = phoneNo;
        let customerDetails = await Customer.findOne(query);
        let response = {};
        if (customerDetails._id) {
            response.customerId = customerDetails._id;
            response.customerDetails = {
                firstName: customerDetails.firstName,
                middleName: customerDetails.middleName,
                lastName: customerDetails.lastName,
                dateOfBith: customerDetails.dateOfBith,
                phoneNo: customerDetails.phoneNo,
                email: customerDetails.email,
                gender: customerDetails.gender,
            };
            response.addressDetails = {
                addressLine: customerDetails.addressLine,
                city: customerDetails.city,
                district: customerDetails.district,
                talukaId: customerDetails.talukaId,
                taluka: customerDetails.taluka,
                villageCode: customerDetails.villageCode,
                village: customerDetails.village,
                state: customerDetails.state,
                pincode: customerDetails.pincode,
            }
        }
        return {recordsTotal: 1, records: response};
    }
    throw new Error("PhoneNo is required");

}

// #endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.getCustomer = getCustomer;
//#endregion