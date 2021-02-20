import {config} from "../config";
import Axios from "axios";
import { excelProductConstants } from "../constants/excelProductContants";

export function getExcelProductList(data) {
    return{
        type: excelProductConstants.API_GET_EXCEL_PRODUCT_LIST,
        payload: Axios.get(config.endpoints.excelProducts, {params: data})
    }
}

export function updateExcelProductList(data) {
    return{
        type: excelProductConstants.API_UPDATE_EXCEL_PRODUCT,
        payload: Axios.put(config.endpoints.excelProducts,  data)
    }
}

export function setCurrentPage(data){
    return{
        type: excelProductConstants.UI_SET_CURRENT_EXCEL_PRODUCT_PAGE,
        payload: data
    }
}

export function setSelectedProdutList(data){
    return{
        type: excelProductConstants.UI_SET_SELECTED_EXCEL_PRODUCT_LIST,
        payload: data
    }
}

export function setInitialState(data){
    return{
        type: excelProductConstants.UI_SET_EXCEL_PRODUCT_INITIAL_STATE,
        payload: data
    }
}





