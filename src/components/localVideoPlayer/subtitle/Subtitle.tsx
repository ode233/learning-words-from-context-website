/** @jsxImportSource @emotion/react */

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { selectSubtitleText } from './subtitleSlice';
import styled from 'styled-components';
import { css } from '@emotion/react';
import { getSentence, getText } from 'get-selection-more';
import { openDictPopup } from '../translate/translatePopupSlice';
import { videoController } from '../video/Video';
import { getNthDifficultWord } from './computeWordDifficulty';
import { dictPopupVisible } from '../translate/TranslatePopup';
export interface SubtitleSelectionData {
    text: string;
    sentence: string;
    clickX: number;
    clickY: number;
}

const SubtitleWrapper = styled.div`
    position: absolute;
    font-size: xxx-large;
    width: fit-content;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    bottom: 6%;
    color: white;
`;

const clientX = window.innerWidth / 2;
const clientY = window.innerHeight - 100;
export let keyboardQueryMode = false;

export function Subtitle() {
    const subtitleText = useAppSelector(selectSubtitleText);
    const dispatch = useAppDispatch();
    const sentenceRef = useRef(subtitleText);
    const wordListRef = useRef(['']);
    const queryWordRankRef = useRef(0);

    useEffect(() => {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            event.stopPropagation();
            let key = event.key;
            // auto translate
            if (key === 'Enter' && sentenceRef.current && !dictPopupVisible) {
                queryWordRankRef.current = 0;
                keyboardQueryMode = true;
                let word = getNthDifficultWord(wordListRef.current, queryWordRankRef.current);
                let SubtitleSelectionData: SubtitleSelectionData = {
                    text: word,
                    sentence: sentenceRef.current,
                    clickX: clientX,
                    clickY: clientY
                };
                // prevent open anki export popup
                setTimeout(() => {
                    dispatch(openDictPopup(SubtitleSelectionData));
                }, 100);
            } else if (key === 'a' || key === 'A' || key === 'ArrowLeft') {
                if (!keyboardQueryMode) {
                    return;
                }
                if (queryWordRankRef.current > 0) {
                    queryWordRankRef.current--;
                }
                let word = getNthDifficultWord(wordListRef.current, queryWordRankRef.current);
                let SubtitleSelectionData: SubtitleSelectionData = {
                    text: word,
                    sentence: sentenceRef.current,
                    clickX: clientX,
                    clickY: clientY
                };
                dispatch(openDictPopup(SubtitleSelectionData));
            } else if ((key === 'd' || key === 'D' || key === 'ArrowRight') && keyboardQueryMode) {
                if (!keyboardQueryMode) {
                    return;
                }
                if (queryWordRankRef.current < wordListRef.current.length - 1) {
                    queryWordRankRef.current++;
                }
                let word = getNthDifficultWord(wordListRef.current, queryWordRankRef.current);
                let SubtitleSelectionData: SubtitleSelectionData = {
                    text: word,
                    sentence: sentenceRef.current,
                    clickX: clientX,
                    clickY: clientY
                };
                dispatch(openDictPopup(SubtitleSelectionData));
            }
        });
        document.addEventListener('mouseup', () => {
            keyboardQueryMode = false;
        });
    }, []);

    useEffect(() => {
        sentenceRef.current = getSentenceBySubtitleText(subtitleText);
        wordListRef.current = getWordList(sentenceRef.current);
        queryWordRankRef.current = 0;
    }, [subtitleText]);

    function mouseUp(event: React.MouseEvent) {
        let text = getText();
        if (!isEnWordGroup(text)) {
            return;
        }
        let sentence = getSentence();
        let SubtitleSelectionData: SubtitleSelectionData = {
            text: text,
            sentence: sentence,
            clickX: event.clientX,
            clickY: event.clientY
        };
        dispatch(openDictPopup(SubtitleSelectionData));
    }

    return (
        <SubtitleWrapper
            css={css`
                display: 'block';
            `}
            onClick={() => {
                videoController.pause();
            }}
            onDoubleClick={(event) => {
                event.stopPropagation();
            }}
            onMouseUp={mouseUp}
        >
            <p
                css={css`
                    white-space: pre-line;
                    font-family: serif;
                `}
            >
                {subtitleText}
            </p>
        </SubtitleWrapper>
    );
}

let isEnWordGroupRegex = /^[a-zA-Z '-]+$/;

function isEnWordGroup(sentence: string): boolean {
    if (!sentence) {
        return false;
    }
    let newSentence = sentence.trim();
    if (isEnWordGroupRegex.test(newSentence)) {
        return true;
    }
    return false;
}

function getSentenceBySubtitleText(subtitleText: string): string {
    let sentence = subtitleText.replace(/<[^>]*>/g, '');
    return sentence;
}

function getWordList(sentence: string): string[] {
    let wordList = sentence.match(/[a-zA-Z'-]+/g) as string[];
    return wordList;
}
