import Axios from "axios";

export const get = async(url, params) => {
    return await Axios.get(url, {params: params}).then(response => response.data).catch(error => null);
};

export const post = async(url, body) => {
    return await Axios.post(url, body).then(response => response.data).catch(error => null);
};

export const put = async(url, body) => {
    return await Axios.put(url, body).then(response => response.data).catch(error => null);
};

export const del = async(url, body) => {
    return await Axios.delete(url, body).then(response => response.data).catch(error => null);
};