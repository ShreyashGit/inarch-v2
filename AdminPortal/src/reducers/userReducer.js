import {userConstants} from '../constants/userConstants';
import createReducer from "../components/common/CreateReducer";

let initialState = {
        recordsTotal: -1,
        records: [],
        currentPage: 1,
        selectedUser:  {
        _id: "",
        type: null,
        managerId: "",
        managerName: "",
        firstName:"",
        middleName:"",
        lastName:"",
        fullName:"",
        phoneNo: "",
        email: "",
        addressLine: "",
        city: "",
        district: "",
        talukaId:"",
        taluka: "",
        villageCode: "",
        village: "",
        state: "",
        pincode: null,
        accNo: "",
        ifsc: "",
        idNo: "",
        status: "",
        role: [],
        assignAgents:[],
        assignedAreas:[],
        assignedSubSection:[],
        assignedSection:[],
        assignedDivision:[],
        notAssignedDivision:[],
        notAssignedDistrict:[],
        assignedMakes:[],
        createdAt: "",
    }
    }
;

export const userReducer = createReducer(initialState, {
    [userConstants.UI_SET_SELECTED_USER]: setSelectedUser,
    [userConstants.UI_SET_CURRENT_USER_PAGE]: setCurrentPage,
    [userConstants.UI_SET_USER_INITIAL_STATE]: setInitialState,

    [userConstants.API_GET_USER_LIST + "_FULFILLED"]: getUserList,
    [userConstants.API_GET_USER_BY_ID + "_FULFILLED"]: getUserById,
    [userConstants.API_ADD_USER + "_FULFILLED"]: updateUser,
    // [userConstants.API_UPDATE_USER + "_FULFILLED"]:
});

function setInitialState(state) {
    return {
        ...state,
        recordsTotal: -1,
        records: [],
        currentPage: 1,
        selectedUser:  {
            _id: "",
            type: null,
            managerId: "",
            managerName: "",
            firstName:"",
            middleName:"",
            lastName:"",
            fullName:"",
            phoneNo: "",
            email: "",
            addressDetails: {
                addressLine: "",
                city: "",
                district: "",
                talukaId:"",
                taluka: "",
                villageCode: "",
                village: "",
                state: "Maharashtra",
                pincode: null
            },
            accountDetails: {
                accNo: "",
                ifsc: "",
                idNo: ""
            },
            status: "",
            role: [],
            assignAgents:[],
            assignedAreas:[],
            assignedSubSection:[],
            assignedSection:[],
            assignedDivision:[],
            notAssignedDivision:[],
            notAssignedDistrict:[],
            assignedMakes:[],
            createdAt: "",
        }
    };
}

function setSelectedUser(state, {payload}) {
    return {
        ...state,
        selectedUser: payload
    }
}

function updateUser(state, {payload}) {
    return {
        ...state,
        selectedUser: {
            ...state.selectedUser,
            _id: payload.data._id
        }
    }
}

function setCurrentPage(state, {payload}){
    return {
        ...state,
        currentPage: payload
    }
}

function getUserList(state, {payload}){
    return {
        ...state,
        recordsTotal: payload.data.recordsTotal,
        records: payload.data.records
    }
}

function getUserById(state, {payload}){
    return {
        ...state,
        selectedUser: payload.data.records[0]
    }
}