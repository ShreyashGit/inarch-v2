import {bookingConstants} from '../constants/bookingConstants';
import createReducer from "../components/common/CreateReducer";

let initialState = {
        recordsTotal: -1,
        records: [],
        currentPage: 1,
        selectedBooking: {
        _id: "",
        customerId: "",
        source: "",
        assignedUserId: "",
        assignedUserName: "",
        status: "",
        createdAt: ""
    },
        recordsTotalCustomerRes: 0,
        recordsCustomerRes: [],
    }
;

export const bookingReducer = createReducer(initialState, {
    [bookingConstants.UI_SET_SELECTED_BOOKING]: setSelectedBooking,
    [bookingConstants.UI_SET_CURRENT_BOOKING_PAGE]: setCurrentPage,
    [bookingConstants.UI_SET_BOOKING_INITIAL_STATE]: setInitialState,
    [bookingConstants.UI_SET_INITIAL_CUSTOMER_DATA]: setInitialCustomerData,

    [bookingConstants.API_GET_BOOKING_LIST + "_FULFILLED"]: getBookingList,
    [bookingConstants.API_GET_BOOKING_BY_ID + "_FULFILLED"]: getBookingById,
    [bookingConstants.API_ADD_BOOKING + "_FULFILLED"]: setInitialState,
    [bookingConstants.API_UPDATE_BOOKING + "_FULFILLED"]: setInitialState,
    [bookingConstants.API_GET_CUSTOMER_RESPONSE + "_FULFILLED"]: getCustomerResponseList,
});
function setInitialState(state) {
    return {
        ...state,
        recordsTotal: -1,
        records: [],
        currentPage: 1,
        selectedBooking: {
            _id: "",
            customerDetails: {
                firstName: "",
                middleName: "",
                lastName: "",
                dateOfBirth: "",
                phoneNo: "",
                email: "",
                gender: "",
            },
            addressDetails: {
                addressLine: "",
                city: "",
                district: "",
                talukaId: "",
                taluka: "",
                villageCode: "",
                village: "",
                state: "Maharashtra",
                pincode: ""
            },
            customerId: "",
            source: "",
            bookingAmount: null,
            specialDiscount: null,
            quantity: 1,
            totalPrice: null,
            balanceAmount: null,
            modelId: "",
            model: "",
            divId: "",
            sectionId: "",
            subSectionId: "",
            assignedUserId: "",
            assignedUserName: "",
            status: "",
            createdAt: ""
        },
        recordsTotalCustomerRes: 0,
        recordsCustomerRes: [],
    };
}

function setSelectedBooking(state, {payload}) {
    return {
        ...state,
        selectedBooking: payload
    }
}

function setCurrentPage(state, {payload}){
    return {
        ...state,
        currentPage: payload
    }
}

function getBookingList(state, {payload}){
    return {
        ...state,
        recordsTotal: payload.data.recordsTotal,
        records: payload.data.records
    }
}

function getBookingById(state, {payload}){
    return {
        ...state,
        selectedBooking: payload.data.records[0]
    }
}

function setInitialCustomerData(state, {payload}){
    return {
        ...state,
        selectedBooking:{
            ...state.selectedBooking,
            customerId:"",
            customerDetails: {
                firstName: "",
                middleName: "",
                lastName: "",
                dateOfBirth: "",
                phoneNo: payload,
                email: "",
                gender: "",
            },
            addressDetails: {
                addressLine: "",
                city: "",
                district: "",
                talukaId: "",
                taluka: "",
                villageCode: "",
                village: "",
                state: "Maharashtra",
                pincode: ""
            }
        }
    }
}

function getCustomerResponseList(state, {payload}){
    return {
        ...state,
        recordsTotalCustomerRes: payload.data.recordsTotal,
        recordsCustomerRes: payload.data.records
    }
}