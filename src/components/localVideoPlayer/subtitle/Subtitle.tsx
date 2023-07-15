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

export let keyboardQueryMode = false;

export function Subtitle() {
    const subtitleText = useAppSelector(selectSubtitleText);
    const dispatch = useAppDispatch();
    const sentenceRef = useRef(subtitleText);
    const wordListRef = useRef(['']);
    const queryWordRankRef = useRef(0);
    const subtitleTextNodeRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            event.stopPropagation();
            let key = event.key;
            // auto translate
            if (key === 'Enter' && sentenceRef.current && !dictPopupVisible) {
                if (!keyboardQueryMode) {
                    keyboardQueryMode = true;
                    queryWordRankRef.current = 0;
                    videoController.pause();
                    let word = getNthDifficultWord(wordListRef.current, queryWordRankRef.current);
                    selectWord(word, subtitleTextNodeRef.current!);
                } else {
                    keyboardQueryMode = false;
                    let rect = window.getSelection()?.getRangeAt(0).getClientRects()[0];
                    let SubtitleSelectionData: SubtitleSelectionData = {
                        text: getText(),
                        sentence: getSentence(),
                        clickX: rect!.left,
                        clickY: rect!.top
                    };
                    // prevent open anki export popup
                    setTimeout(() => {
                        dispatch(openDictPopup(SubtitleSelectionData));
                    }, 100);
                }
            } else if (key === 'a' || key === 'A' || key === 'ArrowLeft') {
                if (!keyboardQueryMode) {
                    return;
                }
                if (queryWordRankRef.current > 0) {
                    queryWordRankRef.current--;
                }
                let word = getNthDifficultWord(wordListRef.current, queryWordRankRef.current);
                selectWord(word, subtitleTextNodeRef.current!);
            } else if ((key === 'd' || key === 'D' || key === 'ArrowRight') && keyboardQueryMode) {
                if (!keyboardQueryMode) {
                    return;
                }
                if (queryWordRankRef.current < wordListRef.current.length - 1) {
                    queryWordRankRef.current++;
                }
                let word = getNthDifficultWord(wordListRef.current, queryWordRankRef.current);
                selectWord(word, subtitleTextNodeRef.current!);
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
        keyboardQueryMode = false;
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
                ref={subtitleTextNodeRef}
                css={css`
                    white-space: pre-line;
                    font-family: serif;
                `}
                dangerouslySetInnerHTML={{ __html: subtitleText }}
            ></p>
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

function selectWord(word: string, subtitleTextNode: Node) {
    const regExp = new RegExp(`\\b${word}\\b`, 'gi'); // 使用单词边界匹配单词
    selectWordRecursion(regExp, subtitleTextNode);
}

function selectWordRecursion(regExp: RegExp, subtitleTextNode: Node) {
    if (!subtitleTextNode.firstChild) {
        const text = subtitleTextNode.textContent!;
        console.log(subtitleTextNode, text);
        const matches = text?.match(regExp);
        if (!matches) {
            return;
        }

        const range = new Range();
        const index = text.indexOf(matches[0]); // 获取第一个匹配单词的起始位置

        range.setStart(subtitleTextNode, index);
        range.setEnd(subtitleTextNode, index + matches[0].length);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }
    const childNodeList = subtitleTextNode.childNodes;
    for (const childNode of childNodeList) {
        selectWordRecursion(regExp, childNode);
    }
}
