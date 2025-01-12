import { configureStore } from "@reduxjs/toolkit";
import connectionReducer from "./slices/connectionSlice";
import pointsReducer from "./slices/pointsSlice"
import controlsReducer from "./slices/controlsSlice"


const store = configureStore({
    reducer: {
        connection: connectionReducer,
        points: pointsReducer,
        controls: controlsReducer
    },
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch