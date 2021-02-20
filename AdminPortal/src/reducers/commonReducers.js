import { commonConstants } from '../constants/commonConstants';
import createReducer from "../components/common/CreateReducer";
import { userConstants } from "../constants/userConstants";
import { authConstants } from '../constants/authConstants';
import { bookingConstants } from '../constants/bookingConstants';
import { productModelConstants } from '../constants/productModelConstants';
import { excelProductConstants } from '../constants/excelProductContants';

let initialState = {
    loading: false,
    productLoading: false,
    divisionLoading: false,
    modelLoading: false,
    paymentSettingLoading: false,
    error: {
        message: "",
        status: "",
        stack: ""
    },
    address :{
        address: '',
        area:  '',
        city: '',
        state: '',
    }
};

export const commonReducer = createReducer(initialState, {
    [commonConstants.UI_SET_LOADING]: setLoading,
    [commonConstants.UI_SET_COMMON_INITIAL_STATE]: setInitialState,
    [commonConstants.UI_SET_PRODUCT_LOADING] : setProductLoading,
    [commonConstants.UI_SET_DIVISION_LOADING] : setDivsionLoading,
    [commonConstants.UI_SET_MODEL_UPDATE_LOADING]: setModelUpdateLoading,
    [commonConstants.UI_SET_PAYMENT_SETTING_LOADING]: setPaymentSettingLoading,
    [commonConstants.UI_SET_GOOGLE_ADDRESS]: setAddress,

    [commonConstants.API_UPDATE_STATUS + "_PENDING"]: ApiSetLoading,
    [commonConstants.API_UPDATE_STATUS + "_REJECTED"]: setError,

    [authConstants.API_SEND_OTP + "_PENDING"]: ApiSetLoading,
    [authConstants.API_SEND_OTP + "_REJECTED"]: setError,
    [authConstants.API_VERIFY_OTP + "_PENDING"]: ApiSetLoading,
    [authConstants.API_VERIFY_OTP + "_REJECTED"]: setError,

    [bookingConstants.API_GET_BOOKING_LIST + "_PENDING"]: ApiSetLoading,
    [bookingConstants.API_GET_BOOKING_LIST + "_REJECTED"]: setError,
    [bookingConstants.API_GET_BOOKING_BY_ID + "_PENDING"]: ApiSetLoading,
    [bookingConstants.API_GET_BOOKING_BY_ID + "_REJECTED"]: setError,
    [bookingConstants.API_ADD_BOOKING + "_PENDING"]: ApiSetLoading,
    [bookingConstants.API_ADD_BOOKING + "_REJECTED"]: setError,
    [bookingConstants.API_UPDATE_BOOKING + "_PENDING"]: ApiSetLoading,
    [bookingConstants.API_UPDATE_BOOKING + "_REJECTED"]: setError,
    [bookingConstants.API_UPDATE_BOOKING_STATUS + "_REJECTED"]: setError,
    [bookingConstants.API_UPDATE_BOOKING_STATUS + "_PENDING"]: ApiSetLoading,
    [bookingConstants.API_CANCEL_SELECTED_BOOKING + "_REJECTED"]: setError,
    [bookingConstants.API_CANCEL_SELECTED_BOOKING + "_PENDING"]: ApiSetLoading,

    [productModelConstants.API_ADD_PRODUCT_MODEL + "_PENDING"]: ApiSetModelUpdateLoading,
    [productModelConstants.API_GET_PRODUCT_MODEL_LIST + "_PENDING"]: ApiSetLoading,
    [productModelConstants.API_GET_PRODUCT_MODEL_LIST + "_REJECTED"]: setError,
    [productModelConstants.API_ADD_PRODUCT_MODEL + "_REJECTED"]: setError, 
    [productModelConstants.API_UPDATE_PRODUCT_MODEL + "_PENDING"]: ApiSetModelUpdateLoading,
    [productModelConstants.API_UPDATE_PRODUCT_MODEL + "_REJECTED"]: setError,



    [userConstants.API_GET_USER_LIST + "_PENDING"]: ApiSetLoading,
    [userConstants.API_GET_USER_LIST + "_REJECTED"]: setError,
    [userConstants.API_GET_USER_BY_ID + "_PENDING"]: ApiSetLoading,
    [userConstants.API_GET_USER_BY_ID + "_REJECTED"]: setError,
    [userConstants.API_ADD_USER + "_PENDING"]: ApiSetLoading,
    [userConstants.API_ADD_USER + "_REJECTED"]: setError,
    [userConstants.API_UPDATE_USER + "_PENDING"]: ApiSetLoading,
    [userConstants.API_UPDATE_USER + "_REJECTED"]: setError,

    [excelProductConstants.API_GET_EXCEL_PRODUCT_LIST + "_PENDING"]: ApiSetProductLoading,
    [excelProductConstants.API_GET_EXCEL_PRODUCT_LIST + "_REJECTED"]: setError,
    [excelProductConstants.API_UPDATE_EXCEL_PRODUCT + "_REJECTED"]: setError,


});

function setInitialState(state) {
    return {
        ...state,
        loading: false,
        productLoading: false,
        divisionLoading: false,
        modelLoading: false,
        paymentSettingLoading: false,
        error: {
            message: "",
            status: "",
            stack: ""
        }
    }
}


function setError(state, { payload }) {
    return {
        ...state,
        loading: false,
        productLoading: false,
        divisionLoading: false,
        modelLoading: false,
        paymentSettingLoading: false,
        error: {
            message: payload.response.data.message,
            status: payload.response.status,
            stack: payload.response.data.stack
        }
    }
}

function setLoading(state, { payload }) {
    return {
        ...state,
        loading: payload
    }
}



function setProductLoading (state, { payload }){
    return {
        ...state,
        productLoading: payload
    }
}

function setDivsionLoading (state, { payload }){
    return {
        ...state,
        divisionLoading: payload
    }
}

function setModelUpdateLoading (state, { payload }){
    return {
        ...state,
        modelLoading: payload
    }
}

function setPaymentSettingLoading (state, { payload }){
    return {
        ...state,
        paymentSettingLoading: payload
    }
}

function ApiSetProductLoading (state, { payload }){
    return {
        ...state,
        productLoading: true
    }
}

function ApiSetDivsionLoading (state, { payload }){
    return {
        ...state,
        divisionLoading: true
    }
}

function ApiSetModelUpdateLoading (state, { payload }){
    return {
        ...state,
        modelLoading: true
    }
}

function ApiSetLoading(state) {
    return {
        ...state,
        loading: true
    }
}

function ApiSetPaymentSettingLoading(state) {
    return {
        ...state,
        paymentSettingLoading: true
    }
}

function setAddress(state, {payload}) {
    return {
        ...state,
        address: payload
    }
}
