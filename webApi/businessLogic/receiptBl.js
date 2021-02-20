/**
 * Class Name: receiptBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for receiptsDownload.
 */

//#region Imports
let Booking = require('mongoose').model('Booking');
let Template = require('mongoose').model('Template');
let Payment = require('mongoose').model('Payment');
let Token = require('mongoose').model('Token');
const { ToWords } = require('to-words');
const jwt = require('jsonwebtoken');
mongoose = require('mongoose');
const fs = require('fs');
const pdf = require('html-pdf');
const Moment = require('moment');
const common = require('../common');
const bookingBl = require("../businessLogic/bookingBl");
//#endregion

//#region Public Functions

/**
 * download a quotation
 * @param req
 * @returns {{p: string}}
 */
async function getQuotation(req, callback) {
    let bookingId = req.query._id;
    // let query = {};
    // if (bookingId) {
    //     query['_id'] = bookingId;
    // }

    
    let bookingData = [];
    let bookingList = await bookingBl.getBookingById(bookingId, req);
    bookingData = bookingList.records;

    let template = {};
    if(bookingData.length > 0){
        let templateQuery = {
            divId: bookingData[0].vehicleDetails.divId,
            documentType: "quotation"
        };
        let templateData = await Template.find(templateQuery);
        template = templateData.length > 0 ? templateData[0] : {};

    }

    let html = fs.readFileSync('../templates/quotationForm.html', 'utf8');
    let options = {
        height: template.receiptHeight ? template.receiptHeight + "mm" : "298mm",
        width: template.receiptWidth ? template.receiptWidth + "mm" : "209mm",
        header: {
            height: "23mm",
            contents: template.logoImg ? `<div style="float: right !important"><img src="${template.logoImg}" width="250" height="70" alt="logo" /></div>` : defaultLogo
        },

        footer: {
            height: "13mm",
            contents: `<div style="text-align: center; font-size: 47% !important"><div style="text-align: left;"> <span style="color: #444;">{{page}}/{{pages}}</span>  &nbsp;</div>${template.address ? template.address : "<b>MAC Vehicles </b>Plot No: 1 B, Wadgaon Arni road, Yavatmal - 445001, Tel: 960797600"}</div>`, // fallback value
        }
    };



    if (bookingData.length > 0) {
        let booking = bookingData[0];
        let addressDetails = await getAddressDetails(booking.addressDetails);

        html = html.replace("${waterMark}", booking.status === 6 ?  ` <p class="water-mark-text water-mark-red">${template.cancelWatermarkTxt ? template.cancelWatermarkTxt : "Cancelled"}</p>`:`  <p class="water-mark-text">${template.bookingWatermarkTxt ? template.bookingWatermarkTxt :"MAC Vehicles"}</p>`);

        html = html.replace("${quotationNo}", booking.bookingNo);
        html = html.replace("${quotationDate}", Moment(booking.updatedAt).format("DD/MM/YYYY"));
        html = html.replace("${customerName}", booking.customerDetails.firstName + " " + booking.customerDetails.middleName + " " + booking.customerDetails.lastName);
        html = html.replace("${phoneNo}", booking.customerDetails.phoneNo);
        html = html.replace("${emailId}", booking.customerDetails.email);
        html = html.replace("${gender}", booking.customerDetails.gender);
        html = html.replace("${customerAddress}", addressDetails.address);
        html = html.replace("${district}", addressDetails.district);
        html = html.replace("${village}", addressDetails.village);
        html = html.replace("${taluka}", addressDetails.taluka);
        html = html.replace("${bookingSource}", booking.source || "Not available");

        html = html.replace("${vehicleType}", getFuelTypes(booking.vehicleDetails.type));
        html = html.replace("${modelName}", booking.model);
        html = html.replace("${variantName}", booking.vehicleDetails.variant);
        html = html.replace("${colorName}", booking.vehicleDetails.selectedColor.colorName);

        let priceList = '';
        let priceDetails = booking.vehicleDetails.priceDetails.filter(x => Number(x.amount) > 0);
        priceDetails.forEach(item => {
            if (item.key !== "ACCESSORIES") {
                priceList += '<li>' +
                    '<span class="w-half d-inline-block">' + item.label + '</span>' +
                    '<span class="w-half d-inline-block right">&#8377; ' + formatPrice(item.amount, true) + '</span>' +
                    '</li>';
            }
        });
        booking.vehicleDetails.customPriceDetails.forEach(item => {
                let sign= item.sign === "-"?item.sign:"";
                priceList += '<li>' +
                    '<span class="w-half d-inline-block">' + item.label + '</span>' +
                    '<span class="w-half d-inline-block right"> '+ sign + " &#8377; " + formatPrice(item.amount, true) + '</span>' +
                    '</li>';
        });
        html = html.replace("${priceList}", priceList);

        let defAccList = '';
        booking.vehicleDetails.defaultAccessories.forEach(item => {
            defAccList += '<li>' +
                '<span class="w-half d-inline-block">' + item.name + '</span>' +
                '<span class="w-half d-inline-block right">&#8377; ' + formatPrice(item.amount, true) + '</span>' +
                '</li>';
        });
        html = html.replace("${defaultAccList}", defAccList);

        let extraAccList = '';
        booking.vehicleDetails.customAccessories.forEach(item => {
            extraAccList += '<li>' +
                '<span class="w-half d-inline-block">' + item.name + '</span>' +
                '<span class="w-half d-inline-block right">&#8377; ' + formatPrice(item.amount, true) + '</span>' +
                '</li>';
        });
        if (extraAccList !== '') {
            extraAccList =
                '<li class="border-bottom mb-1 mt-1">' +
                '<span class="w-half d-inline-block"><b>Extra Accessories</b></span>' +
                '</li>' + extraAccList;
        }
        html = html.replace("${extraAccList}", extraAccList);

        let accValue = booking.vehicleDetails.priceDetails.find(item => item.key === "ACCESSORIES");
        html = html.replace("${totalAccessoriesPrice}", accValue && formatPrice(accValue.amount, true));

        html = html.replace("${grandTotal}", formatPrice(booking.totalPrice, true));
        html = html.replace("${quantity}", booking.quantity = Number(booking.quantity) ? parseInt(booking.quantity) : 1);

        let description = "";
        if(booking.vehicleDetails.description){
            description = `<div class="card">
                <h4 class="mt-0"><span class="border-bottom">Description</span></h4>
                <p class="m-0">${booking.vehicleDetails.description}</p>
            </div>
            <br />`
        }

        html = html.replace("${description}", description);

        let termsCondition = "";
        if(template && template.terms){
            template.terms.forEach(item => {
                termsCondition += "<li>" + item + "</li>";
            });
        }
        
        html = html.replace("${termsCondition}", termsCondition);
        
        let headerTitle = template.headerTitle ? template.headerTitle :"MAC Vehicles";

        html = html.replace("${headerTitle}", headerTitle);

        html = html.concat(`<div style="float: right !important,"><img src="${template.logoImg}" style=" display:none;" width="250" height="82" alt="logo" /></div>`)

    }

    pdf.create(html, options).toStream(function (err, res) {
        if (err) throw new Error("Unable to download, please try again");
        callback(res);
    });
}

/**
 * Downloads a booking receipt
 * @param req
 * @returns {{p: string}}
 */
async function getBookingReceipt(req, callback) {
    let bookingId = req.query._id;
    // let query = {};
    // if (bookingId) {
    //     query['_id'] = bookingId;
    // }
    let bookingData = [];
    let bookingList = await bookingBl.getBookingById(bookingId, req);
    bookingData = bookingList.records;

    let template = {};
    if(bookingData.length > 0){
        let templateQuery = {
            divId: bookingData[0].vehicleDetails.divId,
            documentType: "bookingForm"
        }
        let templateData = await Template.find(templateQuery);
        template = templateData.length > 0 ? templateData[0] : {};

    }

    let html = fs.readFileSync('../templates/bookingForm.html', 'utf8');
    let options = {
        height: template.receiptHeight ? template.receiptHeight + "mm" : "298mm",
        width: template.receiptWidth ? template.receiptWidth + "mm" : "209mm",
        header: {
            height: "23mm",
            contents: template.logoImg ? `<div style="float: right !important"><img src="${template.logoImg}" width="250" height="70" alt="logo" /></div>`  : defaultLogo
        },

        footer: {
            height: "13mm",
            contents: `<div style="text-align: center; font-size: 47% !important"><div style="text-align: left;"> <span style="color: #444;">{{page}}/{{pages}}</span>  &nbsp;</div>${template.address ? template.address : "<b>MAC Vehicles </b>Plot No: 1 B, Wadgaon Arni road, Yavatmal - 445001, Tel: 960797600"}</div>`, // fallback value
        }
    };

    if (bookingData.length > 0) {
        let booking = bookingData[0];
        let payments = await Payment.find({bookingId:booking._id}).select({providerResponse: 0});
        let actualPaymentList =  await getActualPaymentList(payments);
        let addressDetails = await getAddressDetails(booking.addressDetails);

        html = html.replace("${serialNo}", booking._id);
        html = html.replace("${enquiryNo}", booking._id);
        html = html.replace("${bookingNo}", booking.bookingNo);
        html = html.replace("${bookingDate}", Moment(parseInt(booking.bookingDate)).format("DD/MM/YYYY"));
        html = html.replace("${customerName}", booking.customerDetails.firstName + " " + booking.customerDetails.middleName + " " + booking.customerDetails.lastName);
        html = html.replace("${customerAddress}", addressDetails.address);
        html = html.replace("${district}", addressDetails.district);
        html = html.replace("${village}", addressDetails.village);
        html = html.replace("${taluka}", addressDetails.taluka);
        html = html.replace("${phoneNo}", booking.customerDetails.phoneNo);
        html = html.replace("${emailId}", booking.customerDetails.email);
        html = html.replace("${gender}", booking.customerDetails.gender);
        html = html.replace("${dateOfBirth}", booking.customerDetails.dateOfBirth ?`${Moment(parseInt(booking.customerDetails.dateOfBirth)).format("DD/MM/YYYY")}` : "");
        html = html.replace("${customerAddress}", booking.addressDetails.addressLine + ", " + booking.addressDetails.village + ", " + booking.addressDetails.taluka + ", " + booking.addressDetails.city + ", " + booking.addressDetails.district + ", " + booking.addressDetails.state + " - " + booking.addressDetails.pincode);
        html = html.replace("${bookingSource}", booking.source || "Not available");

        html = html.replace("${vehicleType}", getFuelTypes(booking.vehicleDetails.type));
        html = html.replace("${modelName}", booking.model);
        html = html.replace("${variantName}", booking.vehicleDetails.variant);
        html = html.replace("${colorName}", booking.vehicleDetails.selectedColor.colorName);
        html = html.replace("${waterMark}", booking.status === 6 ?  ` <p class="water-mark-text water-mark-red">${template.cancelWatermarkTxt ? template.cancelWatermarkTxt : "Cancelled"}</p>`:`  <p class="water-mark-text">${template.bookingWatermarkTxt ? template.bookingWatermarkTxt :"MAC Vehicles"}</p>`);

        let priceList = '';
        let priceDetails = booking.vehicleDetails.priceDetails.filter(x => Number(x.amount) > 0);
        priceDetails.forEach(item => {
            if (item.key !== "ACCESSORIES") {
                priceList += '<li>' +
                    '<span class="w-half d-inline-block">' + item.label + '</span>' +
                    '<span class="w-half d-inline-block right">&#8377; ' + formatPrice(item.amount, true) + '</span>' +
                    '</li>';
            }
        });
        booking.vehicleDetails.customPriceDetails.forEach(item => {
             let sign = item.sign === "-"? item.sign : "";
                priceList += '<li>' +
                    '<span class="w-half d-inline-block">' + item.label + '</span>' +
                    '<span class="w-half d-inline-block right"> '+ sign + " &#8377; " + formatPrice(item.amount, true) + '</span>' +
                    '</li>';
        });
        html = html.replace("${priceList}", priceList);

        let defAccList = '';
        booking.vehicleDetails.defaultAccessories.forEach(item => {
            defAccList += '<li>' +
                '<span class="w-half d-inline-block">' + item.name + '</span>' +
                '<span class="w-half d-inline-block right">&#8377; ' + formatPrice(item.amount, true) + '</span>' +
                '</li>';
        });
        html = html.replace("${defaultAccList}", defAccList);

        let extraAccList = '';
        booking.vehicleDetails.customAccessories.forEach(item => {
            extraAccList += '<li>' +
                '<span class="w-half d-inline-block">' + item.name + '</span>' +
                '<span class="w-half d-inline-block right">&#8377; ' + formatPrice(item.amount, true) + '</span>' +
                '</li>';
        });
        if (extraAccList !== '') {
            extraAccList =
                '<li class="border-bottom mt-1">' +
                '<span class="w-half d-inline-block"><b>Extra Accessories</b></span>' +
                '</li>' + extraAccList;
        }
        html = html.replace("${extraAccList}", extraAccList);

        let financeOption = "";
        if (booking.financeApproved && booking.financeDetails && booking.financeDetails.financeAmount) {
            financeOption =  '<li>' +
                '<span class="w-half d-inline-block"><b>Finance Agency</b></span>' +
                '<span class="w-half d-inline-block right"><b>' + booking.financeDetails.agencyName + '</b></span>' +
                '</li>' +
                '<li>' +
                '<span class="w-half d-inline-block"><b>Finance Amount</b></span>' +
                '<span class="w-half d-inline-block right"><b> - &#8377; ' + formatPrice(booking.financeDetails.financeAmount, true) + '</b></span>' +
                '</li>'
        }
        html = html.replace("${financeOption}", financeOption);

        let excDetail = "";
        if (booking.exchangeApproved && booking.excAmount && booking.excModelName && booking.excYear) {
            excDetail =  '<li>' +
                '<span class="w-half d-inline-block"><b>Ex-change Vehicle Cost</b></span>' +
                '<span class="w-half d-inline-block right"><b> - &#8377; ' + formatPrice(booking.excAmount, true) + '</b></span>' +
                '</li>' +
                '<li>' +
                '<span class="w-half d-inline-block"><b>Model Name</b></span>' +
                '<span class="w-half d-inline-block right"><b>' + booking.excModelName + '</b></span>' +
                '</li>' +
                '<li>' +
                '<span class="w-half d-inline-block"><b>Year</b></span>' +
                '<span class="w-half d-inline-block right"><b>' + booking.excYear + '</b></span>' +
                '</li>'
        }
        html = html.replace("${excDetail}", excDetail);

        let specialDiscount='';
        if(booking.specialDiscount > 0){
            specialDiscount =
        ' <li>'+
                '<span class="w-half d-inline-block"><b>Special Discount</b></span>'+
                    '<span class="w-half d-inline-block right"><b> - &#8377; ' + formatPrice(booking.specialDiscount, true)+'</b></span>'+
              '</li>'
        }
        html = html.replace("${specialDiscount}", specialDiscount);

        let firstSuccessPayId = "";
        let firstPaymentDate = "";
        if(actualPaymentList.length > 0){
            firstSuccessPayId = actualPaymentList[0]._id;
            firstPaymentDate = actualPaymentList[0].updatedAt
        }

        // html = html.replace("${firstSuccessPayId}", firstSuccessPayId);

        let paymentList = '';
        if(actualPaymentList.length > 1){
            let payments = actualPaymentList.slice(1, actualPaymentList.length);
            payments.forEach((item, index)=> {
                paymentList += '<li class="border-bottom">' +
                    '<span class="w-half d-inline-block">' + 'Pay '+ (index + 2) + ' (' + item._id + ')</span>' +
                    '<span class="w-half d-inline-block right"> - &#8377; ' + formatPrice(item.amount, true) + '</span>' +
                    '<span class="w-half d-inline-block">' + Moment(item.updatedAt).format("DD/MM/YYYY, h:mmA") + '</span>' +
                    '</li>';
            });

            if (paymentList !== '') {
                paymentList =
                    '<li class="border-bottom mt-1">' +
                    '<span class="w-half d-inline-block"><b>Payments Received</b></span>' +
                    '</li>' + paymentList;
            }
        }
        html = html.replace("${paymentList}", paymentList);
        let accValue = booking.vehicleDetails.priceDetails.find(item => item.key === "ACCESSORIES");
        html = html.replace("${totalAccessoriesPrice}", accValue && formatPrice(accValue.amount, true));

        let balanceAmount = await getBalanceAmount(booking,actualPaymentList);
        html = html.replace("${quantity}", booking.quantity = Number(booking.quantity) ? parseInt(booking.quantity) : 1);
        html = html.replace("${grandTotal}", formatPrice(booking.totalPrice, true));
        html = html.replace("${balanceAmount}", formatPrice(balanceAmount, true,true));

        let bookingPayDetails = "";

        if (booking.bookingAmount) {
            bookingPayDetails = `<li>
        <span class="w-half d-inline-block"><b>Booking Amount (Pay 1)(${firstSuccessPayId})</b></span>
        <span class="w-half d-inline-block right"><b>- &#8377; ${formatPrice(booking.bookingAmount, true)}</b></span>
        <span class="w-half d-inline-block "><b> ${Moment(firstPaymentDate).format("DD/MM/YYYY, h:mmA")}</b></span>
        </li>`
        }
        html = html.replace("${bookingPaymentDetails}", bookingPayDetails);

        let description = "";
        if(booking.vehicleDetails.description){
            description = `<div class="card">
                <h4 class="mt-0"><span class="border-bottom">Description</span></h4>
                <p class="m-0">${booking.vehicleDetails.description}</p>
            </div>
            <br />`
        }

        html = html.replace("${description}", description);

        let termsCondition = "";
        if(template && template.terms){
            template.terms.forEach(item => {
                termsCondition += "<li>" + item + "</li>";
            });
        }
        
        html = html.replace("${termsCondition}", termsCondition);
        
        let headerTitle = template.headerTitle ? template.headerTitle :"MAC Vehicles";

        html = html.replace("${headerTitle}", headerTitle);

        html = html.concat(`<div style="float: right !important,"><img src="${template.logoImg}" style=" display:none;" width="250" height="82" alt="logo" /></div>`)
    }

    pdf.create(html, options).toStream(function (err, res) {
        if (err) throw new Error("Unable to download, please try again");
        callback(res);
    });

}

/**
 * Downloads a payment receipt
 * @param req
 * @returns {{p: string}}
 */
async function getPaymentReceipt(req, callback) {
    let PaymentId = req.query._id;
    // let query = {};
    // let bookingQuery = {};

    let paymentDetail = await Payment.findOne({_id: PaymentId});
    let bookingData = [];
    if (paymentDetail.bookingId) {
        // bookingQuery['_id'] = paymentDetail.bookingId;
        let bookinglist = await bookingBl.getBookingById(paymentDetail.bookingId, req);
        bookingData = bookinglist.records;
    }
    let template = {};
    if(bookingData.length > 0){
        let templateQuery = {
            divId: bookingData[0].vehicleDetails.divId,
            documentType: "payment"
        }
        let templateData = await Template.find(templateQuery);
        template = templateData.length > 0 ? templateData[0] : {};

    }
    let html = fs.readFileSync('../templates/paymentReceipt.html', 'utf8');
    let options = {
        height: template.receiptHeight ? template.receiptHeight + "mm" : "148.5mm",
        width: template.receiptWidth ? template.receiptWidth + "mm" : "210mm",
        footer: {
            height: "10mm",
            contents: `<div style="text-align: center; font-size: 47% !important"><div style="text-align: left;"> <span style="color: #444;">{{page}}/{{pages}}</span>  &nbsp;</div>${template.address ? template.address : "<b>MAC Vehicles </b>Plot No: 1 B, Wadgaon Arni road, Yavatmal - 445001, Tel: 960797600"}</div>`, // fallback value
        }
    };

    if (bookingData.length > 0) {
        let booking = bookingData[0];
        let addressDetails = await getAddressDetails(booking.addressDetails);

        html = html.replace("${receiptNo}", paymentDetail.reciptNo);
        html = html.replace("${customerName}", booking.customerDetails.firstName + " " + booking.customerDetails.middleName + " " + booking.customerDetails.lastName);
        html = html.replace("${phoneNo}", booking.customerDetails.phoneNo);
        html = html.replace("${bookingNo}", booking.bookingNo);
        html = html.replace("${divName}", booking.divName);

        // html = html.replace("${emailId}", booking.customerDetails.email);
        html = html.replace("${customerAddress}", addressDetails.address);
        html = html.replace("${village}", addressDetails.village);
        html = html.replace("${district}", addressDetails.district);
        html = html.replace("${taluka}", addressDetails.taluka);

        html = html.replace("${vehicleName}", booking.vehicleDetails.productName);
        html = html.replace("${waterMark}", booking.status === 6 ?  ` <p class="water-mark-text water-mark-red">${template.cancelWatermarkTxt ? template.cancelWatermarkTxt : "Cancelled"}</p>`:`  <p class="water-mark-text">${template.bookingWatermarkTxt ? template.bookingWatermarkTxt :"MAC Vehicles"}</p>`);

        if (paymentDetail) {
           let conventionalCharges = paymentDetail.conventionalCharges ? paymentDetail.conventionalCharges : 0;
           let amtReceived = paymentDetail.amount - conventionalCharges;
           let interest = paymentInterest(paymentDetail.paymentPartner) * 100;
            // html = html.replace("${transactionId}", paymentDetail.refNo ? paymentDetail.refNo : "");
            html = html.replace("${referenceId}", paymentDetail._id);
            html = html.replace("${receiptDate}", Moment(paymentDetail.createdAt).format("DD/MM/YYYY"));
            html = html.replace("${paymentMode}", paymentDetail.mode);
            html = html.replace("${interest}", interest);
            html = html.replace("${ConvenienceCharges}", formatPrice(paymentDetail.conventionalCharges, true));
            html = html.replace("${transactionAmount}", formatPrice(paymentDetail.amount, true));
            html = html.replace("${totalAmtReceived}", formatPrice(amtReceived, true));
            html = html.replace("${amountInWords}",   convertNumberToWords(amtReceived).toUpperCase());

            let termsCondition = "";
            if(template && template.terms){
                template.terms.forEach(item => {
                    termsCondition += "<li>" + item + "</li>";
                });
            }
            
            html = html.replace("${termsCondition}", termsCondition);
        
            let headerTitle = template.headerTitle ? template.headerTitle :"MAC Vehicles";
    
            html = html.replace("${headerTitle}", headerTitle);

        }

    }

    pdf.create(html, options).toStream(function (err, res) {
        if (err) throw new Error("Unable to download, please try again");
        callback(res);
    });
}

async function getTokenById(req) {
    let refId = req.query.refId;
    response = await Token.findOne({refId: refId}).select({token:1});
    let data = await jwt.verify(response.token, process.env.JWT_KEY);
    data.token = response.token;
    return {data}}
// #endregion

//#region Private Functions

const defaultLogo = `<svg xmlns="http://www.w3.org/2000/svg" style="float: right !important" version="1.1" width="130" height="70" viewBox="500 300 300 400">
        <g transform="matrix(1.9692780337941629 0 0 1.9692780337941629 642.8625683351427 463.8442181956234)" id="text-logo-path"  >
        <path style="stroke: rgb(5,5,252); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(5,5,252); fill-rule: nonzero; opacity: 1;"  paint-order="stroke"  transform=" translate(-160.96499999999997, 43.34)" d="M 10.67 -3.92 L 10.67 -33.18 L 10.67 -45.23 Q 11.91 -60.65 17.14 -67.81 L 17.14 -67.81 Q 21.48 -74.36 28.5 -78.21 L 28.5 -78.21 Q 33.12 -81.17 41.65 -81.38 L 41.65 -81.38 Q 47.16 -81.38 52.81 -79.31 Q 58.45 -77.25 61.55 -73.8 Q 64.65 -70.36 67.81 -63.48 L 67.81 -63.48 Q 69.54 -67.88 75.04 -73.8 L 75.04 -73.8 Q 77.73 -76.08 82 -78.28 L 82 -78.28 Q 84.89 -80.14 95.42 -81.38 L 95.42 -81.38 Q 103.27 -81.38 110.5 -77.45 Q 117.73 -73.53 120.66 -66.4 Q 123.58 -59.28 123.58 -45.16 L 123.58 -45.16 L 123.58 -3.92 L 113.67 -3.92 L 113.67 -45.16 Q 113.67 -57.28 111.95 -61.83 Q 110.23 -66.37 106.03 -69.16 Q 101.83 -71.95 95.9 -71.95 L 95.9 -71.95 Q 84.75 -71.19 76.83 -61.14 L 76.83 -61.14 Q 73.74 -56.87 72.15 -42.2 L 72.15 -42.2 L 72.15 -3.92 L 62.44 -3.92 L 62.44 -42.62 Q 62.44 -56.25 59.42 -61.17 Q 56.39 -66.09 52.19 -69.02 Q 47.99 -71.95 41.72 -71.95 L 41.72 -71.95 Q 34.97 -71.95 30.12 -68.5 Q 25.27 -65.06 22.51 -58.21 Q 19.76 -51.36 20.31 -35.94 L 20.31 -35.94 L 20.31 -3.92 L 10.67 -3.92 Z M 179.62 -83.17 L 179.62 -83.17 Q 197.04 -83.17 208.54 -70.57 L 208.54 -70.57 Q 219.14 -59.07 219.14 -43.24 L 219.14 -43.24 Q 219.28 -4.13 219.14 -3.51 L 219.14 -3.51 Q 212.53 -3.51 208.88 -3.51 L 208.88 -3.51 Q 208.88 -3.99 208.88 -20.65 L 208.88 -20.65 Q 200.83 -5.65 179.62 -3.86 L 179.62 -3.86 Q 162.27 -3.86 151.29 -15.66 Q 140.31 -27.47 140.31 -43.24 L 140.31 -43.24 Q 140.31 -58.93 150.71 -70.5 L 150.71 -70.5 Q 162.21 -83.17 179.62 -83.17 Z M 179.62 -73.67 L 179.62 -73.67 Q 167.58 -73.67 158.9 -64.72 Q 150.23 -55.77 150.23 -43.1 L 150.23 -43.1 Q 150.23 -34.91 154.67 -27.33 Q 159.11 -19.76 169.71 -14.53 L 169.71 -14.53 Q 196.28 -8.61 207.51 -38.69 L 207.51 -38.69 Q 208.13 -48.33 205.44 -57.14 L 205.44 -57.14 Q 203.51 -61.14 200.14 -64.72 L 200.14 -64.72 Q 191.67 -73.67 179.62 -73.67 Z M 311.26 -65.54 L 311.26 -65.54 L 303.55 -60.72 Q 293.57 -74.08 276.29 -74.08 L 276.29 -74.08 Q 262.45 -74.08 253.32 -65.2 Q 244.2 -56.32 244.2 -43.58 L 244.2 -43.58 Q 244.2 -35.32 248.4 -27.99 Q 252.6 -20.65 259.9 -16.66 Q 267.2 -12.67 276.29 -12.67 L 276.29 -12.67 Q 293.02 -12.67 303.55 -25.89 L 303.55 -25.89 L 311.26 -20.86 Q 305.82 -12.74 296.7 -8.3 Q 287.58 -3.86 275.87 -3.86 L 275.87 -3.86 Q 258.04 -3.86 246.23 -15.22 Q 234.43 -26.58 234.43 -42.82 L 234.43 -42.82 Q 234.43 -53.84 239.97 -63.24 Q 245.51 -72.63 255.11 -77.9 Q 264.72 -83.17 276.7 -83.17 L 276.7 -83.17 Q 284.13 -83.17 291.12 -80.9 Q 298.11 -78.62 303 -74.94 Q 307.89 -71.26 311.26 -65.54 Z" stroke-linecap="round" />
        </g>
        <g transform="matrix(2.10013189871401 0 0 2.10013189871401 640.0759629924007 640.6436405968142)" id="tagline-d8eb13e1-2ba2-4037-b496-fe8b0d8149cb-logo-path"  >
        <path style="stroke: rgb(5,5,252); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(5,5,252); fill-rule: nonzero; opacity: 1;"  paint-order="stroke"  transform=" translate(-142.825, 21.165)" d="M 1.81 -13.66 L 1.81 -13.66 L 1.81 -14.73 L 4.09 -14.73 L 4.09 -13.94 Q 4.09 -1.66 20.86 -1.63 L 20.86 -1.63 Q 26.58 -1.63 30.42 -3.41 L 30.42 -3.41 Q 35.59 -5.81 35.59 -10.83 L 35.59 -10.83 Q 35.59 -14.3 33.71 -16.12 L 33.71 -16.12 Q 32.15 -17.69 28.49 -18.76 L 28.49 -18.76 Q 26.61 -19.32 19.47 -20.86 L 19.47 -20.86 Q 11.47 -22.55 8.64 -23.99 L 8.64 -23.99 Q 3.23 -26.89 3.2 -32.45 L 3.2 -32.45 Q 3.2 -43.16 19.6 -43.16 L 19.6 -43.16 Q 36.73 -43.16 36.98 -30.05 L 36.98 -30.05 L 34.7 -30.05 Q 34.33 -36.61 29.93 -39.07 L 29.93 -39.07 Q 26.52 -41.07 19.81 -41.07 L 19.81 -41.07 Q 19.72 -41.07 19.6 -41.07 L 19.6 -41.07 Q 5.48 -41.07 5.48 -32.45 L 5.48 -32.45 Q 5.48 -28.18 9.44 -26.02 L 9.44 -26.02 Q 12.03 -24.64 18.27 -23.5 L 18.27 -23.5 Q 29.69 -21.41 33.44 -19.1 L 33.44 -19.1 Q 37.84 -16.46 37.87 -10.64 L 37.87 -10.64 Q 37.87 -4.8 31.87 -1.81 L 31.87 -1.81 Q 27.29 0.43 20.79 0.43 L 20.79 0.43 Q 12.67 0.43 7.75 -2.46 L 7.75 -2.46 Q 1.81 -6.06 1.81 -13.66 Z M 45.9 0 L 43.62 0 L 43.62 -31.01 L 45.9 -31.01 L 45.9 0 Z M 43.62 -38.05 L 43.62 -38.05 L 43.62 -42.33 Q 43.99 -43.28 44.64 -43.28 L 44.64 -43.28 Q 45.19 -43.28 45.9 -42.39 L 45.9 -42.39 L 45.9 -37.99 Q 45.25 -37.16 44.64 -37.16 L 44.64 -37.16 Q 43.93 -37.16 43.62 -38.05 Z M 54.45 0 L 52.17 0 L 52.17 -30.73 L 54.45 -30.73 L 54.45 -25.19 Q 57.59 -31.5 66.23 -31.5 L 66.23 -31.5 Q 71.71 -31.5 75.06 -28.85 L 75.06 -28.85 Q 78.78 -26.02 78.78 -20.86 L 78.78 -20.86 L 78.78 0 L 76.5 0 L 76.5 -20.21 Q 76.5 -24.67 73.74 -27.04 Q 70.97 -29.41 66.29 -29.41 L 66.29 -29.41 Q 60.82 -29.41 57.63 -26.04 Q 54.45 -22.67 54.45 -17.26 L 54.45 -17.26 L 54.45 0 Z M 83.67 -14.8 L 83.67 -14.8 Q 83.67 -22.49 88.02 -26.99 Q 92.38 -31.5 100.01 -31.5 L 100.01 -31.5 Q 104.68 -31.5 108.07 -29.35 L 108.07 -29.35 Q 111.85 -26.95 113.05 -22.36 L 113.05 -22.36 L 110.96 -21.29 Q 108.87 -29.41 99.88 -29.41 L 99.88 -29.41 Q 93.27 -29.41 89.49 -25.26 L 89.49 -25.26 Q 85.95 -21.35 85.95 -14.8 L 85.95 -14.8 Q 85.95 -8.67 89.47 -5.03 Q 92.99 -1.38 99.24 -1.38 L 99.24 -1.38 Q 103.64 -1.38 106.87 -3.48 L 106.87 -3.48 Q 110.34 -5.75 111.2 -10.27 L 111.2 -10.27 L 113.42 -9.32 Q 112.22 -4.21 108.13 -1.63 L 108.13 -1.63 Q 104.47 0.71 99.3 0.71 L 99.3 0.71 Q 92.04 0.71 87.86 -3.52 Q 83.67 -7.75 83.67 -14.8 Z M 116.31 -15.32 L 116.31 -15.32 Q 116.31 -22.49 120.49 -26.99 Q 124.68 -31.5 131.81 -31.5 L 131.81 -31.5 Q 138.86 -31.5 143.09 -27.47 Q 147.32 -23.44 147.32 -16.52 L 147.32 -16.52 L 147.32 -14.73 L 118.52 -14.67 Q 118.89 -1.38 131.63 -1.38 L 131.63 -1.38 Q 135.91 -1.38 139.21 -3.34 Q 142.52 -5.29 143.96 -9.07 L 143.96 -9.07 L 146.3 -9.07 Q 144.67 -3.85 140.49 -1.45 L 140.49 -1.45 Q 136.71 0.71 131.48 0.71 L 131.48 0.71 Q 123.91 0.71 119.97 -3.72 L 119.97 -3.72 Q 116.31 -7.88 116.31 -15.32 Z M 118.52 -16.77 L 118.52 -16.77 L 144.67 -16.77 Q 144.55 -22.55 141.07 -25.98 Q 137.6 -29.41 131.81 -29.41 L 131.81 -29.41 Q 126.03 -29.41 122.49 -25.98 Q 118.96 -22.55 118.52 -16.77 Z M 156.88 -30.12 L 153.35 -30.12 L 166.21 -40.7 L 168.21 -40.7 L 168.21 0 L 165.96 0 L 165.96 -37.5 L 156.88 -30.12 Z M 177.65 -12.61 L 177.65 -12.61 L 179.83 -12.61 Q 179.83 -6.89 183.37 -3.89 Q 186.91 -0.89 192.45 -0.89 L 192.45 -0.89 Q 197.92 -0.89 201.49 -3.88 Q 205.06 -6.86 205.12 -12.15 L 205.12 -12.15 L 205.12 -20.92 Q 201.27 -15.44 192.63 -15.44 L 192.63 -15.44 Q 186.2 -15.44 182.17 -18.76 L 182.17 -18.76 Q 177.9 -22.3 177.9 -28.55 L 177.9 -28.55 Q 177.9 -34.73 182.23 -38.36 L 182.23 -38.36 Q 186.32 -41.71 192.75 -41.71 L 192.75 -41.71 Q 199.18 -41.71 203.21 -38.3 L 203.21 -38.3 Q 207.55 -34.76 207.55 -28.55 L 207.55 -28.55 L 207.55 -27.9 Q 207.49 -27.59 207.49 -27.47 L 207.49 -27.47 L 207.49 -12.03 Q 207.49 -5.84 202.97 -2.34 L 202.97 -2.34 Q 198.81 0.92 192.38 0.95 L 192.38 0.95 Q 185.95 0.95 181.92 -2.4 L 181.92 -2.4 Q 177.65 -5.94 177.65 -12.61 Z M 180.11 -28.55 L 180.11 -28.55 Q 180.11 -23.19 183.63 -20.26 Q 187.15 -17.32 192.69 -17.32 L 192.69 -17.32 Q 198.23 -17.32 201.8 -20.26 Q 205.37 -23.19 205.37 -28.55 L 205.37 -28.55 Q 205.37 -33.96 201.64 -37.04 L 201.64 -37.04 Q 198.23 -39.87 192.69 -39.87 L 192.69 -39.87 Q 187.15 -39.87 183.63 -36.91 Q 180.11 -33.96 180.11 -28.55 Z M 213.18 -11.66 L 213.18 -11.66 Q 213.18 -16 215.89 -18.83 L 215.89 -18.83 Q 218.41 -21.47 222.81 -22.43 L 222.81 -22.43 Q 215.36 -24.64 215.36 -30.73 L 215.36 -30.73 Q 215.36 -36.45 219.98 -39.19 L 219.98 -39.19 Q 223.76 -41.41 229.91 -41.41 L 229.91 -41.41 Q 236.03 -41.41 239.82 -39.19 L 239.82 -39.19 Q 244.56 -36.42 244.56 -30.73 L 244.56 -30.73 Q 244.56 -24.67 236.99 -22.43 L 236.99 -22.43 Q 246.68 -20.27 246.68 -11.54 L 246.68 -11.54 Q 246.68 -4.98 241.26 -1.81 L 241.26 -1.81 Q 236.9 0.71 229.91 0.71 L 229.91 0.71 Q 222.87 0.71 218.47 -1.88 L 218.47 -1.88 Q 213.18 -5.08 213.18 -11.66 Z M 215.42 -11.6 L 215.42 -11.6 Q 215.42 -6.12 220.16 -3.48 L 220.16 -3.48 Q 223.88 -1.38 229.91 -1.38 L 229.91 -1.38 Q 235.97 -1.38 239.7 -3.48 L 239.7 -3.48 Q 244.43 -6.06 244.4 -11.6 L 244.4 -11.6 Q 244.4 -21.16 229.97 -21.16 L 229.97 -21.16 Q 215.42 -21.16 215.42 -11.6 Z M 217.64 -30.67 L 217.64 -30.67 Q 217.64 -26.89 222.1 -24.82 L 222.1 -24.82 Q 225.64 -23.26 229.97 -23.26 L 229.97 -23.26 Q 234.5 -23.26 238 -24.95 L 238 -24.95 Q 242.28 -27.04 242.28 -30.79 L 242.28 -30.79 Q 242.25 -39.31 229.91 -39.31 L 229.91 -39.31 Q 217.64 -39.31 217.64 -30.67 Z M 273.44 -13.87 L 250.12 -13.87 L 263.66 -40.76 L 266.06 -40.76 L 253.54 -15.93 L 273.44 -15.93 L 273.44 -40.76 L 275.69 -40.7 L 275.69 -15.93 L 283.84 -15.93 L 283.84 -13.87 L 275.69 -13.87 L 275.69 0 L 273.44 0 L 273.44 -13.87 Z" stroke-linecap="round" />
        </g>
    </svg>`

function getFuelTypes(type){
    let fuelList = [{ key: "petrol", label: "Petrol" },{ key: "diesel", label: "Diesel" },{ key: "gas", label: "CNG"},{ key: "electric", label: "Electric"},{ key: "hybrid", label: "Hybrid"}];
    let fuelType = fuelList.find(x=> x.key === type);
    return fuelType ? fuelType.label.toUpperCase() : "";
}

function formatPrice(price, showDecimal = false,ff) {
    let formattedPrice = 0;

    if (price) formattedPrice = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: showDecimal ? 2 : 0,
        maximumFractionDigits: 2
    }).format(price);
    return formattedPrice;
}

function paymentInterest(provider="") {
    if(provider === "PaymentGateway"){
        return 0.03;
    }

    return 0.000;
};

async function  getActualPaymentList(oldPaymentList){

    let paymentList = oldPaymentList;
    if(!paymentList || !paymentList.length) return [];
    let successPaymentList = paymentList.filter(x => x.status === "SUCCESS");
    if(!successPaymentList.length) return [];
    successPaymentList = await successPaymentList.sort((a,b)=> Moment(a.updatedAt).valueOf() - Moment(b.updatedAt).valueOf());
    let from2PayGatewayTrans = await successPaymentList.filter(x => x.mode === "Online" && (x.paymentPartner ==="PaymentGateway" || x.paymentPartner ==="Hdfc"));
    await from2PayGatewayTrans.sort((a,b)=> Moment(a.updatedAt).valueOf() - Moment(b.updatedAt).valueOf()).splice(0,1);

    for(let payment of from2PayGatewayTrans){
         successPaymentList.find(x => x._id === payment._id).amount = (Number(payment.amount) / (1 + paymentInterest(payment.paymentPartner)));
    }
    return successPaymentList;
}

async function getBalanceAmount(booking,actualPaymentList){
    let balanceAmt = Number(booking.totalPrice);
    // let paymentList = await getActualPaymentList(payments);
    if(booking.specialDiscount){
        balanceAmt -= Number(booking.specialDiscount)
    }
    if(booking.excAmount && booking.exchangeApproved){
        balanceAmt -= Number(booking.excAmount)
    }
    if(booking.financeApproved && booking.financeDetails && booking.financeDetails.financeAmount){
        balanceAmt -= Number(booking.financeDetails.financeAmount)
    }
    actualPaymentList.map((item, index)=>{
        balanceAmt -= Number(item.amount);
    });

    return balanceAmt
}

async function getAddressDetails(addressDetails){
    let address = "";
    let village = "";
    let taluka = "";
    let district = "";

    for (let item of Object.keys(addressDetails)) {

        if (item ==="$init" || item === "villageCode" || item === "talukaId" || item === "districtId" || !addressDetails[item] || item ==="_id") continue;
        else if(item === "taluka"){
            taluka = addressDetails[item];
        }
        else if(item === "village"){
            village = addressDetails[item];
        }
        else if(item === "district"){
            district = addressDetails[item];
        }
        else{
            address += address ? `, ${addressDetails[item]}` : addressDetails[item];
        }
    }
    return {address : address, village: village, taluka: taluka, district: district};
}

function convertNumberToWords(amount) {
    const toWords = new ToWords({
        localeCode: 'en-IN',
        converterOptions: {
            currency: true,
            ignoreDecimal: false,
            ignoreZeroCurrency: false,
        }
    });

    return  toWords.convert(amount,{ currency: true });
}


//#endregion

//#region Exports
module.exports.getQuotation = getQuotation;
module.exports.getBookingReceipt = getBookingReceipt;
module.exports.getPaymentReceipt = getPaymentReceipt;
module.exports.getTokenById = getTokenById;
module.exports.getActualPaymentList = getActualPaymentList;
module.exports.getBalanceAmount = getBalanceAmount;
//#endregion
