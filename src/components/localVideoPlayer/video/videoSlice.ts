import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../redux/store';

// Define a type for the slice state
interface VideoState {
    isPlay: boolean;
}

// Define the initial state using that type
const initialState: VideoState = {
    isPlay: false
};

export const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        updateIsPlay: (state, action: PayloadAction<boolean, string>) => {
            state.isPlay = action.payload;
        }
    }
});

export const { updateIsPlay } = videoSlice.actions;

export const selectSubtitleSelectionData = (state: RootState) => state.translatePopup.subtitleSelectionData;

export const selectIsPlay = (state: RootState) => state.video.isPlay;

const videoReducer = videoSlice.reducer;
export default videoReducer;
