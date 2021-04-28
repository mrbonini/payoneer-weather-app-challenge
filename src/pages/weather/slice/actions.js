import { BASE_SLICE_PATH } from "./constants";
import Axios from 'axios';
import { createSliceBasicActions } from "../../../store/factories";

const API_PATH = 'http://api.openweathermap.org/data/2.5/forecast?q=Munich,de&APPID=75f972b80e26f14fe6c920aa6a85ad57&cnt=40';

const getResource = async (tempScale) => Axios.get(`${API_PATH}&units=${tempScale === 'celcius' ? 'metric' : 'imperial'}`);

const { controlView, controlData } = createSliceBasicActions(BASE_SLICE_PATH)

export { controlView, controlData };

export const getWeatherData = tempScale => async dispatch => {
    try {
        dispatch(controlView({ isLoading: true, selectedCard: null }));

        const { data, status } = await getResource(tempScale);
        if ( status === 200 ) {
            dispatch(controlData({ city: data.city, list: data.list, barCharts: [] }));
            dispatch(controlView({ isLoading: false }));
        };
    } catch (err) {
        dispatch(controlView({
            isLoading: false,
            hasError: true, 
            error: err.message || 'It wasnt possible to load the weather data. Please try again later'
        }))
    }
};