import {productModelConstants} from '../constants/productModelConstants';
import createReducer from "../components/common/CreateReducer";

let initialState = {
    currentPage: 1,
    recordsTotal: -1,
    records: [],
    selectedModel: {}
};

export const productModelReducer = createReducer(initialState, {
    [productModelConstants.UI_SET_MODEL_DATA]: setModelData,
    [productModelConstants.UI_SET_MODEL_INITIAL_STATE]: setInitialState,
    [productModelConstants.UI_SET_CURRENT_MODEL_PAGE]: setCurrentPage,

    [productModelConstants.API_GET_PRODUCT_MODEL_LIST + "_FULFILLED"]: getProductModelList,
    [productModelConstants.API_ADD_PRODUCT_MODEL + "_FULFILLED"]: returnState,
    [productModelConstants.API_UPDATE_PRODUCT_MODEL + "_FULFILLED"]: updateModelData,
    [productModelConstants.API_DELETE_PRODUCT_MODEL + "_FULFILLED"]: returnState,
    [productModelConstants.API_GET_PRODUCT_MODEL_BY_ID + "_FULFILLED"]: getProductModelById
});


function returnState(state){
    return state;
}

function getProductModelList(state, {payload}){
    return {
        ...state,
        recordsTotal: payload.data.recordsTotal,
        records: payload.data.records
    }
}

function getProductModelById(state, {payload}){
    return {
        ...state,
        selectedModel : payload.data.records[0]
    }
}

function setModelData(state, {payload}){
    return {
        ...state,
        records: payload
    }
}

function setCurrentPage(state, {payload}){
    return {
        ...state,
            currentPage: payload
    }
}

function updateModelData(state, {payload}){
    let records = state.records;
    let index = records.findIndex(x => x._id === payload.data[0]._id);
    records[index] = payload.data[0];
    return {
        ...state,
        records: records
    }
}

function setInitialState(state) {
    return {
        currentPage: 1,
        recordsTotal: -1,
        records: [],
        selectedModel: {}
    }
}