/** @jsxImportSource @emotion/react */

import { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import { translator } from '../../../config/config';
import { openAnkiExportPopup, selectDictAttr, selectSubtitleSelectionData } from './translatePopupSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { addNote } from '../../../api/ankiApi';
import { css } from '@emotion/react';
import {
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    InputAdornment,
    InputLabel,
    Link,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField
} from '@mui/material';
import { BiExport } from 'react-icons/bi';
import { BsVolumeUpFill } from 'react-icons/bs';
import styled from '@emotion/styled';
import { SubtitleSelectionData } from '../subtitle/Subtitle';
import { videoController } from '../video/Video';
import { selectIsPlay } from '../video/videoSlice';

const LEFT_CLICK = 0;
const DICT_POPUP_WIDTH = 420;
const DICT_POPUP_HEIGHT = 320;
const ANKI_POPUP_WIDTH = 600;
const ANKI_POPUP_HEIGHT = 800;
const YOUDAO_VOICE_URL = 'https://dict.youdao.com/dictvoice?type=0&audio=';

const DICT_POPUP_ID = 'dictPopup';
const ANKI_EXPORT_POPUP_ID = 'ankiExportPopup';

export function TranslatePopup() {
    return (
        <div>
            <DictPopup></DictPopup>
            <AnkiExportPopup></AnkiExportPopup>
        </div>
    );
}

const Text = styled.h3`
    font-size: large;
    font-weight: normal;
    font-family: sans-serif;
    margin: 18px 0px;
`;

export interface DictAttr {
    text: string;
    textVoiceUrl: string;
    textTranslate: string;
    sentence: string;
    sentenceVoiceUrl: string;
    sentenceTranslate: string;
    contentVoiceDataUrl: string;
    contentImgDataUrl: string;
}

export let dictPopupVisible = false;

function DictPopup() {
    const dictLeftRef = useRef<number>(0);
    const dictTopRef = useRef<number>(0);
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const subtitleSelectionData = useAppSelector(selectSubtitleSelectionData);
    const isPlay = useAppSelector(selectIsPlay);

    const dispatch = useAppDispatch();

    const dictAttrRef = useRef<DictAttr>({
        text: '',
        textVoiceUrl: '',
        textTranslate: '',
        sentence: '',
        sentenceVoiceUrl: '',
        sentenceTranslate: '',
        contentVoiceDataUrl: '',
        contentImgDataUrl: ''
    });

    useEffect(() => {
        if (!subtitleSelectionData) {
            return;
        }
        videoController.pause();
        dictLeftRef.current = computeDictLeft(subtitleSelectionData.clickX);
        dictTopRef.current = computeDictTop(subtitleSelectionData.clickY);
        setVisible(true);
        setIsLoading(true);
        createDictAttr(subtitleSelectionData).then((dictAttr) => {
            dictAttrRef.current = dictAttr;
            setIsLoading(false);
        });
    }, [subtitleSelectionData]);

    useEffect(() => {
        if (isPlay) {
            document.getSelection()?.empty();
            setVisible(false);
        }
    }, [isPlay]);

    useEffect(() => {
        dictPopupVisible = visible;
    }, [visible]);

    useEffect(() => {
        document.addEventListener('mousedown', (event: MouseEvent) => {
            setVisible((v) => {
                if (
                    v &&
                    event.button === LEFT_CLICK &&
                    (event.clientX < dictLeftRef.current ||
                        event.clientX > dictLeftRef.current + DICT_POPUP_WIDTH ||
                        event.clientY < dictTopRef.current ||
                        event.clientY > dictTopRef.current + DICT_POPUP_HEIGHT)
                ) {
                    window.getSelection()?.removeAllRanges();
                    return false;
                }
                return v;
            });
        });

        document.addEventListener('keydown', (event: KeyboardEvent) => {
            let key = event.key;
            if (key === 'Enter') {
                setVisible((v) => {
                    if (v) {
                        onClickOpenAnkiPopup();
                    }
                    return v;
                });
            }
        });
    }, []);

    const onClickOpenAnkiPopup = async () => {
        setVisible(false);
        let contextFromVideo = await videoController.getContextFromVideo();
        if (!contextFromVideo.voiceDataUrl) {
            alert('Get context from video error');
            setIsLoading(false);
            return;
        }
        dictAttrRef.current.contentVoiceDataUrl = contextFromVideo.voiceDataUrl;
        dictAttrRef.current.contentImgDataUrl = contextFromVideo.imgDataUrl;
        dispatch(openAnkiExportPopup({ ...dictAttrRef.current }));
    };

    return (
        <div
            id={DICT_POPUP_ID}
            css={css`
                box-sizing: border-box;
                overflow: auto;
                position: fixed;
                background-color: #fefefe;
                margin: auto;
                padding: 20px;
                border: 1px solid rgba(0, 0, 0, 0.12);
                width: ${DICT_POPUP_WIDTH + 'px'};
                height: ${DICT_POPUP_HEIGHT + 'px'};
                z-index: 10001;
                left: ${dictLeftRef.current + 'px'};
                top: ${dictTopRef.current + 'px'};
                visibility: ${visible ? 'visible' : 'hidden'};
            `}
        >
            {isLoading && (
                <CircularProgress
                    css={css`
                        position: absolute;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        margin: auto;
                    `}
                />
            )}
            {!isLoading && (
                <div>
                    <BiExport
                        css={css`
                            top: 20px;
                            right: 20px;
                            position: absolute;
                            font-size: larger;
                            vertical-align: bottom;
                        `}
                        onClick={onClickOpenAnkiPopup}
                    />
                    <div>
                        <Text style={{ marginTop: '0px' }}>
                            {dictAttrRef.current.text}&nbsp;&nbsp;&nbsp;&nbsp;
                            <BsVolumeUpFill
                                style={{ fontSize: 'larger', verticalAlign: 'bottom' }}
                                onClick={() => {
                                    playAudio(dictAttrRef.current.textVoiceUrl);
                                }}
                            />
                        </Text>
                        <Text>{dictAttrRef.current.textTranslate}</Text>
                    </div>
                    <Divider />
                    <div>
                        <Text>
                            {dictAttrRef.current.sentence}&nbsp;&nbsp;&nbsp;&nbsp;
                            <BsVolumeUpFill
                                style={{ fontSize: 'larger', verticalAlign: 'text-bottom' }}
                                onClick={() => {
                                    playAudio(dictAttrRef.current.sentenceVoiceUrl);
                                }}
                            />
                        </Text>
                        <Text style={{ marginBottom: '0px' }}>{dictAttrRef.current.sentenceTranslate}</Text>
                    </div>
                </div>
            )}
        </div>
    );
}

export interface AnkiExportAttr {
    text: string;
    textVoiceUrl: string;
    textTranslate: string;
    sentence: string;
    sentenceVoiceUrl: string;
    sentenceTranslate: string;
    contentVoiceDataUrl: string;
    contentImgDataUrl: string;
    remark: string;
    pageIconUrl: string;
    pageTitle: string;
    pageUrl: string;
}

export let ankiExportPopupVisible = false;

function AnkiExportPopup() {
    const [visible, setVisible] = useState(false);
    const [ankiExportAttr, setAnkiExportAttr] = useState<AnkiExportAttr>({
        text: '',
        textVoiceUrl: '',
        textTranslate: '',
        sentence: '',
        sentenceVoiceUrl: '',
        sentenceTranslate: '',
        contentVoiceDataUrl: '',
        contentImgDataUrl: '',
        remark: '',
        pageIconUrl: '',
        pageTitle: '',
        pageUrl: ''
    });

    const ankiExportAttrRef = useRef(ankiExportAttr);

    const dictAttr = useAppSelector(selectDictAttr);

    useEffect(() => {
        if (!dictAttr) {
            return;
        }
        setAnkiExportAttr(createAnkiExportAttr(dictAttr));
        setVisible(true);
    }, [dictAttr]);

    useEffect(() => {
        ankiExportAttrRef.current = ankiExportAttr;
    }, [ankiExportAttr]);

    useEffect(() => {
        ankiExportPopupVisible = visible;
    }, [visible]);

    useEffect(() => {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            let key = event.key;
            if (key === 'Enter') {
                setVisible((v) => {
                    if (v) {
                        exportToAnki();
                    }
                    return v;
                });
            }
        });
    }, []);

    function closeAnkiExportPopup() {
        setVisible(false);
        videoController.play();
    }

    function exportToAnki() {
        if (!ankiExportAttrRef.current.text) {
            alert('exportToAnki err, empty text');
            return;
        }
        addNote(ankiExportAttrRef.current!).then((data) => {
            if (data.error) {
                alert(`ankiExport err, ${data.error}`);
                return;
            }
            closeAnkiExportPopup();
        });
    }

    return (
        <Dialog
            id={ANKI_EXPORT_POPUP_ID}
            open={visible}
            maxWidth={false}
            css={css`
                bottom: 200px;
            `}
        >
            <DialogContent
                css={css`
                    overflow: auto;
                    width: ${ANKI_POPUP_WIDTH + 'px'};
                    height: ${ANKI_POPUP_HEIGHT + 'px'};
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                `}
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
            >
                <TextField
                    fullWidth
                    label="单词"
                    value={ankiExportAttr.text}
                    variant="standard"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="start">
                                <BsVolumeUpFill
                                    onClick={() => {
                                        playAudio(ankiExportAttr.textVoiceUrl);
                                    }}
                                />
                            </InputAdornment>
                        )
                    }}
                />
                <TextField
                    fullWidth
                    label="翻译"
                    value={ankiExportAttr.textTranslate}
                    onChange={(event) => {
                        ankiExportAttr.textTranslate = event.target.value;
                        setAnkiExportAttr({ ...ankiExportAttr });
                    }}
                    variant="standard"
                />
                <TextField
                    fullWidth
                    label="上下文"
                    multiline
                    maxRows={3}
                    value={ankiExportAttr.sentence}
                    variant="standard"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="start">
                                <BsVolumeUpFill
                                    onClick={async () => {
                                        playAudio(ankiExportAttr.contentVoiceDataUrl);
                                    }}
                                />
                            </InputAdornment>
                        )
                    }}
                />
                <TextField
                    fullWidth
                    label="翻译"
                    multiline
                    maxRows={3}
                    value={ankiExportAttr.sentenceTranslate}
                    onChange={(event) => {
                        ankiExportAttr.sentenceTranslate = event.target.value;
                        setAnkiExportAttr({ ...ankiExportAttr });
                    }}
                    variant="standard"
                />
                <TextField
                    fullWidth
                    label="备注"
                    value={ankiExportAttr.remark}
                    onChange={(event) => {
                        ankiExportAttr.remark = event.target.value;
                        setAnkiExportAttr({ ...ankiExportAttr });
                    }}
                    variant="standard"
                    InputLabelProps={{
                        shrink: true
                    }}
                />
                <div>
                    <InputLabel shrink={true}>来源</InputLabel>
                    <ListItem
                        css={css`
                            align-items: end;
                        `}
                        disablePadding
                    >
                        <ListItemIcon
                            css={css`
                                height: 20px;
                                min-width: 0;
                                margin-right: 10px;
                                align-self: center;
                            `}
                        >
                            <img src={ankiExportAttr.pageIconUrl}></img>
                        </ListItemIcon>
                        <ListItemText
                            css={css`
                                margin-bottom: 0;
                            `}
                            primary={
                                <Link href={ankiExportAttr.pageUrl} underline="none">
                                    {ankiExportAttr.pageTitle}
                                </Link>
                            }
                        ></ListItemText>
                    </ListItem>
                    <hr></hr>
                </div>
                <div>
                    <InputLabel shrink={true}>图片</InputLabel>
                    <ListItem disablePadding>
                        <img
                            src={ankiExportAttr.contentImgDataUrl}
                            css={css`
                                width: inherit;
                            `}
                        ></img>
                    </ListItem>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeAnkiExportPopup}>关闭</Button>
                <Button onClick={exportToAnki}>导出至Anki</Button>
            </DialogActions>
        </Dialog>
    );
}

async function createDictAttr(subtitleSelectionData: SubtitleSelectionData): Promise<DictAttr> {
    return {
        text: subtitleSelectionData.text,
        textVoiceUrl: YOUDAO_VOICE_URL + subtitleSelectionData.text,
        textTranslate: await translator.translate(subtitleSelectionData.text),
        sentence: subtitleSelectionData.sentence,
        sentenceVoiceUrl: YOUDAO_VOICE_URL + subtitleSelectionData.sentence,
        sentenceTranslate: await translator.translate(subtitleSelectionData.sentence),
        contentVoiceDataUrl: '',
        contentImgDataUrl: ''
    };
}

function computeDictLeft(clickX: number): number {
    let clientWidth = document.documentElement.clientWidth;
    let offset = 10;

    let dictLeft = clickX + offset;
    if (dictLeft + DICT_POPUP_WIDTH > clientWidth) {
        let newDictLeft = clickX - DICT_POPUP_WIDTH - offset;
        if (newDictLeft >= 0) {
            dictLeft = newDictLeft;
        }
    }
    return dictLeft;
}

function computeDictTop(clickY: number): number {
    let clientHeight = document.documentElement.clientHeight;
    let offset = 10;
    let dictTop = clickY + offset;
    if (dictTop + DICT_POPUP_HEIGHT > clientHeight) {
        let newDictTop = clickY - DICT_POPUP_HEIGHT - offset;
        if (newDictTop >= 0) {
            dictTop = newDictTop;
        }
    }
    return dictTop;
}

function playAudio(source: string, volume = 1) {
    const audio = new Audio(source);
    audio.volume = volume;
    audio.play();
}

function createAnkiExportAttr(dictAttr: DictAttr): AnkiExportAttr {
    return {
        text: dictAttr.text,
        textVoiceUrl: dictAttr.textVoiceUrl,
        textTranslate: dictAttr.textTranslate,
        sentence: dictAttr.sentence,
        sentenceVoiceUrl: dictAttr.sentenceVoiceUrl,
        sentenceTranslate: dictAttr.sentenceTranslate,
        contentVoiceDataUrl: dictAttr.contentVoiceDataUrl,
        contentImgDataUrl: dictAttr.contentImgDataUrl,
        remark: '',
        pageIconUrl:
            'https://raw.githubusercontent.com/ode233/learning-words-from-context/main/src/assets/icons/icon.png',
        pageTitle: document.title,
        pageUrl: '#'
    };
}
