import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    params: null
};

const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setParam: (state, {payload}) => {
            state.params = payload;
        }
    },
});

export const {setParam} = messagesSlice.actions;
export default messagesSlice.reducer;
