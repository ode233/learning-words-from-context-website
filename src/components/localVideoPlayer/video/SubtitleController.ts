import { NodeList, parseSync } from 'subtitle';

const BEFORE_SUBTITLE_BEGIN_INDEX = -1;
const AFTER_SUBTITLE_END_INDEX = -2;
const NOT_MATCH_SUBTITLE_INDEX = -3;

class SubtitleNode {
    // second
    public begin: number;
    public end: number;
    public text: string;

    public constructor(begin: number, end: number, text: string) {
        this.begin = begin;
        this.end = end;
        this.text = text;
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

export class SubtitleController {
    public subtitleNodeList: Array<SubtitleNode> = [];

    public nowSubTitleIndex = NOT_MATCH_SUBTITLE_INDEX;
    public prevSubTitleIndex = NOT_MATCH_SUBTITLE_INDEX;

    public nowSubtitleText = '';

    public subtitleBeginTime = 0;
    public subtitleEndTime = 0;

    public constructor(text: string) {
        let nodes = parseSync(text);
        let subtitleNodeList = generateSubtitleNodeList(nodes);
        console.log('subtitleNodeList', subtitleNodeList);
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

    public updateSubtitle(currentTime: number) {
        if (!currentTime) {
            return;
        }
        let nowSubTitleIndex;
        if (currentTime < this.subtitleBeginTime) {
            nowSubTitleIndex = BEFORE_SUBTITLE_BEGIN_INDEX;
        } else if (currentTime > this.subtitleEndTime) {
            nowSubTitleIndex = AFTER_SUBTITLE_END_INDEX;
        } else {
            let subtitleIndexMatchResult = this.getSubtitleIndexByTime(currentTime);
            if (subtitleIndexMatchResult.isMatch) {
                nowSubTitleIndex = subtitleIndexMatchResult.index;
            } else {
                nowSubTitleIndex = NOT_MATCH_SUBTITLE_INDEX;
                this.prevSubTitleIndex = subtitleIndexMatchResult.index;
            }
        }
        this.nowSubTitleIndex = nowSubTitleIndex;
        let nowSubtitleNode = this.getNowSubtitleNode();
        if (nowSubtitleNode) {
            this.nowSubtitleText = nowSubtitleNode.text;
        } else {
            this.nowSubtitleText = '';
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

function generateSubtitleNodeList(nodes: NodeList): Array<SubtitleNode> {
    let subtitleNodeList: Array<SubtitleNode> = [];
    for (let node of nodes) {
        if (node.type !== 'cue') {
            continue;
        }
        const begin = node.data.start / 10 ** 3;
        const end = node.data.end / 10 ** 3;
        let subtitleHtml = createSubtitleHtml(node.data.text);
        subtitleNodeList.push(new SubtitleNode(begin, end, subtitleHtml));
    }
    return subtitleNodeList;
}

function createSubtitleHtml(text: string): string {
    let processedText = text.replaceAll('<font face="Serif" size="18">', '');
    processedText = text.replaceAll('</font>', '');
    let subtitleElement = document.createElement('p');
    subtitleElement.style.whiteSpace = 'pre-line';
    subtitleElement.style.fontFamily = 'serif';
    subtitleElement.innerHTML = processedText;
    return subtitleElement.outerHTML;
}
