import { createSelector } from 'reselect';
import reducer from './reducer';

const selectDefault = (state) => state.weather || reducer.initialState;

export const selectWeatherData = createSelector(
    [selectDefault],
    (state) => state.data
);

export const selectWeatherView = createSelector(
    [selectDefault],
    (state) => state.view
);