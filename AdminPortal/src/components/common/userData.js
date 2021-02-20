import { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as authActions from "../../actions/authActions";
import { Utility } from "../../modules/Utility";

class UserData extends Component {

    componentDidMount() {
        this.props.authActions.getUserData({token: Utility.getAuthenticationToken()});
    }

    render() {
        return null;
    }

}

const mapStateToProps = store => ({
    auth: store.auth
});

const mapDispatchToProps = dispatch => ({
    authActions: bindActionCreators(authActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(UserData);