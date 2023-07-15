import { syllable } from 'syllable';
console.log('compute syllable', syllable('syllable'));

// max frequency is 23099033
const MAX_FREQUENCY = 23100000;
const MAX_DIFFICULTY = 23100000;
let wordDifficultyMap: { [key: string]: number } = {};

const initWordDifficultyMap = async () => {
    try {
        const response = await fetch(`${window.location.href}/data/wordlist.csv`);
        const csvData = await response.text();
        const rows = csvData.split('\n');
        rows.forEach((row) => {
            let attrs = row.split(',').map((attr) => attr.replace(/^"(.*)"$/, '$1'));
            let words = attrs[0].toLowerCase();
            let frequency = Number(attrs[1]);
            if (!frequency) {
                return;
            }
            let difficulty = MAX_FREQUENCY - frequency;
            wordDifficultyMap[words] = difficulty;
        });
    } catch (error) {
        console.error('parse wordlist error', error);
    }
};
initWordDifficultyMap();

function getWordDifficulty(word: string): number {
    let difficulty = wordDifficultyMap[word.toLowerCase()];
    if (!difficulty) {
        difficulty = MAX_DIFFICULTY;
    }
    return difficulty;
}

/**
 * get nth difficulty word from word list
 */
export function getNthDifficultWord(wordList: string[], n: number): string {
    if (n < 0 || n > wordList.length - 1) {
        throw new Error('rank is out of range');
    }
    wordList.sort((a, b) => getWordDifficulty(b) - getWordDifficulty(a));
    return wordList[n];
}
