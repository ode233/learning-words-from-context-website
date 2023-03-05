import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import styled from '@emotion/styled';
import { getText, getSentence } from 'get-selection-more';
import { BsVolumeUpFill } from 'react-icons/bs';
import { BiExport } from 'react-icons/bi';
import { css } from '@emotion/react';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import {
    CircularProgress,
    InputAdornment,
    InputLabel,
    Link,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { dataUrlToBlob, getPhoneticApi } from '../api/translateApi';
import {
    DICT_POPUP_WIDTH,
    DICT_POPUP_HEIGHT,
    YOUDAO_VOICE_URL,
    LEFT_CLICK,
    ANKI_POPUP_HEIGHT,
    ANKI_POPUP_WIDTH
} from '../constants/translateConstants';
import { delay } from '../utils/delayUtils';
import { PopupAttrs, PopupProps } from '../definition/tanslatePopupDefintion';
import { translator } from '../option/option';
import { addNote } from '../api/ankiApi';

const DictPopupWrapper = styled.div``;

const AnkiPopupWrapper = styled.div``;

const Text = styled.h3`
    font-size: large;
    font-weight: normal;
    font-family: sans-serif;
    margin: 18px 0px;
`;

const Popup = ({ video, getContextFromVideo }: PopupProps) => {
    const [popupAttrs, setPopupAttrs] = useState(new PopupAttrs());

    const popupAttrsRef = useRef(popupAttrs);

    useEffect(() => {
        popupAttrsRef.current = popupAttrs;
    });

    useEffect(() => {
        document.addEventListener('mouseup', async (event: MouseEvent) => {
            if (popupAttrsRef.current.dictDisplay === 'block') {
                return;
            }
            if (popupAttrsRef.current.isLoadingAnki) {
                return;
            }
            let text = getText();
            if (!text) {
                return;
            }

            // create new popupAttrs and set value
            let newPopupAttrs = new PopupAttrs();

            let sentence = getSentence();

            let clientWidth = document.documentElement.clientWidth;
            let clientHeight = document.documentElement.clientHeight;
            let offset = 10;

            let dictLeft = event.clientX + offset;
            let dictTop = event.clientY + offset;
            if (dictLeft + DICT_POPUP_WIDTH > clientWidth) {
                let newDictLeft = event.clientX - DICT_POPUP_WIDTH - offset;
                if (newDictLeft >= 0) {
                    dictLeft = newDictLeft;
                }
            }
            if (dictTop + DICT_POPUP_HEIGHT > clientHeight) {
                let newDictTop = event.clientY - DICT_POPUP_HEIGHT - offset;
                if (newDictTop >= 0) {
                    dictTop = newDictTop;
                }
            }

            // display loading page
            newPopupAttrs.dictLoading = true;
            newPopupAttrs.dictDisplay = 'block';
            newPopupAttrs.dictLeft = dictLeft;
            newPopupAttrs.dictTop = dictTop;
            newPopupAttrs.text = text;
            newPopupAttrs.textVoiceUrl = YOUDAO_VOICE_URL + text;
            newPopupAttrs.sentence = sentence;
            newPopupAttrs.sentenceVoiceUrl = YOUDAO_VOICE_URL + sentence;
            newPopupAttrs.pageIconUrl = window.location.origin + '/favicon.ico';
            newPopupAttrs.pageTitle = document.title;
            newPopupAttrs.pageUrl = document.URL;
            setPopupAttrs(newPopupAttrs);

            // fetch value
            newPopupAttrs.textTranslate = translator.translate(newPopupAttrs.text);
            newPopupAttrs.sentenceTranslate = translator.translate(newPopupAttrs.sentence);
            newPopupAttrs.dictLoading = false;
            setPopupAttrs({ ...newPopupAttrs });
        });

        document.addEventListener('mousedown', (event: MouseEvent) => {
            if (
                popupAttrsRef.current.dictDisplay === 'block' &&
                event.button === LEFT_CLICK &&
                (event.clientX < popupAttrsRef.current.dictLeft ||
                    event.clientX > popupAttrsRef.current.dictLeft + DICT_POPUP_WIDTH ||
                    event.clientY < popupAttrsRef.current.dictTop ||
                    event.clientY > popupAttrsRef.current.dictTop + DICT_POPUP_HEIGHT)
            ) {
                window.getSelection()?.removeAllRanges();
                popupAttrsRef.current.dictDisplay = 'none';
                setPopupAttrs({ ...popupAttrsRef.current });
            }
        });
    }, []);

    const onClickOpenAnkiPopup = async () => {
        window.getSelection()?.removeAllRanges();
        popupAttrs.isLoadingAnki = true;
        popupAttrs.dictDisplay = 'none';
        setPopupAttrs({ ...popupAttrs });
        let data = getContextFromVideo();
        if (!data?.imgDataUrl) {
            alert('getContextFromVideo err');
            popupAttrs.isLoadingAnki = false;
            setPopupAttrs({ ...popupAttrs });
            return;
        }
        popupAttrs.videoSentenceVoiceDataUrl = data.videoSentenceVoiceDataUrl;
        popupAttrs.imgDataUrl = data.imgDataUrl;
        popupAttrs.ankiOpen = true;
        setPopupAttrs({ ...popupAttrs });
    };

    const onClickCloseAnki = () => {
        popupAttrs.isLoadingAnki = false;
        popupAttrs.ankiOpen = false;
        setPopupAttrs({ ...popupAttrs });
        setTimeout(() => {
            video.play();
        }, 100);
    };

    const onClickExportAnki = () => {
        addNote(popupAttrs).then((data) => {
            if (data.error) {
                alert(`ankiExport err, ${data.error}`);
                return;
            }
            popupAttrs.isLoadingAnki = false;
            popupAttrs.ankiOpen = false;
            setPopupAttrs({ ...popupAttrs });
            setTimeout(() => {
                video.play();
            }, 100);
        });
    };

    const onTextTranslateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        popupAttrs.textTranslate = event.target.value;
        setPopupAttrs({ ...popupAttrs });
    };

    const onSentenceTranslateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        popupAttrs.sentenceTranslate = event.target.value;
        setPopupAttrs({ ...popupAttrs });
    };

    const onRemarkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        popupAttrs.remark = event.target.value;
        setPopupAttrs({ ...popupAttrs });
    };

    function playAudio(source: string, volume = 1) {
        const audio = new Audio(source);
        audio.volume = volume;
        audio.play();
    }

    return (
        <div
            css={css`
                all: initial;
            `}
        >
            <DictPopupWrapper
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
                    display: ${popupAttrs.dictDisplay};
                    left: ${popupAttrs.dictLeft + 'px'};
                    top: ${popupAttrs.dictTop + 'px'};
                `}
            >
                {popupAttrs.dictLoading && (
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
                {!popupAttrs.dictLoading && (
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
                                {popupAttrs.text}&nbsp;&nbsp;&nbsp;&nbsp;
                                {popupAttrs.textPhonetic && (
                                    <span>{popupAttrs.textPhonetic}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                )}
                                <BsVolumeUpFill
                                    style={{ fontSize: 'larger', verticalAlign: 'bottom' }}
                                    onClick={() => {
                                        playAudio(popupAttrs.textVoiceUrl);
                                    }}
                                />
                            </Text>
                            <Text>{popupAttrs.textTranslate}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text>
                                {popupAttrs.sentence}&nbsp;&nbsp;&nbsp;&nbsp;
                                <BsVolumeUpFill
                                    style={{ fontSize: 'larger', verticalAlign: 'text-bottom' }}
                                    onClick={() => {
                                        playAudio(popupAttrs.sentenceVoiceUrl);
                                    }}
                                />
                            </Text>
                            <Text style={{ marginBottom: '0px' }}>{popupAttrs.sentenceTranslate}</Text>
                        </div>
                    </div>
                )}
            </DictPopupWrapper>
            <AnkiPopupWrapper>
                <Dialog
                    open={popupAttrs.ankiOpen}
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
                    >
                        <TextField
                            fullWidth
                            label="单词"
                            value={popupAttrs.text + '    ' + popupAttrs.textPhonetic}
                            variant="standard"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="start">
                                        <BsVolumeUpFill
                                            onClick={() => {
                                                playAudio(popupAttrs.textVoiceUrl);
                                            }}
                                        />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            fullWidth
                            label="翻译"
                            value={popupAttrs.textTranslate}
                            onChange={onTextTranslateChange}
                            variant="standard"
                        />
                        <TextField
                            fullWidth
                            label="上下文"
                            multiline
                            maxRows={3}
                            value={popupAttrs.sentence}
                            variant="standard"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="start">
                                        <BsVolumeUpFill
                                            onClick={async () => {
                                                let url;
                                                if (popupAttrs.videoSentenceVoiceDataUrl) {
                                                    let blob = await dataUrlToBlob(
                                                        popupAttrs.videoSentenceVoiceDataUrl
                                                    );
                                                    url = window.URL.createObjectURL(blob);
                                                } else {
                                                    url = popupAttrs.sentenceVoiceUrl;
                                                }
                                                if (!url) {
                                                    return;
                                                }
                                                playAudio(url);
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
                            value={popupAttrs.sentenceTranslate}
                            onChange={onSentenceTranslateChange}
                            variant="standard"
                        />
                        <TextField
                            fullWidth
                            label="备注"
                            value={popupAttrs.remark}
                            onChange={onRemarkChange}
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
                                    <img src={popupAttrs.pageIconUrl}></img>
                                </ListItemIcon>
                                <ListItemText
                                    css={css`
                                        margin-bottom: 0;
                                    `}
                                    primary={
                                        <Link href={popupAttrs.pageUrl} underline="none">
                                            {popupAttrs.pageTitle}
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
                                    src={popupAttrs.imgDataUrl}
                                    css={css`
                                        width: inherit;
                                    `}
                                ></img>
                            </ListItem>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClickCloseAnki}>关闭</Button>
                        <Button onClick={onClickExportAnki}>导出至Anki</Button>
                    </DialogActions>
                </Dialog>
            </AnkiPopupWrapper>
        </div>
    );
};

export { Popup };