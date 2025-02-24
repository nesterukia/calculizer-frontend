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
        addPoints: (state, action: PayloadAction<Point[]>) => {
            console.log('[GOT  <========]', action.payload);
            state.points = state.points.concat(action.payload);
            state.points.sort((a, b) => a.xCoordinate - b.xCoordinate);
            
            const seenX = new Set();
            state.points = state.points.filter(point => {
            if (seenX.has(point.xCoordinate)) {
                return false; // Skip this point if x is already seen
            } else {
                seenX.add(point.xCoordinate); // Mark this x as seen
                return true; // Keep this point
            }
            });
        }
    }
})

export const { clearPoints, addPoints } = pointsSlice.actions;
export default pointsSlice.reducer;