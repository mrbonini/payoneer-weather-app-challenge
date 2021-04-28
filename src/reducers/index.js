import { combineReducers } from 'redux';
import weather from '../pages/weather/slice/reducer';

const reducers = combineReducers({
    weather
});

export default (state, action) => reducers(state,action);