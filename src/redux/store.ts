import { configureStore } from '@reduxjs/toolkit';
import subtitleReducer from '../components/localVideoPlayer/subtitle/subtitleSlice';
import translatePopupReducer from '../components/localVideoPlayer/translate/translatePopupSlice';
import videoReducer from '../components/localVideoPlayer/video/videoSlice';

export const store = configureStore({
    reducer: { translatePopup: translatePopupReducer, subtitle: subtitleReducer, video: videoReducer }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
