import React from 'react';
import { Utility } from '../../modules/Utility';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from "../../actions/authActions";
import * as commonActions from "../../actions/commonActions";
import { Loader } from '../../components/common/Loaders';
import Error from '../../components/common/Error';
import logo from "../../assets/img/logo.png";
import loginMan from "../../assets/img/login-man.png";
import * as Alerts from "../../components/common/Alert";

class Login extends React.Component {

    componentDidMount() {
        if(Utility.isLoggedIn())  window.location.href = "/customer";
    }

    handleNumberChange(e) {
        this.props.authActions.setPhoneNumber(e.target.value);
    }

    getLoginForm() {
        let {phoneNo,password} = this.props.auth;
        let {loading} = this.props.common;
        return (
            <div className="pt-5">
                <div className="form-wrapper border-radius-8 mb-3">
                    <div className="input-group login-input mb-0">
                        <div className="input-group-prepend">
                            <div className="input-group-text bg-white border-0 p-3">
                                <i className="fa fa-phone"/>
                            </div>
                        </div>
                        <input type="tel" className="form-control" placeholder="Enter phone number"
                               autoFocus={true}
                               onKeyDown={this.onEnter.bind(this,1)}
                                onChange={this.handleNumberChange.bind(this)} maxLength="10" value={phoneNo}/>
                    </div>


                </div>

                <div className="text-center">
                    <button disabled={!phoneNo} className="btn btn-primary w-50 font-16 mt-2 py-2 " onClick={this.handleSendOTPClick.bind(this)}>Send OTP</button>
                    <Loader isLoading={loading} />
                </div>
            </div>
        );
    }

    getOTPForm() {
        let {password} = this.props.auth;
        let {loading} = this.props.common;


        return (
            <div className="pt-5">
                <div className="form-wrapper border-radius-8 mb-3">
                    <div className="input-group login-input mb-0">
                        <div className="input-group-prepend">
                            <div className="input-group-text bg-white border-0 p-3">
                                <i className="fa fa-key"/>
                            </div>
                        </div>
                        <input type="password" maxLength="4" className="form-control border-0" placeholder="Enter OTP"
                               autoFocus={true}
                               onKeyDown={this.onEnter.bind(this,2)}
                               onChange={this.handleOTPChange.bind(this)} value={password}/>
                    </div>
                </div>
                <p className="d-flex justify-content-evenly align-items-center font-weight-bolder mb-0 font-13 mb-2">
                    <span className="cursor-pointer text-gray-1000" onClick={this.changeNumber.bind(this)}>Change Number</span>
                    <span className="pl-2 pr-2">|</span>
                    <span className="cursor-pointer text-gray-1000" onClick={this.handleSendOTPClick.bind(this)}>Resend OTP</span>
                </p>

                <div className="text-center">
                    <button className="btn btn-primary w-50 font-16 mt-2 py-2 " onClick={this.handleOTPVerify.bind(this)}>Verify</button>
                    <Loader isLoading={loading} />
                </div>
            </div>
        );
    }

    changeNumber() {
        this.props.authActions.setOTPForm(false);
    }

    async onEnter(key,e) {
        if (e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            if(key === 1 )this.handleSendOTPClick();
            else this.handleOTPVerify()
        }
    }

    async handleSendOTPClick() {
        let {phoneNo} = this.props.auth;
        let regex = new RegExp(Utility.getMobilePattern());
        if(regex.test(phoneNo)) {
            await this.props.authActions.sendOTP({phoneNo});
            this.props.authActions.setOTP("");
            this.props.commonActions.setLoading(false);
        }
    }

    handleOTPChange(e) {
        this.props.authActions.setOTP(e.target.value);
    }

    async handleOTPVerify() {
        let {phoneNo, password} = this.props.auth;
        let regex = new RegExp(Utility.getMobilePattern());
        if(regex.test(phoneNo)) {
            await this.props.authActions.verifyOTP({phoneNo, password});
            this.props.commonActions.setLoading(false);
            this.props.history.push("/customer");
        }
        else {
            Alerts.error("Something went wrong", "Invalid mobile number");
        }
    }

    render() {
        let {showOTPForm, phoneNo} = this.props.auth;
        return (
            <div className="login-wrapper position-relative h-100 d-flex flex-grow-1">
                <div className="login-form m-auto rounded">

                    <div className="login-left-section">
                        <img src={logo} alt="MAC Vehicles" className="img-fluid logo" />
                    </div>
                    <div className="login-right-section">

                        <h1 style={{color:"#6568d5"}} className="font-weight-bolder" >Hello,</h1>
                        <h2 style={{fontSize:32}}> Welcome back</h2>

                        <span className="position-absolute" style={{right:40,top:10}}>
                            <img src={loginMan} width={100} alt="MAC Vehicles" className="img-fluid logo" />
                        </span>
                        {!showOTPForm && this.getLoginForm()}
                        {showOTPForm && this.getOTPForm()}
                    </div>
                </div>
                <Error />
            </div>
        )
    }
}

const mapStateToProps = store => ({
    common: store.common,
    auth: store.auth
});

const mapDispatchToProps = dispatch => ({
    commonActions: bindActionCreators(commonActions, dispatch),
    authActions: bindActionCreators(authActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
