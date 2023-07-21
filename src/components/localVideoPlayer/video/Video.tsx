/** @jsxImportSource @emotion/react */

import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import './video.css';
import { css } from '@emotion/react';
import { VideoController } from './VideoController';
import { useAppDispatch } from '../../../redux/hook';
import { updateSubtitleText } from '../subtitle/subtitleSlice';
import { updateIsPlay } from './videoSlice';

const videoInputId = 'video-input';
const subtitleInputId = 'subtitle-input';

let VideoJsButton = videojs.getComponent('Button');

class SelectVideo extends VideoJsButton {
    public constructor(player: videojs.Player, options = {}) {
        super(player, options);
        this.setup();
    }

    public setup() {
        this.addClass('vjs-select-video');
        this.controlText('Select video');
    }

    public handleClick() {
        document.getElementById(videoInputId)?.click();
    }
}

class SelectSubtitle extends VideoJsButton {
    public constructor(player: videojs.Player, options = {}) {
        super(player, options);
        this.setup();
    }

    public setup() {
        this.addClass('vjs-select-subtitle');
        this.controlText('Select subtitle');
    }

    public handleClick() {
        document.getElementById(subtitleInputId)?.click();
    }
}

class F11fullscreenToggle extends VideoJsButton {
    public constructor(player: videojs.Player, options = {}) {
        super(player, options);
        this.setup();
    }

    public setup() {
        this.addClass('vjs-f11-full-screen-toggle');
        this.controlText('Full screen');
    }

    public handleClick() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }
}

export let videoController: VideoController;

export default function Video() {
    const videoNodeRef = useRef<HTMLVideoElement>(null);

    const dispatch = useAppDispatch();

    useEffect(() => {
        videojs.registerComponent('selectVideo', SelectVideo);
        videojs.registerComponent('selectSubtitle', SelectSubtitle);
        videojs.registerComponent('f11fullscreenToggle', F11fullscreenToggle);

        const initialOptions: videojs.PlayerOptions = {
            autoplay: true,
            controls: true,
            fill: true,
            controlBar: {
                volumePanel: {
                    inline: false
                },
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'selectVideo',
                    'selectSubtitle',
                    'f11fullscreenToggle'
                ]
            },
            userActions: {
                doubleClick: false
            }
        };
        let player = videojs(videoNodeRef.current!, {
            ...initialOptions
        });

        player.controls(true);

        player.bigPlayButton.handleClick = () => {
            document.getElementById(videoInputId)?.click();
        };

        videoController = new VideoController(player);

        player.on('play', () => {
            dispatch(updateIsPlay(true));
        });

        player.on('pause', () => {
            dispatch(updateIsPlay(false));
        });
    }, []);

    function videoInputOnChange(event: ChangeEvent<HTMLInputElement>) {
        let file = event.target.files![0];
        document.title = file.name;
        videoController.updateSrcFile(file);
    }

    async function subtitleInputOnChange(event: ChangeEvent<HTMLInputElement>) {
        let file = event.target.files![0];
        let text = await file.text();
        videoController.initSubtitleController(text);
        videoController.setOnSubtitleUpdate((newSubtitleText) => {
            dispatch(updateSubtitleText(newSubtitleText));
        });
        dispatch(updateSubtitleText('subtitle is loaded'));
    }

    return (
        <div
            css={css`
                box-sizing: border-box;
                height: 100%;
                width: 100%;
                left: 0;
                margin: 0;
                overflow: hidden;
                padding: 0;
                position: absolute;
                top: 0;
            `}
        >
            <video ref={videoNodeRef} className="video-js vjs-big-play-centered" />
            <input
                type="file"
                accept=".mp4"
                id={videoInputId}
                css={css`
                    display: none;
                `}
                onChange={videoInputOnChange}
            />
            <input
                type="file"
                accept=".srt"
                id={subtitleInputId}
                css={css`
                    display: none;
                `}
                onChange={subtitleInputOnChange}
            />
        </div>
    );
}
