import React from "react";
import {Route} from 'react-router-dom';
import Loadable from "react-loadable";
import { PrivateRoute } from "./privateRoute";
import { ComponentLoader } from "../components/common/Loaders";

const AsyncLogin = Loadable({
    loader: () => import("../pages/auth/login"),
    loading: ComponentLoader
});

const AsyncDashboard = Loadable({
    loader: () => import("../pages/dashboard/index"),
    loading: ComponentLoader
});

const AsyncBookings = Loadable({
    loader: () => import("../pages/bookings/index"),
    loading: ComponentLoader
});

const AsyncBookingForm = Loadable({
    loader: () => import("../pages/bookings/components/BookingForm"),
    loading: ComponentLoader
});

const AsyncUsers = Loadable({
    loader: () => import("../pages/users/index"),
    loading: ComponentLoader
});

const AsyncUserForm = Loadable({
    loader: () => import("../pages/users/components/UserForm"),
    loading: ComponentLoader
});

export const RouteProvider = () => {
    return (
        <div className="vh-100">
            <Route exact path="/" component={AsyncLogin}/>
            <Route exact path="/login" component={AsyncLogin}/>
            <PrivateRoute exact path="/dashboard" component={AsyncDashboard}/>

            <PrivateRoute exact path="/customer/new" component={AsyncBookingForm} position={1}/>
            <PrivateRoute exact path="/customer/edit/:bookingId" component={AsyncBookingForm} position={1}/>
            <PrivateRoute exact path="/customer" component={AsyncBookings} position={1}/>

            <PrivateRoute exact path="/users" component={AsyncUsers} position={2}/>
            <PrivateRoute exact path="/users/new" component={AsyncUserForm} position={2}/>
            <PrivateRoute exact path="/users/edit/:userId" component={AsyncUserForm} position={2}/>

        </div>
    );
};