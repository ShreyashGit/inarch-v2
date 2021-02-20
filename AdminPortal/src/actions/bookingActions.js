import {bookingConstants} from "../constants/bookingConstants";
import {config} from "../config";
import Axios from "axios";

export function getBookingList(data) {
    return{
        type: bookingConstants.API_GET_BOOKING_LIST,
        payload: Axios.get(config.endpoints.bookings, {params: data})
    }
}

export function getBookingById(data) {
    return{
        type: bookingConstants.API_GET_BOOKING_BY_ID,
        payload: Axios.get(config.endpoints.bookings, {params: data})
    }
}

export function AddBooking(data) {
    return{
        type: bookingConstants.API_ADD_BOOKING,
        payload: Axios.post(config.endpoints.bookings,  data)
    }
}

export function updateBooking(data) {
    return{
        type: bookingConstants.API_UPDATE_BOOKING,
        payload: Axios.put(config.endpoints.bookings,  data)
    }
}

export function updateBookingStatus(data) {
    return{
        type: bookingConstants.API_UPDATE_BOOKING_STATUS,
        payload: Axios.put(config.endpoints.bookingStatus,  data)
    }
}

export function cancelSelectedBooking(data){
    return{
        type: bookingConstants.API_CANCEL_SELECTED_BOOKING,
        payload: Axios.post(config.endpoints.bookings + "/cancelBooking",  data)
    }
}

export function setSelectedBooking(data){
    return{
        type: bookingConstants.UI_SET_SELECTED_BOOKING,
        payload: data
    }
}

export function setCurrentPage(data){
    return{
        type: bookingConstants.UI_SET_CURRENT_BOOKING_PAGE,
        payload: data
    }
}

export function setInitialState(data){
    return{
        type: bookingConstants.UI_SET_BOOKING_INITIAL_STATE,
        payload: data
    }
}

export function setInitialCustomerData(data){
    return{
        type: bookingConstants.UI_SET_INITIAL_CUSTOMER_DATA,
        payload: data
    }
}

export function addCustomerResponse(data) {
    return{
        type: bookingConstants.API_ADD_CUSTOMER_RESPONSE,
        payload: Axios.post(config.endpoints.bookings+"/customerResponse",  data)
    }
}

export function getCustomerResponseList(data) {
    return{
        type: bookingConstants.API_GET_CUSTOMER_RESPONSE,
        payload: Axios.get(config.endpoints.bookings+"/customerResponse", {params: data})
    }
}

export function saveCustomerExcel(fileData){
    return{
        type: bookingConstants.API_EXPORT_EXCEL_DATA,
        payload: Axios.post(config.endpoints.customerImports, fileData)
    }
}

export function getCustomerExcelStatus(params){
    return{
        type: bookingConstants.API_GET_CUSTOMER_EXCEL_STATUS,
        payload: Axios.get(config.endpoints.customerImports, {params: params})
    }
}

export function setExcelData(data){
    return{
        type: bookingConstants.UI_SET_EXCEL_DATA,
        payload: data
    }
}