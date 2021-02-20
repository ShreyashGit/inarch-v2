import React, { Fragment } from "react";
import { Route } from "react-router-dom";
import Header from "../components/common/Header";
import Error from "../components/common/Error";
import { Utility } from "./Utility";
import jwt from "jsonwebtoken"

export const PrivateRoute = ({component: Component, position = 0, ...rest}) => (
    <Route {...rest} render={props => {
        
        if(Utility.isLoggedIn()) {
            let expiry = jwt.decode(Utility.getAuthenticationToken()).exp;
            let now = new Date();
            if(now.getTime() > expiry * 1000) redirectToLogin();
            return (
                <Fragment>
                    <Header itemActive={position} />
                    <Error />
                    <Component {...props} />
                </Fragment>
            );
        }

        redirectToLogin();
    }} />
);

function redirectToLogin() {
    Utility.removeAuthenticationToken();
    window.location.href = "/login";
}