import axios from 'axios';
import moment from 'moment';
import React from "react";
import deepClone from "clone-deep";

export class Utility {


    static getAuthenticationToken = () => sessionStorage.getItem("AuthToken");

    static setAuthenticationToken = (token) => sessionStorage.setItem("AuthToken", token);

    static setAuthenticationTokenInHeader = (Authorization) =>{
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + Authorization;
    };

    static removeAuthenticationToken = () => sessionStorage.clear();

    static getUserId = () => sessionStorage.getItem("UserId");

    static setUserId = (userId) => sessionStorage.setItem("UserId", userId);

    static getUserRole = () => sessionStorage.getItem("UserRole");

    static setUserRole = (role) => sessionStorage.setItem("UserRole", role);

    static isLoggedIn = () => this.getUserId() && this.getUserRole() && this.getAuthenticationToken();

    static getVehicleTypes = () => [{ key: "motorcycle", label: "Motorcycle" },{ key: "scooter", label: "Scooter" }];

    static getGenderTypes = () => ["Male", "Female", "Others"];

    static getBookingSource = () => ["Walkin", "Online"];

    static getBookingStates = () => ["Fresh call", "Reschedule call", "Call lost", "Overdue call" ];

    static formatTimestamp = (timestamp) => moment(timestamp).format("DD MMM YY, h:mmA");

    static formatDateOfBirth = (date) => moment(date).format("YYYY-MM-DD");

    static formatDate = (date) => moment(date).format("YYYY-MM-DD");

    static isObjectEmpty = (object) => Object.entries(object).length === 0 && object.constructor === Object;

    static getMobilePattern = () => "[6-9]{1}[0-9]{9}";

    static getEmailPattern = () => "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$";

    static getPANPattern = () => "([A-Z]){5}([0-9]){4}([a-zA-Z])";

    static getAadharPattern = () => "(^\\d{12}$)";

    static checkSpecialCharacters(str) {
        const pattern = /[^A-Za-z 0-9 /-]/g;
        return pattern.test(str);
    }

    static validateInput = (ele) => {
        if(ele.tagName === "BUTTON") return;
        let {validity} = ele;
        let msg = "";
        for(let key in validity) {
            switch(key) {
                case "valueMissing": if(validity[key]) msg = ele.getAttribute("requiredmsg"); break;
                case "typeMismatch": break;
                case "patternMismatch": if(validity[key]) msg = ele.getAttribute("patternmsg"); break;
                case "tooLong": break;
                case "tooShort": break;
                case "rangeUnderflow": if(validity[key]) msg = "Minimum value allowed is "+ele.min; break;
                case "rangeOverflow": if(validity[key]) msg = "Maximum value allowed is "+ele.max; break;
                case "stepMismatch": if(validity[key]) msg = ele.getAttribute("stepmsg"); break;
                case "badInput": break;
                case "customError": break;
                default: if(!validity[key]) msg = "Invalid data";
            }
            if(msg) break;
        }
        let siblings = [...ele.parentNode.childNodes];
        let errorLabel = siblings.find(x => x.className && x.className.includes("error") && x.tagName === "LABEL");
        // if(errorLabel) errorLabel.innerHTML = msg;
        let errorIcon = siblings.find(x => x.className && x.className.includes("input-error") && x.tagName === "I");
        let icon = document.createElement("i");
        icon.className = "fa fa-exclamation-triangle font-18 cursor-pointer input-error";
        msg && !errorIcon && ele.parentNode.append(icon);
        !msg && errorIcon && errorIcon.remove();
        msg && ele.classList.add("error");
        !msg && ele.classList.remove("error");
        return !!msg;
    };

    static validateForm = (formRef) => {
        let formItems = [...formRef.current.elements];
        let ctr = 0;
        formItems.forEach(item => {
            ctr += this.validateInput(item)? 1: 0;
        });
        return ctr === 0;
    };

    static getEmpTypes = () => [{key:2, value:"Employee"},{key:0, value:"Admin"}];
}