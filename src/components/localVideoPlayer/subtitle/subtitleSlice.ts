import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../redux/store';

// Define a type for the slice state
interface SubtitleState {
    subtitleText: string;
}

// Define the initial state using that type
const PLEASE_ADD_SUBTITLE = '';
const initialState: SubtitleState = {
    subtitleText: PLEASE_ADD_SUBTITLE
};

export const subtitleSlice = createSlice({
    name: 'subtitle',
    initialState,
    reducers: {
        updateSubtitleText: (state, action: PayloadAction<string, string>) => {
            state.subtitleText = action.payload;
        }
    }
});

export const { updateSubtitleText } = subtitleSlice.actions;

export const selectSubtitleText = (state: RootState) => state.subtitle.subtitleText;

const subtitleReducer = subtitleSlice.reducer;
export default subtitleReducer;
