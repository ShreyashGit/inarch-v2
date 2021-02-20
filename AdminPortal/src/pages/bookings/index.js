import React from 'react';
import {withRouter} from 'react-router-dom';
import {Utility} from '../../modules/Utility';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as commonActions from "../../actions/commonActions";
import {Loader} from '../../components/common/Loaders';
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import * as bookingActions from "../../actions/bookingActions";
import "./bookings.scss";
import qs from 'querystring';
import Axios from "axios";
import {config} from "../../config";
import * as Alerts from "../../components/common/Alert";
import {Modal, ModalBody, ModalHeader, FormGroup,Input, Label, Progress} from "reactstrap";

const bookingStates = Utility.getBookingStates();

class Bookings extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: "Fresh call",
            searchText: "",
            resetSearch: false,
            showExcelModal: false,
            excelUploading: false
        };
    }

    async componentDidMount() {
        let query = qs.parse(window.location.search);
        let activeTab = query["?tab"] ? query["?tab"] : "Fresh call";
        let page = parseInt(query["page"]);
        let searchText = query["text"] ? query["text"] : "";
        await this.setState({activeTab, searchText, resetSearch: searchText ? true : false});
        if (page) {
            await this.props.bookingActions.setCurrentPage(page);
        }
        this.getAllBookings();
    }

    async getAllBookings() {
        let {activeTab, searchText} = this.state;
        let {booking} = this.props;

        await this.props.bookingActions.getBookingList({
            type: activeTab,
            searchText,
            currentPage: booking.currentPage
        });
        this.props.commonActions.setLoading(false);
    }

    async changeFilter(activeTab) {
        await this.setState({activeTab: activeTab, searchText: ""});
        this.filterBookingList();
    }

    async handleSelectRow(cell, row) {
        await this.props.bookingActions.setInitialState();
        this.props.history.push("/customer/edit/" + cell._id);
    }

    formatDate(row, cell) {
        return Utility.formatTimestamp(cell.createdAt);
    }

    getCustomerName(cell, row) {
        return row.firstName + " " + row.middleName + " " + row.lastName;
    }

    getProductName(cell, row) {
        return cell.productName;
    }

    getCustomerContact(cell, row) {
        return row.phoneNo;
    }

    getStatus(cell, row) {
        return bookingStates.find(x => x.key === cell).value;
    }

    statusClassNameFormat(fieldValue) {
        console.log(fieldValue)
       let value = bookingStates.indexOf(fieldValue) + 1
        if (value === 0) return;
        return `text-white booking-${value} cursor-none`
    }

    async resetSearchText() {
        await this.setState({searchText: ""});
        if (this.state.resetSearch) {
            this.filterBookingList();
        }
    }

    async filterBookingList(page = 1) {
        let {searchText, activeTab} = this.state;
        window.location.href = `/customer?tab=${activeTab}${page > 1 ? "&page=" + page : ""}${searchText ? "&text=" + searchText : ""}`;
    }

    async handleSearchValueChange(e) {
        let {value} = e.target;
        if (Utility.checkSpecialCharacters(value)) return;
        await this.setState({searchText: value});
        if (value === "" && this.state.resetSearch) {
            this.setState({resetSearch: false});
        }
    }

    getTalukaName(row, cell) {
        return row.taluka || row.district || "-";
    }

    async deleteBooking(id) {
        let result = await Alerts.confirm(
            "Are you sure?",
            "All you sure you want to delete this booking.",
            "Confirm");
        if (!result.value) return;

        let response = await Axios.delete(config.endpoints.bookings, {data: {bookingId: id}});
        console.log(response)
        if (response && response.data && response.data.Success) {
            await Alerts.success("Booking deleted successfully");
            window.location.reload();
        }

    }

    getEditBtn(cell, row) {
        let userRoleId = Utility.getUserRole();
        if (row.status === 1 && userRoleId === "0") return <div className="d-flex justify-content-evenly">
            <span title="Edit Booking" className="text-primary mr-2" onClick={this.handleSelectRow.bind(this, cell)}>
                 <i className="fa fa-pencil" aria-hidden="true"/>
            </span>
            <span title="Delete Booking">
                 <i className="fa fa-trash" onClick={this.deleteBooking.bind(this, cell)} aria-hidden="true"/>
             </span>
        </div>;
        return <span title="Edit Booking" className="text-primary d-flex justify-content-evenly"
                     onClick={this.handleSelectRow.bind(this, cell)}><i
            className="fa fa-pencil"
            aria-hidden="true"/>  Edit</span>
    }

    getBookingAmount(cell, row) {
        if (cell !== null && cell !== undefined) {
            return `${cell} Rs.`;
        }

        return `${row.totalPrice} Rs.`;
    }

    getBookingList() {
        let {recordsTotal, records, currentPage} = this.props.booking;
        let {loading} = this.props.common;
        let {activeTab} = this.state;

        if (loading) return <Loader isLoading={true} background="#c5c5c578"/>;
        let options = {
            noDataText: <span className="text-muted text-center">You have not added anything yet</span>,
            page: currentPage,
            sizePerPage: 10,
            pageStartIndex: 1,
            hideSizePerPage: true,
            onPageChange: this.filterBookingList.bind(this)
        };
        let selectRow = {
            mode: 'radio',
            clickToSelect: true,
            hideSelectColumn: true,
            onSelect: this.handleSelectRow.bind(this)
        };
        return (
            <div className="table-wrapper-booking">
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
                    <TableHeaderColumn width="200"
                                       dataField='regNo'
                                       isKey={true}
                    >Registration No</TableHeaderColumn>
                    <TableHeaderColumn width="200"
                                       dataFormat={this.getCustomerName.bind(this)}>Customer
                        Name</TableHeaderColumn>

                    <TableHeaderColumn width="120"
                                       dataFormat={this.getCustomerContact.bind(this)}>Phone
                        no</TableHeaderColumn>

                    <TableHeaderColumn width="180" dataField='make'
                    >Make</TableHeaderColumn>

                    <TableHeaderColumn width="100" dataField='regCity'
                    >City</TableHeaderColumn>

                </BootstrapTable>

            </div>);
    }

    initializeExcelData(){
        this.setState({showExcelModal: false, excelUploading: false});
        let excelData = {
            fileId: "",
            totalRecords: 0,
            progress: 0,
            status: "importing"
        };
        this.props.bookingActions.setExcelData(excelData);
        window.location.reload();
    }

    showExcelUploadModal(){
        this.setState({showExcelModal: true})
    }

    async getCustomerExcelStatus(){
        try{
            let {excelData} = this.props.booking;
            console.log("EDD: ", excelData);
            await this.props.bookingActions.getCustomerExcelStatus({fileId: excelData.fileId})

            let {status} = this.props.booking.excelData;
            if(status === "importing"){
                setTimeout( () => {
                    this.getCustomerExcelStatus();
                },5000);
            }
        }
        catch{
            Alerts.error("Something went wrong", "Please try again later.");
            this.initializeExcelData();
        }
    }

    async uploadExcelFile(){
        try{
            const formData = new FormData();
            formData.append(
                "file",
                this.state.uploadedExcelFile,
                this.state.uploadedExcelFile.name
            );
            this.setState({excelUploading: true});
            await this.props.bookingActions.saveCustomerExcel(formData);

            setTimeout(() => {
                this.getCustomerExcelStatus();
            },2000);
        }
        catch{
            this.initializeExcelData();
            Alerts.error("Something went wrong", "Please try again later.");
        }
    }

    uploadFile(e){
        let file = e.target.files[0];
        if (file.name.lastIndexOf('.xlsx') === -1) {
            Alerts.error("Something went wrong", "Only [.xlsx] format is allowed");
            return;
        }
        this.setState({uploadedExcelFile: file});
    }

    getExcelImportModel(){
        let {showExcelModal, excelUploading, uploadedExcelFile} = this.state;
        let {excelData} = this.props.booking;

        return (
            <Modal className="excel-model payment-modal position-relative " size={"sm"} isOpen={showExcelModal} backdrop="static">
                <ModalHeader className="p-0 font-weight-bolder">
                    Export customer data
                </ModalHeader>
                { !excelUploading && <ModalBody className="p-0 mt-3">
                    <FormGroup>
                        <Label for="productFile">Upload file</Label>
                        <Input type="file" name="productFile" onChange={this.uploadFile.bind(this)} placeholder="Upload file" />
                    </FormGroup>
                    <div className="text-right mt-3">
                        <button className="btn btn-primary mr-2"  disabled={!uploadedExcelFile} onClick={this.uploadExcelFile.bind(this)}>Upload</button>
                        <button className="btn btn-primary" onClick={() => this.setState({showExcelModal: false})}>Cancel</button>
                    </div>
                </ModalBody>}
                { excelUploading && <ModalBody className="p-0 mt-3">
                    <h5 className="mb-1">{excelData.status.charAt(0).toUpperCase() + excelData.status.slice(1) + (excelData.status === "importing" ? "..." : "")}</h5>
                    <Progress className="mb-1 progress-bar-effect" value={Number(excelData.progress)/Number(excelData.totalRecords) * 100} color="success"/>
                    <div className=" font-12">{excelData.progress}/{excelData.totalRecords}</div>
                    <button className="btn btn-primary mt-2 float-right" disabled={excelData.status === "importing"} onClick={this.initializeExcelData.bind(this)}>OK</button>
                </ModalBody>}
            </Modal>
        );
    }

    render() {
        let {activeTab, searchText} = this.state;
        let bookingStatusList = bookingStates;
        let userRoleId = Utility.getUserRole();
        // if(userRoleId !== "0") bookingStatusList = bookingStates.filter(x => x.key !== 6);

        return (
            <div className="content-wrapper">
                <header className="content-header d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 className="mb-0 font-weight-bolder ">Customers</h5>
                        <p className="mb-0 text-gray-400">All important information at a glance</p>
                    </div>
                    <div>
                        <button className="btn btn-primary px-3 py-2 mr-3" onClick={this.showExcelUploadModal.bind(this)}>
                            Upload Excel
                        </button>
                        <button className="btn btn-primary px-3 py-2"
                                onClick={() => {
                                    this.props.bookingActions.setInitialState();
                                    this.props.history.push("/customer/new");
                                }
                                }>Add new
                        </button>
                    </div>
                </header>

                <div className="filter-group mb-4">
                    {bookingStatusList.map((item, index) =>{
                        return <button key={index}
                                className={`btn btn-filter ${activeTab === item ? `active  ${this.statusClassNameFormat(item)}` : ""}`}
                                onClick={this.changeFilter.bind(this, item)}>{item}</button>
                    } )}
                </div>


                <div className="table-wrapper position-relative">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="input-group search">
                            <input type="text" className="form-control pr-4" value={searchText}
                                   onChange={this.handleSearchValueChange.bind(this)}
                                   placeholder="Search by Name"/>
                            <div className="input-group-append position-relative">
                                {searchText &&
                                <i class="fa fa-close input-icon" onClick={this.resetSearchText.bind(this)}/>}
                                <button className="btn bg-blue text-white"
                                        onClick={e => this.filterBookingList()}>SEARCH
                                </button>
                            </div>
                        </div>
                    </div>
                    {this.getBookingList()}
                    {this.getExcelImportModel()}
                </div>
            </div>
        );
    }
}

const mapStateToProps = store => ({
    common: store.common,
    booking: store.booking,
});

const mapDispatchToProps = dispatch => ({
    commonActions: bindActionCreators(commonActions, dispatch),
    bookingActions: bindActionCreators(bookingActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Bookings));