import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Point } from "../../interfaces/Point";

interface IInitialState{
    points: Point[]
}

const initialState: IInitialState = {
    points: []
};

const pointsSlice = createSlice({
    name: "points",
    initialState,
    reducers: {
        clearPoints: (state) => {
            state.points = [];
        },
        addPoint: (state, action: PayloadAction<Point>) => {
            console.log('[GOT  <========]', action.payload);
            state.points.push(action.payload);
            state.points.sort((a, b) => a.xCoordinate - b.xCoordinate);
        }

    }
})

export const { clearPoints, addPoint } = pointsSlice.actions;
export default pointsSlice.reducer;