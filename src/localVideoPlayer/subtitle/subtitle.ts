import { NodeList } from 'subtitle';
import {
    NOT_MATCH_SUBTITLE_INDEX,
    BEFORE_SUBTITLE_BEGIN_INDEX,
    AFTER_SUBTITLE_END_INDEX
} from '../../constants/subtitleConstants';

function generateSubtitleNodeList(nodes: NodeList): Array<SubtitleNode> {
    let subtitleNodeList: Array<SubtitleNode> = [];
    for (let node of nodes) {
        if (node.type !== 'cue') {
            continue;
        }
        const begin = node.data.start / 10 ** 3;
        const end = node.data.end / 10 ** 3;
        let subtitleHTML = getSubtitleHTML(node.data.text);
        let subtitleElement = createSubtitleElement(subtitleHTML, subtitleNodeList.length);
        subtitleNodeList.push(new SubtitleNode(begin, end, subtitleElement));
    }
    return subtitleNodeList;
}

function getSubtitleHTML(text: string) {
    let subtitleHTML = text;
    subtitleHTML = subtitleHTML.replaceAll('<font face="Serif" size="18">', '');
    subtitleHTML = subtitleHTML.replaceAll('</font>', '');
    return subtitleHTML;
}

function createSubtitleElement(subtitleHTML: string, index: number): HTMLParagraphElement {
    let newSubtitleElement = document.createElement('p');
    newSubtitleElement.style.whiteSpace = 'pre-line';
    newSubtitleElement.style.fontFamily = 'serif';
    newSubtitleElement.innerHTML = subtitleHTML;
    return newSubtitleElement;
}

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

    public constructor(nodes: NodeList) {
        let subtitleNodeList = generateSubtitleNodeList(nodes);
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

export { Subtitle };
