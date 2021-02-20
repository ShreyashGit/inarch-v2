import React from 'react';
import * as Alerts from "./Alert";
import {bindActionCreators} from "redux";
import * as commonActions from "../../actions/commonActions";
import {connect} from "react-redux";
// import {MdContentCopy} from "react-icons/md";

class Error extends React.Component {
    // componentWillUnmount() {
    //     debugger
    //     this.props.commonActions.setInitialState();
    // }

    async copyCallStack(url){
        let textField;
        try{
            textField = document.createElement('textarea');
            textField.innerText = url;
            document.body.appendChild(textField);
            textField.select();
            document.execCommand('copy');
            textField.remove();

            this.setState({copiedUrl:url});
            setTimeout(() => { this.setState({copiedUrl:""}); }, 1000);
        } catch (e) {
            if(textField) textField.remove();
            console.log("Copy Failed: ");  // copy failed.
        }
    }

    getErrorDetails() {
        let {message, status, stack} = this.props.common.error;

        return `<div>
                    <div class="d-flex flex-column align-items-start border rounded p-3 mb-3"</div>
                        <div class="font-weight-bolder text-primary">Error: ${status}</div>
                        <div>${message}</div>
                    </div>
                     <div class="d-flex flex-column align-items-start border rounded p-3"</div>
                         <div class="font-weight-bolder text-primary pb-2">Call stack:</div>
                        <div class="overflow-y-auto w-100 rounded p-2 font-12 text-left" style="height:160px;background: #ffffff;">${stack}</div>
                    </div>
                   <p class="mb-0 pt-2 border-top align-items-start">Please try again</p>
                 </div>
`
    }

    async showError(message){
        let result = await Alerts.custom("Something went wrong", message, this.getErrorDetails(),"Close");
        if(result.value) this.props.commonActions.setInitialState()
    }

    render() {
        let {message} = this.props.common.error;
        if (message === "") return null;
        this.showError(message);
        return null
    }
}

const mapStateToProps = store => ({
    common: store.common
});

const mapDispatchToProps = dispatch => ({
    commonActions: bindActionCreators(commonActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Error);

