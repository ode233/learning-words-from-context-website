import { css } from '@emotion/react';
import { getText } from 'get-selection-more';
import { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { SUBTITLE_WRAPPER_ID } from '../../constants/watchVideoConstants';
import styled from 'styled-components';
import { LocalVideo } from '../video/localVideo';
import {
    BEFORE_SUBTITLE_BEGIN_INDEX,
    AFTER_SUBTITLE_END_INDEX,
    NOT_MATCH_SUBTITLE_INDEX
} from '../../constants/subtitleConstants';
import { Subtitle } from './subtitle';

interface SubtitleContainerProps {
    video: LocalVideo;
    subtitle: Subtitle;
    mountElement: HTMLElement;
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
`;

function SubtitleContainer({ video, subtitle, mountElement }: SubtitleContainerProps) {
    const subtitleWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        subtitleWrapperRef.current!.ondblclick = (event) => {
            event.stopPropagation();
        };

        video.setOntimeupdate(() => {
            if (subtitleWrapperRef.current?.style.display === 'none') {
                return;
            }
            updateSubtitle();
        });

        function updateSubtitle() {
            const currentTime = video.getCurrentTime();
            let nowSubTitleIndex;
            let nowSubtitleElementString = '';
            if (currentTime < subtitle.subtitleBeginTime) {
                nowSubTitleIndex = BEFORE_SUBTITLE_BEGIN_INDEX;
            } else if (currentTime > subtitle.subtitleEndTime) {
                nowSubTitleIndex = AFTER_SUBTITLE_END_INDEX;
            } else {
                let subtitleIndexMatchResult = subtitle.getSubtitleIndexByTime(currentTime);
                if (subtitleIndexMatchResult.isMatch) {
                    nowSubTitleIndex = subtitleIndexMatchResult.index;
                    nowSubtitleElementString = subtitle.subtitleNodeList[nowSubTitleIndex].element.outerHTML;
                } else {
                    nowSubTitleIndex = NOT_MATCH_SUBTITLE_INDEX;
                    subtitle.prevSubTitleIndex = subtitleIndexMatchResult.index;
                }
            }

            subtitle.nowSubTitleIndex = nowSubTitleIndex;
            if (subtitleWrapperRef.current!.innerHTML !== nowSubtitleElementString) {
                subtitleWrapperRef.current!.innerHTML = nowSubtitleElementString;
            }
        }

        mountElement.ondblclick = (event) => {
            let mouseEvent = event;
            let center = mountElement.offsetWidth / 2;
            let offset = 200;
            if (mouseEvent.offsetX < center - offset) {
                setTimeout(() => {
                    playPrev();
                }, 10);
            } else if (mouseEvent.offsetX > center + offset) {
                setTimeout(() => {
                    playNext();
                }, 10);
            } else {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
            }
        };

        let startX = 0;
        let mousedown = false;
        let dragged = false;
        mountElement.onmousedown = (event: MouseEvent) => {
            startX = event.offsetX;
            mousedown = true;
        };
        mountElement.onmousemove = (event: MouseEvent) => {
            if (mousedown) {
                dragged = true;
            }
        };
        mountElement.onmouseup = (event: MouseEvent) => {
            if (dragged && !getText()) {
                let offset = 10;
                if (event.offsetX < startX - offset) {
                    setTimeout(() => {
                        playPrev();
                    }, 10);
                } else if (event.offsetX > startX + offset) {
                    setTimeout(() => {
                        playNext();
                    }, 10);
                }
            }
            mousedown = false;
            dragged = false;
        };

        document.addEventListener('keydown', (event) => {
            let keyEvent = event as KeyboardEvent;
            let key = keyEvent.key;
            if (key === 'a' || key === 'A' || key === 'ArrowLeft') {
                playPrev();
            } else if (key === 'd' || key === 'D' || key === 'ArrowRight') {
                playNext();
            }
        });

        function playNext() {
            const time = subtitle.getNextSubtitleTime();
            video.seekAndPlay(time);
        }

        function playPrev() {
            const time = subtitle.getPrevSubtitleTime();
            video.seekAndPlay(time);
        }
    }, []);

    return ReactDOM.createPortal(
        <div>
            <SubtitleWrapper
                ref={subtitleWrapperRef}
                css={css`
                    display: 'block';
                `}
                onClick={(e: any) => {
                    video.pause();
                }}
                id={SUBTITLE_WRAPPER_ID}
            ></SubtitleWrapper>
        </div>,
        mountElement
    );
}

export { SubtitleContainer };
