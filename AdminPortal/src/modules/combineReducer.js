import { combineReducers } from 'redux';
import { commonReducer } from '../reducers/commonReducers';
import { bookingReducer } from '../reducers/bookingReducer';
import { userReducer } from '../reducers/userReducer';
import { authReducer } from '../reducers/authReducer';
import { productModelReducer } from '../reducers/productModelReducers';
import { excelProductReducer } from '../reducers/excelProductReducer';

export default combineReducers({
    auth: authReducer,
    common: commonReducer,
    booking: bookingReducer,
    user: userReducer,
    model: productModelReducer,
    excelProduct: excelProductReducer,
});