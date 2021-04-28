import produce from "immer";
import _ from "lodash";

function generalControl(store, payload) {
    return _.mergeWith(store, payload, (objValue, srcValue) => {
        if (_.isArray(objValue)) {
            return srcValue;
        }
    });
}

export function createSliceReducer(
    view = {},
    data = {},
    constantsBasePath = ''
) {
    if (!constantsBasePath) return;

    const initialState = { view, data };

    const constants = {
        CONTROL_VIEW: `${constantsBasePath}/CONTROL_VIEW`,
        CONTROL_DATA: `${constantsBasePath}/CONTROL_DATA`
    }

    return (state = initialState, action) => produce(state, draft => {
        switch(action.type) {
            case constants.CONTROL_VIEW: {
                const { payload } = action;
                generalControl(draft, { view: payload });
                break;
            }
            case constants.CONTROL_DATA: {
                const { payload } = action;
                generalControl(draft, { data: payload });
                break;
            }
        }
    });
}

export function createSliceBasicActions(constantsBasePath = '') {
    if (!constantsBasePath) return;

    const constants = {
        CONTROL_VIEW: `${constantsBasePath}/CONTROL_VIEW`,
        CONTROL_DATA: `${constantsBasePath}/CONTROL_DATA`
    }

    return {
        controlView: (payload) => ({
            type: constants.CONTROL_VIEW,
            payload,
        }),
        controlData: (payload) => ({
            type: constants.CONTROL_DATA,
            payload,
        })
    }
}