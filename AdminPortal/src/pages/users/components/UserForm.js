import React , {Fragment}from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as commonActions from "../../../actions/commonActions";
import * as userActions from "../../../actions/userActions";
import {Loader} from '../../../components/common/Loaders';
import {Utility} from '../../../modules/Utility';
import {config} from '../../../config';
import * as Alerts from "../../../components/common/Alert";
import Select from "react-select";
import Search from "../../../components/common/Search"
import {BsTrash} from "react-icons/bs";
import * as productModelActions from "../../../actions/productModelActions";
const empTypes = Utility.getEmpTypes();
class UserForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isEditMode: false,
            currentPage: 1,
        };
        this.formRef = React.createRef();
    }

    async componentDidMount() {
        let userId = this.props.match.params.userId;
        await this.getAllModels();

        if (userId) {
            this.setState({isEditMode: true});
            await this.props.userActions.getUserById({_id: userId});
            let {selectedUser} = this.props.user;

            let address={
                address: (selectedUser.addressLine) ? selectedUser.addressLine : '',
                area: (selectedUser.area) ? selectedUser.area : '',
                city: (selectedUser.city) ? selectedUser.city : '',
                state: (selectedUser.state) ? selectedUser.state : '',
                address2: (selectedUser.addressLine2) ? selectedUser.addressLine2 : '',
            }
            this.props.commonActions.setAddress(address);

        }
        this.props.commonActions.setLoading(false);
    }

    async getAllModels(){
        await this.props.productModelActions.getProductModelList({type: "", searchText: "", currentPage: "", divId: ""});
        this.props.commonActions.setLoading(false);
    }

    async handleValueChange(key, e) {
        Utility.validateInput(e.target);
        let value = e.target.value;
        let {selectedUser} = this.props.user;
        selectedUser[key] = value;
        this.props.userActions.setSelectedUser(selectedUser);
    }

    async handleUserTypeChange(e) {
        let {selectedUser} = this.props.user;
        selectedUser.type = Number(e.target.value);
        this.props.userActions.setSelectedUser(selectedUser);
    }

    getBasicDetailsForm() {
        let {selectedUser} = this.props.user;
        let {isEditMode} = this.state;
        return (
            <div className="row">
                <div className="col-sm-12">
                    <div className="form-group">
                        <label>Type</label>
                        <select className="form-control cursor-pointer" value={selectedUser.type}
                                disabled={isEditMode && selectedUser.type !== 10}
                                onChange={this.handleUserTypeChange.bind(this)} required>
                            <option value="">Select Type</option>
                            {empTypes.map((item, index) => <option key={index} value={item.key}>{item.value}</option>)}
                        </select>
                    </div>
                </div>

                <div className="col-sm-12">
                    <div className="form-group">
                        <label>First Name</label>
                        <input type="text" className="form-control" placeholder="Enter First Name"
                               value={selectedUser.firstName} onChange={this.handleValueChange.bind(this, "firstName")}
                               required/>
                    </div>
                </div>
                <div className="col-sm-12">
                    <div className="form-group">
                        <label>Middle Name</label>
                        <input type="text" className="form-control" placeholder="Enter Middle Name"
                               value={selectedUser.middleName}
                               onChange={this.handleValueChange.bind(this, "middleName")}
                               required/>
                    </div>
                </div>
                <div className="col-sm-12">
                    <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" className="form-control" placeholder="Enter Last Name"
                               value={selectedUser.lastName} onChange={this.handleValueChange.bind(this, "lastName")}
                               required/>
                    </div>
                </div>
                <div className="col-sm-12">
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" className="form-control" placeholder="Enter Phone Number"
                               value={selectedUser.phoneNo}
                               onChange={this.handleValueChange.bind(this, "phoneNo")} required
                               pattern={Utility.getMobilePattern()}/>
                    </div>
                </div>
                <div className="col-sm-12">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="form-control" placeholder="Enter Email Address"
                               value={selectedUser.email} onChange={this.handleValueChange.bind(this, "email")}
                               pattern={Utility.getEmailPattern()}/>
                    </div>
                </div>
            </div>
        );
    }

    getAddressDetailsForm() {
        return (
            <div className="row">

                <div className="col-sm-12">
                    <div className="form-group">
                        <label>Search address</label>
                        <Search onAddressSelect = {this.onAddressSelect.bind(this)} hideForm={false}/>
                    </div>
                </div>
            </div>
        );
    }

    onAddressSelect(){
        let {address} = this.props.common;
        let {selectedUser} = this.props.user;
        selectedUser.city = address.city;
        selectedUser.area = address.area;
        selectedUser.state = address.state;
        selectedUser.addressLine = address.address;
        selectedUser.addressLine2 = address.address2;
        this.props.userActions.setSelectedUser(selectedUser);
    }

    async handleSave(e) {
        if (e) e.preventDefault();
        if (!Utility.validateForm(this.formRef)) {
            Alerts.error("Something went wrong", "Please fill all the details");
            return null;
        }

        let {selectedUser} = this.props.user;

        let {isEditMode} = this.state;

        if (isEditMode) {
            selectedUser.assignAgents = [];
            await this.props.userActions.updateUser({_id: selectedUser._id, data: selectedUser});

        } else {
            selectedUser.password = "1234567";
            await this.props.userActions.AddUser({data: selectedUser});
        }

        Alerts.success();
        this.props.commonActions.setLoading(false);
        if (isEditMode) {
            this.props.history.goBack();
        } else {
            this.props.history.push(`/users?tab=${selectedUser.type}`);
        }
    }

    async changeStatus(status) {
        let {selectedUser} = this.props.user;
        if (selectedUser.status === status) return null;
        let result = await Alerts.confirm(
            status === "Active" ? "Active User" : "Disable User",
            "Are you sure?",
            "Confirm");

        if (!result.value) return;
        if (!Utility.validateForm(this.formRef)) {
            Alerts.error("Something went wrong", "Please fill all the details");
            return;
        }
        selectedUser.status = status;
        this.props.userActions.setSelectedUser(selectedUser);
        await this.props.commonActions.updateStatus(config.endpoints.userStatus, {
            _id: selectedUser._id,
            status: status
        });
        // Alerts.success();
        this.props.commonActions.setLoading(false);
    }

    onAddArea(address){
        let {selectedUser} = this.props.user;
        if((!!selectedUser.assignedAreas.find(x => x === address.city)) || !address.city ) return;
        selectedUser.assignedAreas.push(address.city);
        this.props.userActions.setSelectedUser(selectedUser);
    }

    removeAssignedArea(item) {
        let {selectedUser} = this.props.user;
        selectedUser.assignedAreas = selectedUser.assignedAreas.filter(x => x !== item)
        this.props.userActions.setSelectedUser(selectedUser);
    }

    getAssignDivisionForAgent(){
        return (
            <div className="row">
                <div className="col-sm-6">
                    {this.getAssignArea()}
                </div>

                <div className="col-sm-6">
                    {this.getMakeAssign()}
                </div>

            </div>
        )
    }

    removeAssignedMake(item){
        let {selectedUser} = this.props.user;
        selectedUser.assignedMakes = selectedUser.assignedMakes.filter(x => x !== item)
        this.props.userActions.setSelectedUser(selectedUser);
    }

    getMakeAssign(){
        let {selectedUser} = this.props.user;

        let makes =  <div className="mt-2 ">

                    <span className="shadow-sm mr-2 mb-2 bg-gray-100 py-2 px-3 font-weight-bolder font-13 border-radius-4 d-inline-flex flex-wrap">
                                        <div className="d-flex">
                                             <span className="mr-2">Make not assigned</span>
                                        </div>
                                </span>

        </div>

        if(selectedUser.assignedMakes.length !== 0){
            makes = <div className="mt-2">
                {selectedUser.assignedMakes.map((item, index) => {

                    return (
                        <span className="mr-2 mb-2  bg-success text-white py-2 px-3 font-weight-bolder font-13 border-radius-4 d-inline-flex flex-wrap"
                              key={index}>
                                        <div className="d-flex">
                                             <span className="mr-2">{item}</span>
                                            <span onClick={this.removeAssignedMake.bind(this, item)}
                                                  className="cursor-pointer text-danger"> <BsTrash/></span>
                                        </div>
                                </span>
                    )
                })}
            </div>
        }

        return (
            <Fragment>
                <div className="form-group">
                    <label>Search make</label>
                    <Select
                        placeholder="Search make"
                        className="async-select-dropdown form-control p-0"
                        getOptionValue={(option) => option._id}
                        getOptionLabel={(option) => option.makeName}
                        options={this.props.model.records}
                        onChange={this.handleModelData.bind(this)}
                    />
                </div>
                <div className=" shadow-sm form-group border my-3 p-2 rounded ">
                    <span className="font-weight-bold">Assigned makes</span>
                    {makes}
                </div>
            </Fragment>
        )
    }

    async handleModelData(e){
        let {selectedUser} = this.props.user;
        if(!!selectedUser.assignedMakes.find(x => x === e.makeName)) return;
        selectedUser.assignedMakes.push(e.makeName);
        this.props.userActions.setSelectedUser(selectedUser);
    }

    getAssignArea() {
        let {selectedUser} = this.props.user;

        let areas =  <div className="mt-2 ">

                    <span className="shadow-sm mr-2 mb-2 bg-gray-100 py-2 px-3 font-weight-bolder font-13 border-radius-4 d-inline-flex flex-wrap">
                                        <div className="d-flex">
                                             <span className="mr-2">City not assigned</span>
                                        </div>
                                </span>

        </div>

        if(selectedUser.assignedAreas.length !== 0){
            areas = <div className="mt-2">
                {selectedUser.assignedAreas.map((item, index) => {

                    return (
                        <span className="mr-2 mb-2  bg-success text-white py-2 px-3 font-weight-bolder font-13 border-radius-4 d-inline-flex flex-wrap"
                              key={index}>
                                        <div className="d-flex">
                                             <span className="mr-2">{item}</span>
                                            <span onClick={this.removeAssignedArea.bind(this, item)}
                                                  className="cursor-pointer text-danger"> <BsTrash/></span>
                                        </div>
                                </span>
                    )
                })}
            </div>
        }

        return (
            <Fragment>
                <div className="form-group">
                    <label>Search address</label>
                    <Search onAddressSelect={this.onAddArea.bind(this)} hideForm={true}/>
                </div>
                <div className=" shadow-sm form-group border my-3 p-2 rounded ">
                    <span className="font-weight-bold">Assigned cities</span>
                    {areas}
                </div>
            </Fragment>
        )
    }

    render() {
        let {common} = this.props;
        let {selectedUser} = this.props.user;
        let {isEditMode} = this.state;
        return (
            <div className="content-wrapper">
                <div className="position-relative">
                    <Loader isLoading={common.loading} background="#c5c5c578"/>

                    <header className="content-header d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h5 className="mb-0 font-weight-bolder">
                                <span className="cursor-pointer" onClick={() => this.props.history.goBack()}><i
                                    className="fa fa-long-arrow-left mr-2 small"/></span>
                                {isEditMode ? selectedUser.fullName : "New Employee"}
                            </h5>
                            {isEditMode &&
                            <p className="mb-0 text-gray-500 font-13">{selectedUser._id} &nbsp;|&nbsp; Created
                                Date: {Utility.formatTimestamp(selectedUser.createdAt)}</p>}
                        </div>
                        <button className="btn btn-primary pl-4 pr-4 pt-3 pb-3"
                                disabled={selectedUser.status === "Disabled"} onClick={this.handleSave.bind(this)}>SAVE
                        </button>
                    </header>

                    {isEditMode && <div className="mb-4 mt-2">
                        <div className="form-group mb-0">
                            <label>Status</label>
                            <div className="capsule-btn d-inline-block ml-4">
                                <span className={`success ${selectedUser.status === "Active" ? "active" : ""}`}
                                      onClick={this.changeStatus.bind(this, "Active")}>Active</span>
                                <span className={`disabled ${selectedUser.status === "Disabled" ? "active" : ""}`}
                                      onClick={this.changeStatus.bind(this, "Disabled")}>Disable</span>
                            </div>
                        </div>
                    </div>}

                    <section className="position-relative">
                        <form ref={this.formRef} noValidate onSubmit={this.handleSave.bind(this)}>
                            <div className="row">

                                {(selectedUser.type === 2 ) && <div className="col-sm-12 mb-2">
                                    <div className="accordion-card border-radius-8 mb-2 h-100">
                                        <h5 className="font-weight-semi-bold cursor-pointer">Assign Area/Make</h5>
                                        {this.getAssignDivisionForAgent()}
                                    </div>
                                </div>}

                                <div className="col-sm-6 mb-2">
                                    <div className="accordion-card border-radius-8 h-100">
                                        <h5 className="font-weight-semi-bold cursor-pointer">Basic Details</h5>
                                        {this.getBasicDetailsForm()}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="accordion-card border-radius-8 mb-2">
                                        <h5 className="font-weight-semi-bold cursor-pointer">Address Details</h5>
                                        {this.getAddressDetailsForm()}
                                    </div>
                                </div>
                            </div>
                        </form>
                        {selectedUser.status === "Disabled" ?
                            <div className="page-overlay" style={{backgroundColor: "#5f5f5f40"}}/> : null}
                    </section>
                </div>
            </div>
        );
    }
}

const mapStateToProps = store => ({
    common: store.common,
    user: store.user,
    model: store.model
});

const mapDispatchToProps = dispatch => ({
    commonActions: bindActionCreators(commonActions, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
    productModelActions: bindActionCreators(productModelActions, dispatch),

});

export default connect(mapStateToProps, mapDispatchToProps)(UserForm);