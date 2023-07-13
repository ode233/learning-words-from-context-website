import { AnkiExportAttr } from '../components/localVideoPlayer/translate/TranslatePopup';

const ankiBaseUrl = 'http://127.0.0.1:8765';

export const ANKI_DECK_NAME = 'Learning words from context';
export const ANKI_MODEL_NAME = 'Learning words from context';

const ANKI_CARD_FRONT_HTML = `
<section>{{cloze:SentenceCloze}}<section>

{{#Remark}}
    <section>{{Remark}}<section>
{{/Remark}}

<section>
{{Img}}
<div class="source">
{{PageIcon}}
<a href="{{PageUrl}}">{{PageTitle}}</a>
</div>
<section>

<section>
<div>{{TextTranslate}} {{TextVoice}} {{TextPhonetic}}</div>
<div>{{SentenceTranslate}} {{SentenceVoice}}</div>
<div>{{type:cloze:SentenceCloze}}</div>
</section>
`;

export const ANKI_CARD_BACK_HTML = `
<section>{{cloze:SentenceCloze}}<section>

<section>{{type:cloze:SentenceCloze}}</section>

{{#Remark}}
    <section>{{Remark}}<section>
{{/Remark}}

<section>
{{Img}}
<div class="source">
{{PageIcon}}
<a href="{{PageUrl}}">{{PageTitle}}</a>
</div>
<section>

<section>
<div>{{TextTranslate}} {{TextVoice}} {{TextPhonetic}}</div>
<div>{{SentenceTranslate}} {{SentenceVoice}}</div>
</section>
`;

// eslint-disable-next-line spellcheck/spell-checker
export const ANKI_CARD_CSS = `
.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: #333;
  background-color: white;
}

input {
  border: 1px solid #eee;
}

section {
  margin: 1em 0;
}

.cloze {
  font-weight: bold;
  color: #f9690e;
}

.source {
  margin: 0.5em 0;
  position: relative;
  font-size: .8em;
}

.source img {
  width: inherit;
  height: .8em;
}

.source a {
  color: #5caf9e;
  text-decoration: none;
  word-wrap: break-word;
}

.typeGood {
  color: #fff;
  background: #1EBC61;
}

.typeBad {
  color: #fff;
  background: #F75C4C;
}

.typeMissed {
  color: #fff;
  background: #7C8A99;
}
`;

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

export const addNote = async (ankiExportAttr: AnkiExportAttr) => {
    let timestamp = Date.now().toString();
    let sentenceCloze = ankiExportAttr.sentence.replaceAll(ankiExportAttr.text, `{{c1::${ankiExportAttr.text}}}`);
    let textVoice = {
        url: ankiExportAttr.textVoiceUrl,
        filename: `${timestamp}_textVoice.mp3`,
        fields: ['TextVoice']
    };
    let voiceData = ankiExportAttr.contentVoiceDataUrl.split(',')[1];
    let sentenceVoice = {
        data: voiceData,
        filename: `${timestamp}_sentenceVoice.mp3`,
        fields: ['SentenceVoice']
    };

    let img;
    let imgDataUrl = ankiExportAttr.contentImgDataUrl;
    if (imgDataUrl) {
        let imgData = imgDataUrl.split(',')[1];
        img = {
            data: imgData,
            filename: `${timestamp}_img.jpeg`,
            fields: ['Img']
        };
    }

    let pageIcon;
    let pageIconName = 'localVideoPlayer.ico';
    let isExist = (await retrieveMediaFile(pageIconName)).result;
    if (!isExist) {
        pageIcon = {
            url: 'https://raw.githubusercontent.com/ode233/learning-words-from-context/main/src/assets/icons/icon.png',
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
                        Text: ankiExportAttr.text,
                        TextTranslate: ankiExportAttr.textTranslate,
                        Sentence: ankiExportAttr.sentence,
                        SentenceTranslate: ankiExportAttr.sentenceTranslate,
                        Remark: ankiExportAttr.remark,
                        PageIcon: pageIcon ? '' : `<img src="${pageIconName}">`,
                        PageTitle: ankiExportAttr.pageTitle,
                        PageUrl: ankiExportAttr.pageUrl,
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
