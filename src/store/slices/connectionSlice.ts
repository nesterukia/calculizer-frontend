import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../interfaces/User";

interface IInitialState{
    user: User,
    isConnected: boolean
}

const initialState: IInitialState = {
    user: {
        id: ''
    },
    isConnected: false 
};

const connectionSlice = createSlice({
    name: "connection",
    initialState,
    reducers: {
        toggleConnection: (state) => {
            state.isConnected = !state.isConnected;
        },
        setUserId: (state, action: PayloadAction<string>) => {
            state.user.id = action.payload;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
    }
})

export const { toggleConnection, setUserId, setUser } = connectionSlice.actions;
export default connectionSlice.reducer;