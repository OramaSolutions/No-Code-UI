import { createSlice } from "@reduxjs/toolkit";

const stepsSlice = createSlice({
    name: "steps",
    initialState: {
        hasChangedSteps: {}, // Tracks which steps have changes
    },
    reducers: {
        markStepChanged: (state, action) => {
            const { step } = action.payload;
            state.hasChangedSteps[step] = true; // Mark this step as changed
        },
        clearStepChange: (state, action) => {
            const { step } = action.payload;
            state.hasChangedSteps[step] = false; // Clear changes for this step
        },
        resetAllChanges: (state) => {
            state.hasChangedSteps = {}; // Reset all changes
        },
    },
});

export const { markStepChanged, clearStepChange, resetAllChanges } =
    stepsSlice.actions;

export default stepsSlice.reducer;
