import _ from "lodash";
import { BASE_SLICE_PATH } from "./constants";
import { createSliceReducer } from "../../../store/factories";

const defaultView = {
    isLoading: false,
    hasError: false,
    error: undefined,
    page: 0,
    selectedCard: null
};

const defaultData = {
    city: {},
    list: [],
    barCharts: [],
    selectedTemperature: 'fahrenheit',
};

export const initialState = {
    view: defaultView,
    data: defaultData
};

export default createSliceReducer(defaultView, defaultData, BASE_SLICE_PATH);