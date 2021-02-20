import {userConstants} from "../constants/userConstants";
import {config} from "../config";
import Axios from "axios";

export function getUserList(data) {
    return{type: userConstants.API_GET_USER_LIST,
        payload: Axios.get(config.endpoints.users, {params: data})
    }
}

export function getUserById(data) {
    return{
        type: userConstants.API_GET_USER_BY_ID,
        payload: Axios.get(config.endpoints.users, {params: data})
    }
}

export function AddUser(data) {
    return{
        type: userConstants.API_ADD_USER,
        payload: Axios.post(config.endpoints.users,  data)
    }
}

export function updateUser(data) {
    return{
        type: userConstants.API_UPDATE_USER,
        payload: Axios.put(config.endpoints.users,  data)
    }
}

export function setSelectedUser(data){
    return{
        type: userConstants.UI_SET_SELECTED_USER,
        payload: data
    }
}

export function setCurrentPage(data){
    return{
        type: userConstants.UI_SET_CURRENT_USER_PAGE,
        payload: data
    }
}

export function setInitialState(data){
    return{
        type: userConstants.UI_SET_USER_INITIAL_STATE,
        payload: data
    }
}





