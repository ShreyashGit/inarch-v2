import React, {Fragment} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as commonActions from "../../actions/commonActions";
import * as userActions from "../../actions/userActions";
import { get } from '../../modules/APIClient';
import { config } from '../../config';
import { Loader } from '../../components/common/Loaders';
import { Utility } from '../../modules/Utility';
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import qs from 'querystring';
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import Select from "react-select";
import * as productModelActions from "../../actions/productModelActions";
import {BsTrash} from "react-icons/bs";
import Search from "../../components/common/Search";

const empTypes = Utility.getEmpTypes();

class Users extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 2,
            searchText: "",
            resetSearch: false,
            addMake: false
        };
    }

    async componentDidMount() {
        let query = qs.parse(window.location.search);
        let activeTab = query["?tab"] ? parseInt(query["?tab"]) : 2;
        let page = parseInt(query["page"]);
        let searchText = query["text"] ? query["text"] : "";
        await this.setState({activeTab, searchText, resetSearch:!!searchText});
        if(page){
            await this.props.userActions.setCurrentPage(page);
        }
        await this.getAllModels();
        this.getUsersList();
    }

    async getUsersList() {
        let {activeTab, searchText} = this.state;
        let {user} = this.props;
        await this.props.userActions.getUserList({type: activeTab, searchText,currentPage:user.currentPage});
        this.props.commonActions.setLoading(false);
    }

    async changeFilter(activeTab) {
        await this.setState({activeTab,searchText:""});
        this.filterUserist();
    }

    async handleSelectRow(row,cell) {
        await this.props.userActions.setInitialState();
        this.props.history.push("/users/edit/"+row._id);
    }

    formatDate(row,cell){
        return Utility.formatTimestamp(cell.createdAt);
    }
    
    async resetSearchText(){
        await this.setState({searchText:""});
        if(this.state.resetSearch){
            this.filterUserist();
        }
    }

    async filterUserist(page=1){
        let {searchText, activeTab} = this.state;
        window.location.href = `/users?tab=${parseInt(activeTab)}${page > 1 ? "&page="+page : ""}${searchText ? "&text="+ searchText :""}`;
    }

    async handleSearchValueChange(e){
        let {value} = e.target;
        if(Utility.checkSpecialCharacters(value)) return;
        await this.setState({searchText:value});
        if(value === "" && this.state.resetSearch){
            this.setState({resetSearch: false});
        }
    }

    async getAllModels(){
        await this.props.productModelActions.getProductModelList({type: "", searchText: "", currentPage: "", divId: ""});
        this.props.commonActions.setLoading(false);
    }

    async addNewMake(){
        let {makeName} = this.state;
        let data = {
            makeName: makeName,
        };
        await this.props.productModelActions.addProductModel({data: data});
        this.setState({makeName: ""});
        await this.getAllModels();
        this.props.commonActions.setModelUpdateLoading(false);
    }

    deleteMake(item){

    }

    getMakeList() {
        let {model} = this.props;

        let models =  <div className="mt-2 ">

                    <span className="shadow-sm mr-2 mb-2 bg-gray-100 py-2 px-3 font-weight-bolder font-13 border-radius-4 d-inline-flex flex-wrap">
                                        <div className="d-flex">
                                             <span className="mr-2">City not assigned</span>
                                        </div>
                                </span>

        </div>

        if(model.records.length !== 0){
            models = <div className="mt-2">
                {model.records.map((item, index) => {

                    return (
                        <span className="mr-2 mb-2  bg-success text-white py-2 px-3 font-weight-bolder font-13 border-radius-4 d-inline-flex flex-wrap"
                              key={index}>
                                        <div className="d-flex">
                                             <span className="mr-2">{item.makeName}</span>
                                            <span
                                                onClick={this.deleteMake.bind(this, item)}
                                                  className="cursor-pointer text-danger"> <BsTrash/></span>
                                        </div>
                                </span>
                    )
                })}
            </div>
        }
        return ( models)
    }

    getMakeModel(){
        let {addMake, makeName} = this.state;
        let {modelLoading} = this.props.common;
        // let isEditMode = !!selectedScheme.id;

        return (
            <Modal className="payment-modal make-modal position-relative " size={"xl"} isOpen={addMake}
                   backdrop="static">
                <ModalHeader className="p-0 font-weight-bolder">Make</ModalHeader>
                <ModalBody className="p-0" style={{height: 500}}>
                    <Loader isLoading={modelLoading} background="#c5c5c578"/>
                    <div>
                        <div className="form-group  mt-4">
                            <div className="input-group text-right">
                                <input type="text" className="form-control" placeholder="Make name"
                                       value={makeName}
                                       onChange={(e) => {
                                           this.setState({makeName: e.target.value})
                                       }}
                                />
                                <button className="btn btn-primary ml-2 px-4" type="button" style={{zIndex: 0}}
                                        disabled={!makeName || modelLoading}
                                    onClick={this.addNewMake.bind(this)}
                                >+ ADD
                                </button>
                            </div>
                            <div className="border rounded mt-3 p-3" style={{height:"380px"}}>
                                {this.getMakeList()}
                            </div>
                            <div className="mt-3 text-right">
                                <button className="btn btn-primary"
                                        onClick={() =>{
                                            this.setState({addMake:false, makeName: ""})
                                        }}
                                >Close
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        );
    }

    getRecordList() {
        let { recordsTotal, records, currentPage} = this.props.user;

        if (this.props.common.loading) return  <Loader isLoading={true} background="#c5c5c578" />;
        let options = {
            noDataText: <span className="text-muted text-center">You have not added anything yet</span>,
            page: currentPage,
            sizePerPage: 10,
            pageStartIndex: 1,
            hideSizePerPage: true,
            onPageChange: this.filterUserist.bind(this)
        };
        let selectRow = {
            mode: 'radio',
            clickToSelect: true,
            hideSelectColumn: true,
            onSelect: this.handleSelectRow.bind(this)
        };
        return (
            <div className="table-wrapper-users">
            <BootstrapTable
                striped={true}
                tableHeaderClass="mb-0"
                data={records}
                bordered={true}
                options={options}
                remote={true}
                fetchInfo={{ dataTotalSize: recordsTotal }}
                pagination={recordsTotal > 10}
                selectRow={selectRow}
            >
                <TableHeaderColumn width="20%"
                                   dataField='_id'
                                   isKey={true}
                >Document ID</TableHeaderColumn>
                <TableHeaderColumn width="20%"
                                   dataField='fullName'
                >Name</TableHeaderColumn>
                <TableHeaderColumn width="20%"
                                   dataField='phoneNo'
                >Phone No</TableHeaderColumn>
                <TableHeaderColumn width="20%"
                                   dataField='status'
                >Status</TableHeaderColumn>
                <TableHeaderColumn width="20%"
                                   dataField='createdAt'
                    dataFormat={this.formatDate.bind(this)}
                >Created Date & Time</TableHeaderColumn>
            </BootstrapTable>
            </div>);
    }

    render() {
        let { activeTab, searchText } = this.state;
        return (
            <div className="content-wrapper">
                <div className="d-flex justify-content-between align-items-center ">
                    <header>
                        <div>
                            <h5 className="mb-0 font-weight-bolder">Employees</h5>
                            <p className="mb-0 text-gray-400">All important information at a glance</p>
                        </div>

                    </header>
                    <div>
                        <button className="btn btn-primary px-5 py-3 mr-3" onClick={() =>{
                           this.setState({addMake:true})
                        }}>Add make</button>

                        <button className="btn btn-primary px-5 py-3" onClick={() =>{
                            this.props.userActions.setInitialState();
                            this.props.history.push("/users/new");
                        }}>Add employee</button>
                    </div>

                </div>

                <div className="filter-group mb-4">
                    {empTypes.map((item, index) => (<button key={index} className={`btn btn-filter ${activeTab === item.key? "active": ""}`} onClick={this.changeFilter.bind(this, item.key)}>{item.value}</button>))}
                </div>
                <div className="table-wrapper position-relative">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        {/*<h5 className="mb-0 font-weight-bolder">{empTypes.find(x=> x.key === activeTab).value}</h5>*/}
                        <div className="input-group search">
                            <input type="text" className="form-control pr-4" value={searchText} onChange={this.handleSearchValueChange.bind(this)} placeholder="Search by Name" />
                            <div className="input-group-append position-relative">
                                {searchText && <i class="fa fa-close input-icon" onClick={this.resetSearchText.bind(this)}/>}
                                <button className="btn btn-primary" onClick={e => this.filterUserist()}>SEARCH</button>
                            </div>
                        </div>
                    </div>
                    {this.getRecordList()}
                </div>
                {this.state.addMake && this.getMakeModel()}
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

export default connect(mapStateToProps, mapDispatchToProps)(Users);

