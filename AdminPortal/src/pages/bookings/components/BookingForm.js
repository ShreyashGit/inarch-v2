import React, {Fragment} from 'react';
import AsyncSelect from 'react-select/async';
import {withRouter} from 'react-router-dom';
import {Collapse, Modal, ModalBody, ModalHeader, ModalFooter} from 'reactstrap';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as bookingActions from "../../../actions/bookingActions";
import * as commonActions from "../../../actions/commonActions";
import * as userActions from "../../../actions/userActions";
import * as productModelActions from "../../../actions/productModelActions";

import {Utility} from '../../../modules/Utility';
import {config} from "../../../config";
import Axios from "axios";
import Select from "react-select";
import * as Alerts from "../../../components/common/Alert";
import {CustomLoader, Loader} from "../../../components/common/Loaders";
import Moment from 'moment';
import Search from "../../../components/common/Search"
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";

const genderTypes = Utility.getGenderTypes();
const bookingStates =Utility.getBookingStates();
class BookingForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isEditMode: false,
            collapseCustomer: true,
            collapseModel: true,
            collapseStatus: true,
            collapseResponse: true,
            currentPageCustomerRes: 1,
            customerResLoading: false,
        };
        this.formRef = React.createRef();
    }

    async componentDidMount() {
        await this.getAllModels();
        let bookingId = this.props.match.params.bookingId;
        if (bookingId) {
            this.setState({
                isEditMode: true, collapseCustomer: false,
                collapseModel: false,
            });
            await this.props.bookingActions.getBookingById({_id: bookingId});
            let {selectedBooking} = this.props.booking;

            this.props.commonActions.setLoading(false);

            let address = {
                address: (selectedBooking.addressLine) ? selectedBooking.addressLine : '',
                area: (selectedBooking.area) ? selectedBooking.area : '',
                city: (selectedBooking.city) ? selectedBooking.city : '',
                state: (selectedBooking.state) ? selectedBooking.state : '',
                address2: (selectedBooking.addressLine2) ? selectedBooking.addressLine2 : '',
            }
            this.props.commonActions.setAddress(address);

            await this.getCustomerResList();
        }
    }

    async getCustomerResList() {
        let {selectedBooking} = this.props.booking;
        this.setState({customerResLoading: true});
        await this.props.bookingActions.getCustomerResponseList({
            bookingId: selectedBooking._id,
            currentPage: this.state.currentPageCustomerRes
        });
        this.setState({customerResLoading: false});
    }

    async getAllModels() {
        await this.props.productModelActions.getProductModelList({
            type: "",
            searchText: "",
            currentPage: "",
            divId: ""
        });
        this.props.commonActions.setLoading(false);
    }

    toggleCustomerCollapse() {
        this.setState({collapseCustomer: !this.state.collapseCustomer});
    }

    toggleStatusCollapse() {
        this.setState({collapseStatus: !this.state.collapseStatus});
    }

    toggleResponseCollapse() {
        this.setState({collapseResponse: !this.state.collapseResponse});
    }

    toggleModelCollapse() {
        this.setState({collapseModel: !this.state.collapseModel});
    }

    async handleMobileNumberChange(key, e) {
        Utility.validateInput(e.target);
        let {selectedBooking} = this.props.booking;
        selectedBooking[key] = e.target.value;
        this.props.bookingActions.setSelectedBooking(selectedBooking);
    }

    handleCustomerDetailChange(key, e) {
        Utility.validateInput(e.target);
        let {selectedBooking} = this.props.booking;
        selectedBooking[key] = e.target.value;
        this.props.bookingActions.setSelectedBooking(selectedBooking);
    }

    handleBookingDetailChange(key, e) {
        let value = ""
        if (key === "make") {
            value = e.value;
        } else {
            Utility.validateInput(e.target);
            value = e.target.value
        }

        let {selectedBooking} = this.props.booking;
        selectedBooking[key] = value;
        this.props.bookingActions.setSelectedBooking(selectedBooking);
    }

    onAddressSelect() {
        let {address} = this.props.common;
        let {selectedBooking} = this.props.booking;
        selectedBooking.city = address.city;
        selectedBooking.area = address.area;
        selectedBooking.state = address.state;
        selectedBooking.addressLine = address.address;
        selectedBooking.addressLine2 = address.address2;

        this.props.bookingActions.setSelectedBooking(selectedBooking)
    }

    getCustomerDetailsForm() {
        let {selectedBooking} = this.props.booking;
        let {status} = selectedBooking;
        let {isEditMode} = this.state;
        let userRoleId = Utility.getUserRole();
        return (
            <Fragment>
                <div className="row pt-2">
                    <div className="col-sm-6 p-0">
                        <div className="col-sm-12">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" className="form-control" placeholder="Enter First Name"
                                       disabled={userRoleId !== "0"}
                                       value={selectedBooking.firstName}
                                       onChange={this.handleCustomerDetailChange.bind(this, "firstName")} required/>
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <div className="form-group">
                                <label>Middle Name</label>
                                <input type="text" className="form-control" placeholder="Enter Middle Name"
                                       disabled={userRoleId !== "0"}
                                       value={selectedBooking.middleName}
                                       onChange={this.handleCustomerDetailChange.bind(this, "middleName")}/>
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" className="form-control" placeholder="Enter Last Name"
                                       disabled={userRoleId !== "0"}
                                       value={selectedBooking.lastName}
                                       onChange={this.handleCustomerDetailChange.bind(this, "lastName")} required/>
                            </div>
                        </div>

                        <div className="col-sm-12">
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" className="form-control" placeholder="Enter phone-1"
                                       disabled={userRoleId !== "0"}
                                       value={selectedBooking.phoneNo}
                                       pattern={Utility.getMobilePattern()} maxLength="10"
                                       onChange={this.handleMobileNumberChange.bind(this, "phoneNo")}/>
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <div className="form-group">
                                <input type="tel" className="form-control mt-2" placeholder="Enter phone-2"
                                       disabled={userRoleId !== "0" && status && status > 1}
                                       value={selectedBooking.phoneNo2}
                                       pattern={Utility.getMobilePattern()} maxLength="10"
                                       onChange={this.handleMobileNumberChange.bind(this, "phoneNo2")}/>
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <div className="form-group">
                                <input type="tel" className="form-control mt-2" placeholder="Enter phone-3"
                                       disabled={userRoleId !== "0" && status && status > 1}
                                       value={selectedBooking.phoneNo3}
                                       pattern={Utility.getMobilePattern()} maxLength="10"
                                       onChange={this.handleMobileNumberChange.bind(this, "phoneNo3")}/>
                            </div>
                        </div>

                        <div className="col-sm-12 ">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" className="form-control" placeholder="Enter Email Address"
                                       value={selectedBooking.email} pattern={Utility.getEmailPattern()}
                                       onChange={this.handleCustomerDetailChange.bind(this, "email")}/>

                            </div>
                        </div>

                        <div className="row m-0">
                            <div className="col-sm-6 pr-0">
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select className="form-control cursor-pointer" value={selectedBooking.gender}
                                            onChange={this.handleCustomerDetailChange.bind(this, "gender")}>
                                        <option value="">Select Gender</option>
                                        {genderTypes.map((item, index) => <option key={index}
                                                                                  value={item}>{item}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input type="date" className="form-control" placeholder="Select date"
                                           value={selectedBooking.dateOfBirth ? Utility.formatDateOfBirth(selectedBooking.dateOfBirth) : ""}
                                           onChange={this.handleCustomerDetailChange.bind(this, "dateOfBirth")}/>

                                </div>
                            </div>
                        </div>
                        {isEditMode && <div className="col-sm-12">
                            <div className="form-group">
                                <label>Agent</label>
                                <input type="text" className="form-control" placeholder="Assigned Name"
                                       readOnly={true}
                                       value={selectedBooking.assignedUserName}/>
                            </div>
                        </div>}
                    </div>

                    <div className="col-sm-6 pr-0">
                        <div className="col-sm-12">
                            <div className="form-group">
                                <label>Current address</label>
                                <Search onAddressSelect={this.onAddressSelect.bind(this)} hideForm={false}/>
                            </div>
                        </div>
                    </div>
                </div>

            </Fragment>
        );
    }

    onRegistrationAddressSelect(address) {
        let {selectedBooking} = this.props.booking;
        selectedBooking.regCity = address.city;
        selectedBooking.regArea = address.area;
        selectedBooking.regState = address.state;
        selectedBooking.regAddressLine = address.address;

        this.props.bookingActions.setSelectedBooking(selectedBooking)
    }

    getModelDetailsForm() {
        let {selectedBooking} = this.props.booking;
        let makeOptions = [];
        let makes = this.props.model.records;
        let userRoleId = Utility.getUserRole();

        for (let item of makes) {
            makeOptions.push({value: item.makeName, label: item.makeName});
        }

        return <Fragment>
            <div className="row pt-2 position-relative">
                {userRoleId === "2" && <div className="page-overlay" style={{backgroundColor: "#5f5f5f40", zIndex:10}}/>}

                <div className="col-sm-6 p-0">

                    <div className="col-sm-12">
                        <div className="form-group">
                            <label>Reg no.</label>
                            <input type="text" className="form-control" placeholder="Enter reg no"
                                   value={selectedBooking.regNo ? selectedBooking.regNo.toUpperCase() : ""}
                                   onChange={this.handleBookingDetailChange.bind(this, "regNo")} required/>
                        </div>
                    </div>

                    <div className="col-sm-12">
                        <div className="form-group">
                            <label>Model</label>
                            <input type="text" className="form-control" placeholder="Enter model"
                                   value={selectedBooking.model}
                                   onChange={this.handleBookingDetailChange.bind(this, "model")} required/>
                        </div>
                    </div>

                    <div className="col-sm-12">
                        <div className="form-group">
                            <label>Make/Manufacturer</label>
                            <Select
                                placeholder="Select make"
                                className="async-select-dropdown form-control p-0"
                                value={{value: selectedBooking.make, label: selectedBooking.make}}
                                options={makeOptions}
                                onChange={this.handleBookingDetailChange.bind(this, "make")}
                                required/>
                        </div>
                    </div>

                    <div className="col-sm-12">
                        <div className="form-group">
                            <label>Make/Manufacturer year</label>

                            <input type="number" placeholder="YYYY" min="1947" max="9999" className="form-control"
                                   placeholder="Enter year"
                                   value={selectedBooking.makeYear}
                                   onChange={this.handleBookingDetailChange.bind(this, "makeYear")} required/>
                        </div>
                    </div>
                    <div className="col-sm-12 ">
                        <div className="form-group">
                            <label>Chassis no</label>
                            <input type="text" className="form-control" placeholder="Enter chassis no"
                                   value={selectedBooking.chassis}
                                   onChange={this.handleBookingDetailChange.bind(this, "chassis")} required/>

                        </div>
                    </div>
                    <div className="col-sm-12">
                        <div className="form-group">
                            <label>Engine no</label>
                            <input type="text" className="form-control" placeholder="Enter engine no"
                                   value={selectedBooking.engine}
                                   onChange={this.handleBookingDetailChange.bind(this, "engine")} required/>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 pr-0">
                    <div className="col-sm-12">
                        <div className="form-group border rounded p-2">
                            <label>Registration Address</label>

                            <Search onAddressSelect={this.onRegistrationAddressSelect.bind(this)} hideForm={true}/>

                            <div className="d-flex justify-content-around mb-2">
                                <span className="flex-grow-1"> <b>City : </b>{selectedBooking.regCity}</span>
                                <span className="flex-grow-1"> <b>Area : </b>{selectedBooking.regArea}</span>
                                <span className="flex-grow-1"> <b>State : </b>{selectedBooking.regState}</span>
                            </div>
                            <div><b>Address line 1 : </b>{selectedBooking.regAddressLine} </div>

                            <label className="mt-2">Address line 2</label>
                            <input className="form-control" placeholder="Enter address line 2"
                                   value={selectedBooking.regAddressLine2}
                                   onChange={this.handleBookingDetailChange.bind(this, "regAddressLine2")}
                            />

                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    }

    getCustomerStatus() {
        let {selectedBooking} = this.props.booking;
        let {recordsCustomerRes} = this.props.booking;
        let userRoleId = Utility.getUserRole();
        let customerSource = ["Agent", "In-House", "Dealer", "Others"];
        let customerStatus = bookingStates;

        if (!this.state.isEditMode) {
            customerStatus = customerStatus.filter(x => x === "Fresh call");
        }
        return (
            <Fragment>
                <div className="row pt-2">
                    <div className="col-sm-3 ">
                        <div className="form-group">
                            <label>Status</label>
                            <select className="form-control cursor-pointer" value={selectedBooking.status}
                                    onChange={this.handleBookingDetailChange.bind(this, "status")} required>
                                <option value="">Select status</option>
                                {customerStatus.map((item, index) => <option key={index} hidden={userRoleId === "2" && item === "Fresh call"}
                                                                             value={item}>{item}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="col-sm-3 ">
                        <div className="form-group">
                            <label>Source</label>
                            <select className="form-control cursor-pointer" value={selectedBooking.source}
                                    onChange={this.handleBookingDetailChange.bind(this, "source")} required>
                                <option value="">Select source</option>
                                {customerSource.map((item, index) => <option key={index}
                                                                             value={item}>{item}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label>Source name</label>
                            <input type="text" className="form-control" placeholder="Enter source name"
                                   value={selectedBooking.sourceName}
                                   onChange={this.handleBookingDetailChange.bind(this, "sourceName")} required/>
                        </div>
                    </div>

                    <div className="col-sm-3">
                        <div className="form-group">
                            <label>Insurance date</label>
                            <input type="date" className="form-control" placeholder="Select insurance date"
                                   value={selectedBooking.insuranceDate ? Utility.formatDateOfBirth(selectedBooking.insuranceDate) : ""}
                                   onChange={this.handleBookingDetailChange.bind(this, "insuranceDate")}/>
                        </div>
                    </div>

                    <div className="col-sm-3">
                        <div className="form-group">
                            <label>Net premium</label>
                            <input type="number" className="form-control" placeholder="Enter net premium"
                                   value={selectedBooking.netPremium}
                                   onChange={this.handleBookingDetailChange.bind(this, "netPremium")}/>
                        </div>
                    </div>

                    <div className="col-sm-3">
                        <div className="form-group">
                            <label>Gross premium</label>
                            <input type="number" className="form-control" placeholder="Enter gross premium"
                                   value={selectedBooking.grossPremium}
                                   onChange={this.handleBookingDetailChange.bind(this, "grossPremium")}/>
                        </div>
                    </div>

                    <div className="col-sm-3">
                        <div className="form-group">
                            <label>IDV</label>
                            <input type="text" className="form-control" placeholder="Enter IDV"
                                   value={selectedBooking.idv}
                                   onChange={this.handleBookingDetailChange.bind(this, "idv")}/>
                        </div>
                    </div>

                    <div className="col-sm-3">
                        <div className="form-group">
                            <label>Insurance company</label>
                            <input type="text" className="form-control" placeholder="Enter insurance company"
                                   value={selectedBooking.insuranceCompany}
                                   onChange={this.handleBookingDetailChange.bind(this, "insuranceCompany")}/>

                        </div>
                    </div>

                    {this.state.isEditMode && <Fragment>
                        <div className="col-sm-3">
                            <div className="form-group">
                                <label>Reschedule date</label>
                                <input type="date" className="form-control" placeholder="Select reschedule date"
                                       value={selectedBooking.rescheduleDate ? Utility.formatDateOfBirth(selectedBooking.rescheduleDate) : ""}
                                       onChange={this.handleBookingDetailChange.bind(this, "rescheduleDate")}/>
                            </div>
                        </div>

                        <div className="col-sm-6">
                            <div className="form-group">
                                <label>Last
                                    response{recordsCustomerRes.length > 0 && ` on ${Utility.formatTimestamp(recordsCustomerRes[0].createdAt)}`}</label>
                                <textarea className="form-control border rounded" style={{height: 130}}
                                          placeholder="No last response found"
                                          value={recordsCustomerRes.length > 0 ? recordsCustomerRes[0].response : ""}
                                          readOnly={true}/>
                            </div>
                        </div>
                    </Fragment>}
                </div>

            </Fragment>
        );
    }

    async saveCustomerResponse(e) {
        if (e) e.preventDefault();
        let {customerResponse} = this.state;
        let {selectedBooking} = this.props.booking;
        await this.props.bookingActions.addCustomerResponse({
            response: customerResponse,
            bookingId: selectedBooking._id.toString()
        });
        this.setState({customerResponse: ""})
        await this.getCustomerResList();
    }

    async onCustomerResPageChange(page = 1) {
        await this.setState({currentPageCustomerRes: page});
        await this.getCustomerResList();
    }

    formatDate(row, cell) {
        return Utility.formatTimestamp(cell.createdAt);
    }

    getCustomerResponseTable() {
        let {recordsTotalCustomerRes, recordsCustomerRes} = this.props.booking;
        console.log(this.props.booking)
        let recordsTotal = recordsTotalCustomerRes
        let records = recordsCustomerRes;
        let currentPage = this.state.currentPageCustomerRes;
        let loading = this.state.customerResLoading;

        let options = {
            noDataText: loading ? <CustomLoader isLoading={true} size={25}/> :
                <span className="text-muted text-center">You have not added anything yet</span>,
            page: currentPage,
            sizePerPage: 10,
            pageStartIndex: 1,
            hideSizePerPage: true,
            onPageChange: this.onCustomerResPageChange.bind(this)
        };
        let selectRow = {
            mode: 'radio',
            clickToSelect: true,
            hideSelectColumn: true,
        };
        return (
            <div>
                <BootstrapTable
                    striped={true}
                    tableHeaderClass="mb-0 "
                    data={records}
                    bordered={true}
                    options={options}
                    remote={true}
                    fetchInfo={{dataTotalSize: recordsTotal}}
                    pagination={recordsTotal > 10}
                    selectRow={selectRow}
                >
                    {/*{activeTab === 0 &&  <TableHeaderColumn width="100" dataField='status'*/}
                    {/*                                        // dataFormat={this.getStatus.bind(this)}*/}
                    {/*                                        // columnClassName={this.statusClassNameFormat.bind(this)}*/}
                    {/*>Status</TableHeaderColumn>}*/}
                    <TableHeaderColumn width="200"
                                       dataField='response'
                                       isKey={true}
                                       columnClassName="cursor-none"
                    >Customer response</TableHeaderColumn>
                    <TableHeaderColumn width="50" dataField='createdAt'
                                       dataFormat={this.formatDate.bind(this)}
                                       columnClassName="cursor-none">
                        Created on
                    </TableHeaderColumn>


                </BootstrapTable>

            </div>);
    }

    getCustomerResponseForm() {
        let {customerResponse} = this.state;
        return (<div className="row pt-2">

            <div className="col-sm-6">
                <div className="form-group">
                    <label>Response</label>
                    <textarea className="form-control border rounded"
                              value={customerResponse}
                              onChange={(e) => {
                                  this.setState({customerResponse: e.target.value})
                              }}
                              style={{height: 130}} placeholder="Enter customer response"
                    />
                    <div className="text-right mt-1">
                        <button className="btn btn-primary"
                                disabled={!customerResponse}
                                onClick={this.saveCustomerResponse.bind(this)}>+ Add
                        </button>
                    </div>
                </div>
            </div>

            <div className="col-sm-12 mt-3">
                {this.getCustomerResponseTable()}
            </div>

        </div>);
    }


    isInValidForm() {
        if (!Utility.validateForm(this.formRef)) {
            Alerts.error("Something went wrong", "Please fill all the details");
            return true;
        }

        let {selectedBooking} = this.props.booking;

        if (!selectedBooking.regCity || !selectedBooking.regState || !selectedBooking.make) {
            Alerts.error("Something went wrong", "Registration city or state or make is missing");
            return true;
        }

        if (selectedBooking.status === "Reschedule call" && !selectedBooking.rescheduleDate) {
            Alerts.error("Something went wrong", "Reschedule date is required if status set to reschedule");
            return true;
        }

        return false
    }

    async handleSave(e) {
        if (e) e.preventDefault();
        if (this.isInValidForm()) {
            return;
        }

        let {selectedBooking} = this.props.booking;
        let {isEditMode} = this.state;

        if (isEditMode) {
            await this.props.bookingActions.updateBooking({
                _id: selectedBooking._id,
                data: selectedBooking
            });
        } else {
            try {
                this.props.commonActions.setLoading(true);
                let response = await Axios.post(config.endpoints.bookings, {data: selectedBooking});
                this.props.commonActions.setLoading(false);
                if (response && response.data && response.data.error) {
                    let result = await Alerts.confirm(
                        "",
                        response.data.error,
                        "View customer",
                        false,
                        "error",
                        false);
                    if (result.value) {
                        window.location.href = "/bookings/edit/" + response.data.booking._id;
                    }
                    return;
                }
            } catch (e) {
                this.props.commonActions.setLoading(false);
                return;
            }
        }

        Alerts.success();
        this.props.commonActions.setLoading(false);
        this.props.history.push(`/customer`);
    }

    a

    render() {
        let {selectedBooking} = this.props.booking;
        let {isEditMode} = this.state;
        let {recordsTotalCustomerRes} = this.props.booking;

        return (
            <div className="content-wrapper">
                <div className="position-relative">
                    <Loader isLoading={this.props.common.loading} background="#c5c5c578"/>
                    <header className="content-header d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h5 className="mb-0 font-weight-bolder">
                            <span className="cursor-pointer" onClick={() => this.props.history.goBack()}><i
                                className="fa fa-long-arrow-left mr-2 small"/></span>
                                {isEditMode ? selectedBooking.firstName + " " + selectedBooking.lastName : "New customer"}
                            </h5>
                            {isEditMode &&
                            <p className="mb-0 text-gray-500 font-13">{selectedBooking.regNo && selectedBooking.regNo.toUpperCase()} &nbsp;|&nbsp; Created
                                Date: {Utility.formatTimestamp(selectedBooking.createdAt)}</p>}
                        </div>

                        <div>
                            <button className="btn btn-primary px-4 py-2"
                                    disabled={selectedBooking.status === 3}
                                    onClick={this.handleSave.bind(this)}>Save
                            </button>
                        </div>

                    </header>

                    <section>
                        <form ref={this.formRef} noValidate onSubmit={this.handleSave.bind(this)}>

                            <div className="accordion-card border-radius-8 mb-2">
                                <h5 className="d-flex font-weight-semi-bold cursor-pointer mb-0"
                                    onClick={this.toggleStatusCollapse.bind(this)}>Customer Insurance Status <i
                                    className={`fa ml-auto font-14 ${this.state.collapseStatus ? "fa-angle-down" : "fa-angle-right"}`}/>
                                </h5>
                                {this.state.isEditMode &&
                                <p className="mb-0 pt-2 text-gray-700 font-weight-bolder font-13 mb-1">
                                    Follow count : {recordsTotalCustomerRes ? recordsTotalCustomerRes : 0}
                                </p>}
                                <Collapse isOpen={this.state.collapseStatus}>
                                    <div className="panel mt-2 pt-0">
                                        {this.getCustomerStatus()}
                                    </div>
                                </Collapse>
                            </div>

                            {this.state.isEditMode && <div className="accordion-card border-radius-8 mb-2">
                                <h5 className="d-flex font-weight-semi-bold cursor-pointer mb-0"
                                    onClick={this.toggleResponseCollapse.bind(this)}>Customer Response <i
                                    className={`fa ml-auto font-14 ${this.state.collapseResponse ? "fa-angle-down" : "fa-angle-right"}`}/>
                                </h5>
                                <Collapse isOpen={this.state.collapseResponse}>
                                    <div className="panel mt-2 pt-0">
                                        {this.getCustomerResponseForm()}
                                    </div>
                                </Collapse>
                            </div>}

                            <div className="accordion-card border-radius-8 mb-2">
                                <h5 className="d-flex font-weight-semi-bold cursor-pointer mb-0"
                                    onClick={this.toggleCustomerCollapse.bind(this)}>Customer Details <i
                                    className={`fa ml-auto font-14 ${this.state.collapseCustomer ? "fa-angle-down" : "fa-angle-right"}`}/>
                                </h5>
                                <Collapse isOpen={this.state.collapseCustomer}>
                                    <div className="panel mt-2 pt-0">
                                        {this.getCustomerDetailsForm()}
                                    </div>
                                </Collapse>
                            </div>

                            <div className="accordion-card border-radius-8 mb-2">
                                <h5 className="d-flex font-weight-semi-bold cursor-pointer mb-0"
                                    onClick={this.toggleModelCollapse.bind(this)}>Vehicle Details <i
                                    className={`fa ml-auto font-14 ${this.state.collapseModel ? "fa-angle-down" : "fa-angle-right"}`}/>
                                </h5>
                                <Collapse isOpen={this.state.collapseModel}>
                                    <div className="panel mt-2 pt-0">
                                        {this.getModelDetailsForm()}
                                    </div>
                                </Collapse>
                            </div>

                        </form>
                    </section>

                </div>
            </div>
        );
    }
}

const mapStateToProps = store => ({
    common: store.common,
    booking: store.booking,
    user: store.user,
    model: store.model,
    auth: store.auth
});

const mapDispatchToProps = dispatch => ({
    commonActions: bindActionCreators(commonActions, dispatch),
    bookingActions: bindActionCreators(bookingActions, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
    productModelActions: bindActionCreators(productModelActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(BookingForm));