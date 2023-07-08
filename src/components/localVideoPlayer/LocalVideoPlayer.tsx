import { init } from '../../userConfig/userConfig';
import Video from './video/Video';
import { Subtitle } from './subtitle/Subtitle';
import { TranslatePopup } from './translate/TranslatePopup';

init();

export default function LocalVideoPlayer() {
    return (
        <div>
            <Video></Video>
            <Subtitle></Subtitle>
            <TranslatePopup></TranslatePopup>
        </div>
    );
}
