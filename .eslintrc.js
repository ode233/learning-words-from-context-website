/* eslint-disable @typescript-eslint/no-require-imports */
const { getWords, getGlobalWords } = require('modules-words');

module.exports = {
    extends: ['alloy', 'alloy/typescript'],
    env: {
        // 您的环境变量（包含多个预定义的全局变量）
        // Your environments (which contains several predefined global variables)
        //
        // browser: true,
        // node: true,
        // mocha: true,
        // jest: true,
        // jquery: true
        webextensions: true
    },
    globals: {
        // 您的全局变量（设置为 false 表示它不允许被重新赋值）
        // Your global variables (setting to false means it's not allowed to be reassigned)
        //
        // myGlobal: false
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                'no-undef': 'off'
            }
        }
    ],
    plugins: ['spellcheck'],
    rules: {
        // 自定义您的规则
        // Customize your rules
        semi: [1],
        'spellcheck/spell-checker': [
            'warn',
            {
                skipWords: [
                    ...getWords('video.js'),
                    ...getWords('@mui/system'),
                    ...getWords('react-icons/ai'),
                    ...getWords('@emotion/react'),
                    ...getWords('react-icons/bs'),
                    ...getWords('axios'),
                    ...getWords('typescript'),
                    ...getWords('@ffmpeg/ffmpeg'),
                    ...getGlobalWords(),
                    'href',
                    'netflix',
                    'nflxvideo',
                    'xml',
                    'br',
                    'player-timedtext',
                    'webextensions',
                    'globals',
                    'tsx',
                    'youdao',
                    'tgt',
                    'anki',
                    'fefefe',
                    'favicon',
                    'ico',
                    'cloze',
                    'jpeg',
                    'mousedown',
                    'mouseup',
                    'Mui',
                    'dom',
                    'keydown',
                    'ondataavailable',
                    'onstop',
                    'webpack',
                    'onloadend',
                    'loadend',
                    'undef',
                    'caiyun',
                    'zh',
                    'videojs',
                    'vjs',
                    'srt',
                    'autoplay',
                    'offscreen',
                    'msg',
                    'no-cors',
                    'ctx',
                    'timeupdate',
                    '7yboofgmqoa5cbp2flgn',
                    'useractive',
                    'userinactive',
                    'wordlist',
                    'rect',
                    'rects',
                    'gi',
                    'fullscreenchange',
                    'ffmpeg',
                    'loadedmetadata'
                ]
            }
        ]
    }
};
