import { Subtitle } from '../subtitle/subtitleContainer';
import { Video } from './watchVideoDefinition';

class PopupProps {
    public video!: Video;
    public subtitle!: Subtitle;
}

class PopupAttrs {
    public dictLoading = true;
    public dictDisplay = 'none';
    public dictLeft = 0;
    public dictTop = 0;
    public text = '';
    public textPhonetic = '';
    public textVoiceUrl = '';
    public textTranslate = '';
    public sentence = '';
    public sentenceVoiceUrl = '';
    public videoSentenceVoiceDataUrl = '';
    public sentenceTranslate = '';
    public remark = '';
    public pageIconUrl = '';
    public pageTitle = '';
    public pageUrl = '';
    public imgDataUrl = '';
    public ankiOpen = false;
    public isLoadingAnki = false;
}

interface ContextFromVideo {
    videoSentenceVoiceDataUrl: string;
    imgDataUrl: string;
}

export { PopupProps, PopupAttrs };
export type { ContextFromVideo };
