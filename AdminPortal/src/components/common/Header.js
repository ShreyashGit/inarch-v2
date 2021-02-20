import React, {Fragment} from 'react';
import {Utility} from '../../modules/Utility';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import Axios from 'axios';
import {config} from '../../config';
import { MacLogo } from './icons';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import logo from "../../assets/img/logo.png";

const empTypes = Utility.getEmpTypes();
const headerTiles = [
    {
        label: "Customer",
        url: "/customer",
        accessibleTo: [0, 2, 3, 5, 7, 8, 9]
    },
    {
        label: "Employees",
        url: "/users",
        accessibleTo: [0]
    }
];

class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            headerTiles: []
        };
    }

    componentDidMount() {
        this.setState({headerTiles: this.getAccessibleTiles(Utility.getUserRole())});
    }

    getAccessibleTiles(role) {
        return headerTiles.filter(item => item.accessibleTo.includes(parseInt(role)));
    }

    async handleLogout() {
        await Axios.post(config.endpoints.auths + "/logout");
        Utility.removeAuthenticationToken();
        this.props.history.push("/login")
    }

    getSettingDropDown() {
        return <UncontrolledDropdown
            onClick={e => e.stopPropagation()}>
            <DropdownToggle tag="div"
                color="white">
                <span className="nav-item nav-link "><i
                                className="fa fa-gear font-18"/></span>
            </DropdownToggle>
            <DropdownMenu right>
                <DropdownItem onClick={() => this.props.history.push("/templates")}><i className="fas fa-receipt mr-2"
                                                                                       aria-hidden="true"/>Template
                    settings</DropdownItem>
                <DropdownItem onClick={() => this.props.history.push("/paymentSetting")}><i className="fas fa-key mr-2"
                                                                                            aria-hidden="true"/>Payment
                    settings</DropdownItem>
                <DropdownItem onClick={() => this.props.history.push("/reports")}><i className="fas fa-chart-line mr-2"
                                                                                     aria-hidden="true"/>Reports</DropdownItem>
                <DropdownItem key="divider" divider/>
                <DropdownItem onClick={this.handleLogout.bind(this)}>
                    <i className="fa fa-power-off"/> Logout</DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    }

    render() {
        let {itemActive, auth} = this.props;
        let userRole = parseInt(Utility.getUserRole());
        let userType = empTypes.find(x => x.key === userRole);
        return (
            <Fragment>
                <nav className="navbar navbar-expand-md navbar-light header p-0">
                <span className="cursor-pointer navbar-brand mr-0 mb-2"
                      onClick={() => window.location.href = "/customer"}>
                    {/*<MacLogo width={130} height={50}/>*/}
                </span>
                    <span> <img src={logo} height="28" width={150} alt="MAC Vehicles"/> </span>

                    <button type="button" className="navbar-toggler" data-toggle="collapse"
                            data-target="#navbarCollapse">
                        <span className="navbar-toggler-icon"/>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarCollapse">
                        <div className="navbar-nav">
                            {this.state.headerTiles.map((item, index) => (
                                <span className={`nav-item nav-link ${itemActive === index + 1 ? "active" : ""}`}
                                      onClick={() => window.location.href = item.url}>
                                        {item.label}</span>
                            ))}
                        </div>
                        <div className="navbar-nav ml-auto">
                            <div className="nav-item user-area">
                                <span className="d-block">{userType ? userType.value : "Super User"}</span>
                                <span className="d-block">{auth.userData.fullName}</span>
                            </div>
                            <span className="nav-item nav-link" onClick={this.handleLogout.bind(this)}><i
                                className="fa fa-power-off"/></span>
                            {/*{userRole === 0 && this.getSettingDropDown()}*/}
                        </div>
                    </div>
                </nav>
            </Fragment>
        );
    }
}

const mapStateToProps = store => ({
    auth: store.auth
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));