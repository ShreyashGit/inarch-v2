import {createStore, applyMiddleware, compose} from 'redux';
import rootReducer from './modules/combineReducer';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';

const enhancers = [];
const middlewareEnhancer = applyMiddleware(thunk, promise);

if (true) {
    // TODO as pre dev env variable
    const devToolsExtension = window.devToolsExtension;

    if (typeof devToolsExtension === 'function') {
        enhancers.push(devToolsExtension());
    }
}

const composedEnhancers = compose(
    middlewareEnhancer,
    ...enhancers
);

export const store = (
    createStore(
        rootReducer,
        composedEnhancers,
    ));