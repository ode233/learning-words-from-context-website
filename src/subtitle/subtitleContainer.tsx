import { css } from '@emotion/react';
import { getText } from 'get-selection-more';
import { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { SUBTITLE_WRAPPER_ID } from '../constants/watchVideoConstants';
import { ContextFromVideo } from '../definition/tanslatePopupDefintion';
import { Video } from '../definition/watchVideoDefinition';
import styled from 'styled-components';
import { Popup } from '../translate/popup';

interface SubtitleContainerProps {
    video: Video;
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

class SubtitleNode {
    // second
    public begin: number;
    public end: number;
    public element: HTMLParagraphElement;

    public constructor(begin: number, end: number, element: HTMLParagraphElement) {
        this.begin = begin;
        this.end = end;
        this.element = element;
    }
}

const BEFORE_SUBTITLE_BEGIN_INDEX = -1;
const AFTER_SUBTITLE_END_INDEX = -2;
const NOT_MATCH_SUBTITLE_INDEX = -3;

class SubtitleIndexMatchResult {
    public isMatch: boolean;
    // represents the previous index if not match
    public index: number;

    public constructor(isMatch: boolean, index: number) {
        this.isMatch = isMatch;
        this.index = index;
    }
}

class Subtitle {
    public subtitleNodeList: Array<SubtitleNode> = [];

    public nowSubTitleIndex = NOT_MATCH_SUBTITLE_INDEX;
    public prevSubTitleIndex = NOT_MATCH_SUBTITLE_INDEX;

    public subtitleBeginTime = 0;
    public subtitleEndTime = 0;

    public constructor(subtitleNodeList: Array<SubtitleNode>) {
        this.subtitleNodeList = subtitleNodeList;
        this.subtitleBeginTime = subtitleNodeList[0].begin;
        this.subtitleEndTime = subtitleNodeList[subtitleNodeList.length - 1].end;
    }

    public getSubtitleIndexByTime(time: number) {
        return this.binarySearch(0, this.subtitleNodeList.length - 1, time);
    }

    public getNowSubtitleNode() {
        if (this.nowSubTitleIndex < 0) {
            return null;
        }
        return this.subtitleNodeList[this.nowSubTitleIndex];
    }

    public getNextSubtitleTime(): number | null {
        switch (this.nowSubTitleIndex) {
            case BEFORE_SUBTITLE_BEGIN_INDEX: {
                return this.subtitleNodeList[0].begin;
            }
            case AFTER_SUBTITLE_END_INDEX: {
                return null;
            }
            case NOT_MATCH_SUBTITLE_INDEX: {
                return this.subtitleNodeList[this.prevSubTitleIndex + 1].begin;
            }
            case this.subtitleNodeList.length - 1: {
                return null;
            }
            default: {
                return this.subtitleNodeList[this.nowSubTitleIndex + 1].begin;
            }
        }
    }

    public getPrevSubtitleTime(): number | null {
        switch (this.nowSubTitleIndex) {
            case BEFORE_SUBTITLE_BEGIN_INDEX: {
                return null;
            }
            case AFTER_SUBTITLE_END_INDEX: {
                return this.subtitleNodeList[this.subtitleNodeList.length - 1].begin;
            }
            case NOT_MATCH_SUBTITLE_INDEX: {
                return this.subtitleNodeList[this.prevSubTitleIndex].begin;
            }
            case 0: {
                return null;
            }
            default: {
                return this.subtitleNodeList[this.nowSubTitleIndex - 1].begin;
            }
        }
    }

    private binarySearch(i: number, j: number, target: number): SubtitleIndexMatchResult {
        if (i > j) {
            return new SubtitleIndexMatchResult(false, j);
        }
        let mid = Math.floor(i + (j - i) / 2);
        let subtitle = this.subtitleNodeList[mid];
        if (target >= subtitle.begin && target <= subtitle.end) {
            return new SubtitleIndexMatchResult(true, mid);
        } else if (target < subtitle.begin) {
            return this.binarySearch(i, mid - 1, target);
        } else {
            return this.binarySearch(mid + 1, j, target);
        }
    }
}

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

export { SubtitleContainer, Subtitle, SubtitleNode, SubtitleIndexMatchResult, SubtitleWrapper };
