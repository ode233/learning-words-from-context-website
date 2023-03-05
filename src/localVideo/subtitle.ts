import { NodeList } from 'subtitle';
import { SubtitleNode } from '../subtitle/subtitleContainer';
import { createSubtitleElement } from '../utils/subtitleUtils';

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

export { generateSubtitleNodeList };
