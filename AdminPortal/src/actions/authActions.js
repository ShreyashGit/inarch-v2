import {authConstants} from "../constants/authConstants";
import Axios from "axios";
import { config } from "../config";
import { Utility } from "../modules/Utility";

export function setPhoneNumber(data){
    return{
        type: authConstants.UI_SET_AUTH_PHONE,
        payload: data
    }
}

export function setOTP(data){
    return{
        type: authConstants.UI_SET_AUTH_OTP,
        payload: data
    }
}

export function sendOTP(data) {
    return{
        type: authConstants.API_SEND_OTP,
        payload: Axios.post(config.endpoints.auths+"/pre", data)
    }
}

export function setOTPForm(data){
    return{
        type: authConstants.UI_SET_AUTH_OTP_FORM,
        payload: {data: {success: data}}
    }
}

export function verifyOTP(data) {
    return{
        type: authConstants.API_VERIFY_OTP,
        payload: Axios.post(config.endpoints.auths+"/login", data)
    }
}

export function getUserData(data) {
    Utility.setAuthenticationTokenInHeader(data.token);
    return{
        type: authConstants.API_USER_DATA,
        payload: Axios.get(config.endpoints.auths+"/userData", {params: data})
    }
}