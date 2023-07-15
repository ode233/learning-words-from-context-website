import { initConfig } from '../../config/config';
import Video from './video/Video';
import { Subtitle } from './subtitle/Subtitle';
import { TranslatePopup } from './translate/TranslatePopup';

initConfig();

export default function LocalVideoPlayer() {
    return (
        <div>
            <Video></Video>
            <Subtitle></Subtitle>
            <TranslatePopup></TranslatePopup>
        </div>
    );
}
