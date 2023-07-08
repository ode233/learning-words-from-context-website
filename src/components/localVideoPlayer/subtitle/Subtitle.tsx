/** @jsxImportSource @emotion/react */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { selectSubtitleText } from './subtitleSlice';
import styled from 'styled-components';
import { css } from '@emotion/react';
import { getSentence, getText } from 'get-selection-more';
import { openDictPopup } from '../translate/translatePopupSlice';
import { videoController } from '../video/Video';
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

export function Subtitle() {
    const subtitleText = useAppSelector(selectSubtitleText);
    const dispatch = useAppDispatch();

    // useEffect(() => {}, [subtitleText]);

    useEffect(() => {}, []);

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
            dangerouslySetInnerHTML={{ __html: subtitleText }}
            onMouseUp={mouseUp}
        ></SubtitleWrapper>
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
