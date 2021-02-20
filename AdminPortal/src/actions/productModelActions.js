import {productModelConstants} from "../constants/productModelConstants";
import {config} from "../config";
import Axios from "axios";

export function getProductModelList(data) {
    return{
        type: productModelConstants.API_GET_PRODUCT_MODEL_LIST,
        payload: Axios.get(config.endpoints.productModels, {params: data})
    }
}

export function getProductModelById(data) {
    return{
        type: productModelConstants.API_GET_PRODUCT_MODEL_BY_ID,
        payload: Axios.get(config.endpoints.productModels, {params: data})
    }
}

export function addProductModel(data) {
    return{
        type: productModelConstants.API_ADD_PRODUCT_MODEL,
        payload: Axios.post(config.endpoints.productModels,  data)
    }
}

export function setCurrentPage(data){
    return{
        type: productModelConstants.UI_SET_CURRENT_MODEL_PAGE,
        payload: data
    }
}

export function updateProductModel(data) {
    return{
        type: productModelConstants.API_UPDATE_PRODUCT_MODEL,
        payload: Axios.put(config.endpoints.productModels,  data)
    }
}

export function deleteProductModel(data) {
    return{
        type: productModelConstants.API_DELETE_PRODUCT_MODEL,
        payload: Axios.delete(config.endpoints.productModels,  data)
    }
}

export function setModelData(data){
    return{
        type: productModelConstants.UI_SET_MODEL_DATA,
        payload: data
    }
}

export function setInitialState(data){
    return{
        type: productModelConstants.UI_SET_MODEL_INITIAL_STATE,
        payload: data
    }
}





