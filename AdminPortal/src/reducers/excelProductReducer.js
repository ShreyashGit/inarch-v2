import createReducer from "../components/common/CreateReducer";
import { excelProductConstants } from '../constants/excelProductContants';

let initialState = {
    recordsTotal: -1,
    records: [],
    currentPage: 1,
    selectedProductList: [],
    selectedProduct: {
        vcNo: "",
        _id: "",
        type: "",
        model: "",
        variant: "",
        description: "",
        insuranceDetails: [],
        defaultAccessories: [],
        customAccessories: [],
        priceDetails: [],
        colorDetails: [],
        modelId: "",
        divId: "",
        sectionId: "",
        subSectionId: "",
        compare: [],
        companyOffers:[],
        status: "",
        createdAt: "",
        createdBy: "",
        modifiedAt: "",
        modifiedBy: "",
        isActive: false
    }
};

export const excelProductReducer = createReducer(initialState, {
    // [productConstants.UI_SET_SELECTED_PRODUCT]: setSelectedProduct,
    [excelProductConstants.UI_SET_CURRENT_EXCEL_PRODUCT_PAGE]: setCurrentPage,
    [excelProductConstants.UI_SET_EXCEL_PRODUCT_INITIAL_STATE]: setInitialState,
    [excelProductConstants.UI_SET_SELECTED_EXCEL_PRODUCT_LIST]: setSelectedProdutList,

    [excelProductConstants.API_GET_EXCEL_PRODUCT_LIST + "_FULFILLED"]: getExcelProductList,
    [excelProductConstants.API_UPDATE_EXCEL_PRODUCT + "_FULFILLED"]: setInitialState
});

function setInitialState(state) {
    return {
        ...state,
        recordsTotal: -1,
        records: [],
        currentPage: 1,
        selectedProductList: [],
        selectedProduct: {
            vcNo: "",
            _id: "",
            type: "",
            model: "",
            variant: "",
            description: "",
            insuranceDetails: [],
            defaultAccessories: [],
            customAccessories: [],
            priceDetails: [],
            colorDetails: [],
            modelId: "",
            divId: "",
            sectionId: "",
            subSectionId: "",
            compare: [],
            companyOffers:[],
            status: "",
            createdAt: "",
            createdBy: "",
            modifiedAt: "",
            modifiedBy: "",
            isActive: false
        }
    };
}

function setSelectedProdutList(state, {payload}) {
    return {
        ...state,
        selectedProductList: payload
    }
}

function setCurrentPage(state, {payload}){
    return {
        ...state,
            currentPage: payload
    }
}

function getExcelProductList(state, {payload}) {
    return {
        ...state,
        recordsTotal:  payload.data.recordsTotal,
        records: payload.data.records
    }
}

// function updateExcelProductList(state, {payload}) {
//     return {
//         ...state,
//         selectedProductList: payload
//     }
// }
