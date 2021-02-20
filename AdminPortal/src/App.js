import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import {RouteProvider} from './modules/RouteProvider';
import {BrowserRouter} from "react-router-dom";
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './assets/css/index.scss';
import UserData from './components/common/userData';


function App() {
    let callUserData = !(window.location.pathname === "/" ||
        window.location.pathname.indexOf('login') >=0 ||
        window.location.pathname.indexOf('logout') >=0
       );

  return (
      <Provider store={store}>
          {callUserData && <UserData /> }
        <BrowserRouter>
          <RouteProvider />
        </BrowserRouter>
      </Provider>
  );
}

export default App;