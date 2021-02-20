//#region Imports
const bookingService = require("../services/bookingService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/bookings")
                .get(auth, bookingService.getBookings)
                .post(auth, bookingService.postBookings)
                .put(auth, bookingService.putBookings)
                .delete(auth, bookingService.deleteBookings);

    app.route("/bookings/cancelBooking")
        .post(auth, bookingService.cancelBooking);

    app.route("/bookings/updateFinance")
        .post(auth, bookingService.updateFinance);

    app.route("/bookings/ExcAmount")
        .post(auth, bookingService.ExcAmount);
    app.route("/bookings/customerResponse")
        .get(bookingService.getCustomerResponse)
        .post(bookingService.postCustomerResponse)
};
//#endregion