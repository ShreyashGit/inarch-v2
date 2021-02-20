import React from "react";

export const ComponentLoader = ({isLoading, error}) => {
    if (isLoading) {
        return(
            <div className="w-100 d-flex justify-content-center align-items-center p-4 flex-column">
                <span><i className="fa fa-spinner font-22 spin"/></span>
                <span>Loading...</span>
            </div>
        );
    }
    else if (error) {
        return(
            <div className="w-100 d-flex justify-content-center align-items-center p-4 flex-column">
                <span><i className="fa fa-spinner font-22 spin"/></span>
                <span>There was some problem while loading you page. Please refresh.</span>
            </div>
        );
    }
    return null;
};

export const CustomLoader = ({isLoading, className="", size=14}) => {
    if (isLoading) {
        return(
            <div className="w-100 d-flex align-items-center flex-column">
                <i className={`fa fa-spinner spin ${className}`} style={{fontSize: size}}/>
            </div>
        );
    }
    return null;
};

export const Loader = ({isLoading, background, loaderText= "Loading..."}) => {
    if (isLoading) {
        return(
            <div className="w-100 d-flex align-items-center p-4 flex-column position-absolute h-100" style={{backgroundColor: background? background: "none", zIndex: 1, top: 0}}>
                <span><i className="fa fa-spinner font-22 spin"/></span>
                <span>{loaderText}</span>
            </div>
        );
    }
    return null;
};

export const OverlayLoader = ({isLoading, background="#000000"}) => {
    if (isLoading) {
        return(
            <div className="w-100 d-flex align-items-center justify-content-center p-4 flex-column position-fixed h-100  border-radius-8 text-white" style={{backgroundColor: background, opacity:0.7, zIndex: 10, top: 0,left:0}}>
                <span><i className="fa fa-spinner font-22 spin"/></span>
                <span>Loading...</span>
            </div>
        );
    }
    return null;
};