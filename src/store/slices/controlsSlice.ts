import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ControlsValue } from "../../interfaces/ControlsValue"


const initialState: ControlsValue = {
    start: 0,
    end: 10,
    step: 1, 
    function: ''
}

const controlsSlice = createSlice({
    name: 'controls',
    initialState,
    reducers: {
        setControls: (state, action: PayloadAction<ControlsValue>) => {
            state.start = action.payload.start;
            state.end = action.payload.end;
            state.step = action.payload.step;
            state.function = action.payload.function;
        },
        resetControls: (state, action: PayloadAction<string>) => {
            state.start = initialState.start;
            state.end = initialState.end;
            state.step = initialState.step;
            state.function = action.payload;
        }
    }
})

export const { setControls, resetControls } = controlsSlice.actions;
export default controlsSlice.reducer;