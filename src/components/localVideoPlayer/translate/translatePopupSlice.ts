import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../redux/store';
import { SubtitleSelectionData } from '../subtitle/Subtitle';
import { DictAttr } from './TranslatePopup';

// Define a type for the slice state
interface TranslatePopupState {
    dictAttr?: DictAttr;
    subtitleSelectionData?: SubtitleSelectionData;
}

// Define the initial state using that type
const initialState: TranslatePopupState = {};

export const translatePopupSlice = createSlice({
    name: 'translatePopup',
    initialState,
    reducers: {
        openDictPopup: (state, action: PayloadAction<SubtitleSelectionData, string>) => {
            state.subtitleSelectionData = action.payload;
        },
        openAnkiExportPopup: (state, action: PayloadAction<DictAttr, string>) => {
            state.dictAttr = action.payload;
        }
    }
});

export const { openDictPopup, openAnkiExportPopup } = translatePopupSlice.actions;

export const selectSubtitleSelectionData = (state: RootState) => state.translatePopup.subtitleSelectionData;

export const selectDictAttr = (state: RootState) => state.translatePopup.dictAttr;

const translatePopupReducer = translatePopupSlice.reducer;
export default translatePopupReducer;
