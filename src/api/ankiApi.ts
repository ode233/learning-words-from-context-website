import { PopupAttrs, PopupProps } from '../definition/tanslatePopupDefintion';
import {
    ANKI_CARD_BACK_HTML,
    ANKI_CARD_CSS,
    ANKI_CARD_FRONT_HTML,
    ANKI_DECK_NAME,
    ANKI_MODEL_NAME
} from '../constants/ankiConstants';

const ankiBaseUrl = 'http://127.0.0.1:8765';

export const requestPermission = async () => {
    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'requestPermission', version: 6 })
    });
    return response.json();
};

export const getDeckNames = async () => {
    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'deckNames',
            version: 6
        })
    });
    return response.json();
};

export const createDeck = async () => {
    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'createDeck',
            version: 6,
            params: {
                deck: ANKI_DECK_NAME
            }
        })
    });
    return response.json();
};

export const getModelNames = async () => {
    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'modelNames',
            version: 6
        })
    });
    return response.json();
};

export const createModel = async () => {
    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'createModel',
            version: 6,
            params: {
                modelName: ANKI_MODEL_NAME,
                inOrderFields: [
                    'Timestamp',
                    'Text',
                    'TextPhonetic',
                    'TextVoice',
                    'TextTranslate',
                    'Sentence',
                    'SentenceVoice',
                    'SentenceTranslate',
                    'Remark',
                    'PageIcon',
                    'PageTitle',
                    'PageUrl',
                    'Img',
                    'SentenceCloze'
                ],
                isCloze: true,
                css: ANKI_CARD_CSS,
                cardTemplates: [
                    {
                        Name: 'Card',
                        Front: ANKI_CARD_FRONT_HTML,
                        Back: ANKI_CARD_BACK_HTML
                    }
                ]
            }
        })
    });
    return response.json();
};

export const retrieveMediaFile = async (filename: string) => {
    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'retrieveMediaFile',
            version: 6,
            params: { filename: filename }
        })
    });
    return response.json();
};

export const addNote = async (popupAttrs: PopupAttrs) => {
    let timestamp = Date.now().toString();
    let sentenceCloze = popupAttrs.sentence.replaceAll(popupAttrs.text, `{{c1::${popupAttrs.text}}}`);
    let textVoice = {
        url: popupAttrs.textVoiceUrl,
        filename: `${timestamp}_textVoice.mp3`,
        fields: ['TextVoice']
    };
    let sentenceVoice;
    if (popupAttrs.videoSentenceVoiceDataUrl) {
        let voiceData = popupAttrs.videoSentenceVoiceDataUrl.split(',')[1];
        sentenceVoice = {
            data: voiceData,
            filename: `${timestamp}_sentenceVoice.mp3`,
            fields: ['SentenceVoice']
        };
    } else {
        sentenceVoice = {
            url: popupAttrs.sentenceVoiceUrl,
            filename: `${timestamp}_sentenceVoice.mp3`,
            fields: ['SentenceVoice']
        };
    }

    let img;
    let imgDataUrl = popupAttrs.imgDataUrl;
    if (imgDataUrl) {
        let imgData = imgDataUrl.split(',')[1];
        img = {
            data: imgData,
            filename: `${timestamp}_img.jpeg`,
            fields: ['Img']
        };
    }

    let pageIcon;
    let pageIconUrl = popupAttrs.pageIconUrl;
    let pageIconName = getPageIconName(pageIconUrl);
    let isExist = (await retrieveMediaFile(pageIconName)).result;
    if (!isExist) {
        if (pageIconName === 'localVideoPlayer.ico') {
            pageIconUrl =
                'https://raw.githubusercontent.com/ode233/learning-words-from-context/main/src/assets/icons/icon.png';
        }
        pageIcon = {
            url: pageIconUrl,
            filename: pageIconName,
            fields: ['PageIcon']
        };
    }

    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'addNote',
            version: 6,
            params: {
                note: {
                    deckName: ANKI_DECK_NAME,
                    modelName: ANKI_MODEL_NAME,
                    fields: {
                        Text: popupAttrs.text,
                        TextPhonetic: popupAttrs.textPhonetic,
                        TextTranslate: popupAttrs.textTranslate,
                        Sentence: popupAttrs.sentence,
                        SentenceTranslate: popupAttrs.sentenceTranslate,
                        Remark: popupAttrs.remark,
                        PageIcon: pageIcon ? '' : `<img src="${pageIconName}">`,
                        PageTitle: popupAttrs.pageTitle,
                        PageUrl: popupAttrs.pageUrl,
                        SentenceCloze: sentenceCloze,
                        Timestamp: timestamp
                    },
                    audio: [textVoice, sentenceVoice],
                    picture: [img, pageIcon],
                    options: {
                        allowDuplicate: false,
                        duplicateScope: 'deck'
                    }
                }
            }
        })
    });
    return response.json();
};

function getPageIconName(pageIconUrl: string): string {
    let pageIconName;
    if (pageIconUrl.includes('chrome-extension://')) {
        pageIconName = 'localVideoPlayer.ico';
    } else {
        pageIconName = pageIconUrl.replaceAll('/favicon.ico', '');
        pageIconName = pageIconName.replaceAll('https://', '');
        pageIconName = pageIconName.replaceAll('http://', '');
        pageIconName = pageIconName.replaceAll('.', '-');
        pageIconName = pageIconName + '.ico';
    }
    return pageIconName;
}
