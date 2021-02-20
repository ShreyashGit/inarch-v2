import React, {Component} from 'react';
import Autocomplete from 'react-google-autocomplete';
import {bindActionCreators} from "redux";
import * as commonActions from "../../actions/commonActions";
import {connect} from "react-redux";

class Search extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    // Component should only update ( re-render ), when the user selects the address
    shouldComponentUpdate(nextProps, nextState) {
        let {city, area, state, address} = this.props.common.address;
        if (
           address !== nextState.address ||
            city !== nextState.city ||
           area !== nextState.area ||
            state !== nextState.state
        ) {
            return true
        } else {
            return false
        }
    }

    getCity = (addressArray) => {
        let city = '';
        for (let i = 0; i < addressArray.length; i++) {
            if (addressArray[i].types[0] && 'administrative_area_level_2' === addressArray[i].types[0]) {
                city = addressArray[i].long_name;
                return city;
            }
        }
    };

    getArea = (addressArray) => {
        let area = '';
        for (let i = 0; i < addressArray.length; i++) {
            if (addressArray[i].types[0]) {
                for (let j = 0; j < addressArray[i].types.length; j++) {
                    if ('sublocality_level_1' === addressArray[i].types[j] || 'locality' === addressArray[i].types[j]) {
                        area = addressArray[i].long_name;
                        return area;
                    }
                }
            }
        }
    };

    getState = (addressArray) => {
        let state = '';
        for (let i = 0; i < addressArray.length; i++) {
            for (let i = 0; i < addressArray.length; i++) {
                if (addressArray[i].types[0] && 'administrative_area_level_1' === addressArray[i].types[0]) {
                    state = addressArray[i].long_name;
                    return state;
                }
            }
        }
    };

    onChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    };

    onPlaceSelected = (place) => {
        const address = place.formatted_address,
            addressArray = place.address_components;
        if (!addressArray) return;
        let city = this.getCity(addressArray),
            area = this.getArea(addressArray),
            state = this.getState(addressArray)
        let addrs={
            address: (address) ? address : '',
            area: (area) ? area : '',
            city: (city) ? city : '',
            state: (state) ? state : '',
        }
        !this.props.hideForm && this.props.commonActions.setAddress(addrs);
        this.props.onAddressSelect(this.props.hideForm ? addrs : "");

    };

    onChangeAdd2(e){
        let {address} = this.props.common;
        address.address2 = e.target.value
        this.props.commonActions.setAddress(address);
        this.props.onAddressSelect();
    }

    render() {
        let map;
        let {city, area, state, address, address2} = this.props.common.address;

            map = <div>
                <div>
                    <div className="form-group">
                        <label htmlFor="">City</label>
                        <input type="text" name="city" className="form-control" onChange={this.onChange}
                               readOnly="readOnly" value={city}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="">Area</label>
                        <input type="text" name="area" className="form-control" onChange={this.onChange}
                               readOnly="readOnly" value={area}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="">State</label>
                        <input type="text" name="state" className="form-control" onChange={this.onChange}
                               readOnly="readOnly" value={state}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="">Address line 1</label>
                        <input type="text" name="address" className="form-control" onChange={this.onChange}
                               readOnly="readOnly" value={address}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="">Address line 2</label>
                        <input type="text" name="address" className="form-control" onChange={this.onChangeAdd2.bind(this)}
                               value={address2}/>
                    </div>

                </div>

            </div>

        return (<div>
            <Autocomplete
                className=" form-control"
                style={{
                    width: '100%',
                    height: '40px',
                    paddingLeft: '16px',
                    marginTop: '2px',
                    marginBottom: '8px',
                }}
                onPlaceSelected={this.onPlaceSelected}
                types={['(regions)']}
            />
            {!this.props.hideForm && map}
        </div>)
    }
}
const mapStateToProps = store => ({
    common: store.common,
});

const mapDispatchToProps = dispatch => ({
    commonActions: bindActionCreators(commonActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);
