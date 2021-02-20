import {authConstants} from '../constants/authConstants';
import createReducer from "../components/common/CreateReducer";
import { Utility } from '../modules/Utility';

let initialState = {
    showOTPForm: false,
    phoneNo: "",
    password: "",
    userData: {}
};

export const authReducer = createReducer(initialState, {
    [authConstants.UI_SET_AUTH_PHONE]: setPhoneNumber,
    [authConstants.UI_SET_AUTH_OTP]: setOTP,
    [authConstants.UI_SET_AUTH_OTP_FORM]: setOTPForm,

    [authConstants.API_SEND_OTP + "_FULFILLED"]: setOTPForm,
    [authConstants.API_VERIFY_OTP + "_FULFILLED"]: redirectUser,
    [authConstants.API_USER_DATA + "_FULFILLED"]: setUserData
});

function setPhoneNumber(state, {payload}) {
    return{
        ...state,
        phoneNo: payload
    }
}

function setOTP(state, {payload}) {
    return{
        ...state,
        password: payload
    }
}

function setOTPForm(state, {payload}) {
    return {
        ...state,
        showOTPForm: payload.data.success
    }
}

function redirectUser(state, {payload}) {
    Utility.setAuthenticationToken(payload.data.token);
    Utility.setAuthenticationTokenInHeader(payload.data.token);
    Utility.setUserId(payload.data.id);
    Utility.setUserRole(payload.data.type);
    return {
        ...state,
        phoneNo: "",
        password: "",
        showOTPForm: false,
        userData: payload.data
    }
}

function setUserData(state, {payload}) {
    return {
        ...state,
        userData: payload.data
    };
}