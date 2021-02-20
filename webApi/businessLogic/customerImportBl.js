/**
 * Class Name: productImportBl
 * Purpose: Business logic class for product import and export.
 */

//#region Imports
let Booking = require('mongoose').model('Booking');
let UploadedExcel = require('mongoose').model('UploadedExcel');
mongoose = require('mongoose');
const xlsx = require('xlsx');
let Moment = require('moment');
//#endregion

//#region Constants declaration
//#endregion

//#region Public Functions

/**
 * Import product excel
 * @param req request object
 * @param res response object
 * @returns {{p: string}}s
 */
async function importCustomers(req, res) {
    let workbook = xlsx.read(req.files.file.data, {type: "buffer", sheets: "Customer List"});
    let Sheets = workbook.Sheets;
    let SheetNames = workbook.SheetNames;
    let sheetData = xlsx.utils.sheet_to_json(Sheets[SheetNames[0]], {range: 0, raw: false});
    let uploadedFile = new UploadedExcel();
    uploadedFile.filename = req.files.file.name;
    uploadedFile.status = "importing";
    uploadedFile.progress = 0;
    uploadedFile.totalRecords = sheetData.length;
    uploadedFile = await uploadedFile.save();

    res.status(200).json({
        fileId: uploadedFile._id,
        totalRecords: uploadedFile.totalRecords,
        status: uploadedFile.status,
        progress: uploadedFile.progress
    });

    try {
        for (let customer of sheetData) {
            await addCustomer(customer);
            await UploadedExcel.updateOne({_id: uploadedFile._id}, {$inc: {progress: 1}})
        }
        await UploadedExcel.updateOne({_id: uploadedFile._id}, {status: "success"});

    } catch (e) {
        await UploadedExcel.updateOne({_id: uploadedFile._id}, {status: "failed"});
        throw new Error(e);
    }
}

async function getUploadedExcelStatus(req){
    let excelData = await UploadedExcel.findOne({_id: req.query.fileId});
    return {
        status: excelData.status,
        progress: excelData.progress
    }
}

//#endregion

//#region Private Function
async function formatDateToEpoch(stringDate) {
    if (!stringDate) return 0;
    return Moment(stringDate, "MM-DD-YY").valueOf();
}

async function addCustomer(booking){
    let bookingModel = {};
    bookingModel.addressLine = booking['ADDRESS 1'];
    bookingModel.addressLine2 = booking['ADDRESS 2'];
    bookingModel.area = booking['AREA'];
    bookingModel.chassis = booking['CHASIS NO'];
    bookingModel.email = booking['EMAIL'];
    bookingModel.engine = booking['ENGINE NO'];
    bookingModel.firstName = booking['FIRST NAME'];
    bookingModel.insuranceDate = await formatDateToEpoch(booking['INSURANCE DATE']);
    bookingModel.lastName = booking['LAST NAME'];
    bookingModel.make = booking['MAKE'];
    bookingModel.makeYear = booking['MANUFACTURE YEAR'];
    bookingModel.middleName = booking['MIDDLE NAME'];
    bookingModel.model = booking['MODEL'];
    bookingModel.phoneNo = booking['PHONE 1'];
    bookingModel.phoneNo2 = booking['PHONE 2'];
    bookingModel.phoneNo3 = booking['PHONE 3'];
    bookingModel.regAddressLine = booking['ADDRESS 1'];
    bookingModel.regAddressLine2 = booking['ADDRESS 2'];
    bookingModel.regArea = booking['AREA'];
    bookingModel.regCity = booking['CITY'];
    bookingModel.city = booking['CITY'];
    bookingModel.regNo = booking['REGISTRATION NO'];
    bookingModel.regState = booking['STATE'];
    bookingModel.state = booking['STATE'];
    bookingModel.source = booking['SOURCE'];
    bookingModel.sourceName = booking['SOURCE NAME'];
    bookingModel.status = "active";
    bookingModel.cubic_capacity = booking['CUBIC CAPACITY'];
    bookingModel.gross_vehicle_weight = booking['GROSS VEHICLE WEIGHT'];
    bookingModel.vehicle_class =booking['CLASS OF VEHICLE'];
    bookingModel.fuel_type = booking['FUEL TYPE'];

    await Booking.updateOne({regNo: bookingModel.regNo},
        {$set: bookingModel},
        {upsert: true});
}

//#endregion

//#region Exports
module.exports.importCustomers = importCustomers;
module.exports.getUploadedExcelStatus = getUploadedExcelStatus;
//#endregion