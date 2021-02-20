import {commonConstants} from "../constants/commonConstants";
import Axios from "axios";
import {config} from "../config";

export function setLoading(payload){
    return{
        type: commonConstants.UI_SET_LOADING,
        payload: payload
    }
}

export function setProductLoading(payload){
    return{
        type: commonConstants.UI_SET_PRODUCT_LOADING,
        payload: payload
    }
}

export function setDivsionLoading(payload){
    return{
        type: commonConstants.UI_SET_DIVISION_LOADING,
        payload: payload
    }
}

export function setModelUpdateLoading(payload){
    return{
        type: commonConstants.UI_SET_MODEL_UPDATE_LOADING,
        payload: payload
    }
}

export function setPaymentSettingLoading(){
    return{
        type: commonConstants.UI_SET_PAYMENT_SETTING_LOADING,
        payload: null
    }
}

export function setInitialState(){
    return{
        type: commonConstants.UI_SET_COMMON_INITIAL_STATE,
        payload: null
    }
}

export function updateStatus(endpoint,data) {
    return{
        type: commonConstants.API_UPDATE_STATUS,
        payload: Axios.put(endpoint, data)
    }
}

export function setAddress(payload) {
    return{
        type: commonConstants.UI_SET_GOOGLE_ADDRESS,
        payload: payload
    }
}
