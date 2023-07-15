import { getText } from 'get-selection-more';
import { SubtitleController } from './SubtitleController';
import videojs from 'video.js';
import { keyboardQueryMode } from '../subtitle/Subtitle';

export interface ContextFromVideo {
    voiceDataUrl: string;
    imgDataUrl: string;
}

export class VideoController {
    public player: videojs.Player;
    public videoElement: HTMLVideoElement;
    public subtitleController?: SubtitleController;

    public constructor(player: videojs.Player) {
        this.player = player;
        this.videoElement = player.tech().el() as HTMLVideoElement;
        this.setupShortcutKeys();
        this.setupAutoHideCursor();
    }

    public async initSubtitleController(text: string) {
        this.subtitleController = new SubtitleController(text);
    }

    public seek(time: number): void {
        this.player.currentTime(time);
    }

    public play(): void {
        this.player.play();
    }

    public pause(): void {
        this.player.pause();
    }

    public switchPlayStatus(): void {
        if (this.player.paused()) {
            this.play();
        } else {
            this.pause();
        }
    }

    public getCurrentTime(): number {
        return this.player.currentTime();
    }

    public setOntimeupdate(f: any): void {
        this.player.on('timeupdate', f);
    }

    public setOnSubtitleUpdate(f: (newSubtitleText: string) => void): void {
        this.player.on('timeupdate', () => {
            if (!this.subtitleController) {
                return;
            }
            let time = this.getCurrentTime();
            let subtitleText = this.subtitleController.nowSubtitleText;
            this.subtitleController.updateSubtitle(time);
            let newSubtitleText = this.subtitleController.nowSubtitleText;
            if (newSubtitleText !== subtitleText) {
                f(newSubtitleText);
            }
        });
    }

    // all time unit is second
    public seekAndPlay(time: number | null | undefined) {
        if (!time) {
            return;
        }
        this.seek(time);
        this.play();
    }

    public playNext() {
        const time = this.subtitleController?.getNextSubtitleTime();
        this.seekAndPlay(time);
    }

    public playPrev() {
        const time = this.subtitleController?.getPrevSubtitleTime();
        this.seekAndPlay(time);
    }

    public async getContextFromVideo(): Promise<ContextFromVideo> {
        let contextFromVideo: ContextFromVideo = {
            voiceDataUrl: '',
            imgDataUrl: ''
        };
        let nowSubtitleNode = this.subtitleController?.getNowSubtitleNode();
        if (!nowSubtitleNode) {
            return contextFromVideo;
        }
        let begin = nowSubtitleNode?.begin;
        let end = nowSubtitleNode?.end;
        contextFromVideo.imgDataUrl = this.captureVideo(begin);
        contextFromVideo.voiceDataUrl = await this.captureAudio(begin, end);
        return contextFromVideo;
    }

    // capture video
    private captureVideo(time: number): string {
        this.seek(time);
        let canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        let ctx = canvas.getContext('2d')!;
        ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.5);
    }

    private async captureAudio(begin: number, end: number): Promise<string> {
        let videoElement: any = this.videoElement;
        let stream: MediaStream = videoElement.captureStream();

        let audioStream = new MediaStream(stream.getAudioTracks());

        // record audio
        let chunks: Array<Blob> = [];

        const mediaRecorder = new MediaRecorder(audioStream);
        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
        };
        const timeExtend = 200;
        const duration = (end - begin) * 1000 + timeExtend;
        mediaRecorder.start();
        this.play();
        return new Promise<string>((resolve) => {
            mediaRecorder.onstop = () => {
                let reader = new window.FileReader();
                reader.addEventListener('loadend', () => {
                    let base64 = reader.result?.toString();
                    if (!base64) {
                        base64 = '';
                    }
                    resolve(base64);
                });
                const blob = new Blob(chunks, { type: 'audio/webm' });
                reader.readAsDataURL(blob);
            };
            setTimeout(() => {
                this.pause();
                mediaRecorder.stop();
            }, duration);
        });
    }

    private setupShortcutKeys() {
        // Control playback progress by keyboard
        document.addEventListener('keydown', (event) => {
            let keyEvent = event as KeyboardEvent;
            let key = keyEvent.key;
            if (key === 'a' || key === 'A' || key === 'ArrowLeft') {
                if (keyboardQueryMode) {
                    return;
                }
                this.playPrev();
            } else if (key === 'd' || key === 'D' || key === 'ArrowRight') {
                if (keyboardQueryMode) {
                    return;
                }
                this.playNext();
            } else if (key === ' ') {
                this.switchPlayStatus();
            }
        });

        // Control playback progress by double click
        this.videoElement.ondblclick = (event) => {
            let mouseEvent = event;
            let center = this.videoElement.offsetWidth / 2;
            let offset = 200;
            if (mouseEvent.offsetX < center - offset) {
                setTimeout(() => {
                    this.playPrev();
                }, 10);
            } else if (mouseEvent.offsetX > center + offset) {
                setTimeout(() => {
                    this.playNext();
                }, 10);
            } else {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
            }
        };

        // Control playback progress by sliding
        let startX = 0;
        let mousedown = false;
        let dragged = false;
        this.videoElement.onmousedown = (event: MouseEvent) => {
            startX = event.offsetX;
            mousedown = true;
        };
        this.videoElement.onmousemove = (event: MouseEvent) => {
            if (mousedown) {
                dragged = true;
            }
        };
        this.videoElement.onmouseup = (event: MouseEvent) => {
            if (dragged && !getText()) {
                let offset = 10;
                if (event.offsetX < startX - offset) {
                    setTimeout(() => {
                        this.playPrev();
                    }, 10);
                } else if (event.offsetX > startX + offset) {
                    setTimeout(() => {
                        this.playNext();
                    }, 10);
                }
            }
            mousedown = false;
            dragged = false;
        };
    }

    private setupAutoHideCursor() {
        this.player.on('useractive', () => {
            document.body.style.cursor = 'default';
        });
        this.player.on('userinactive', () => {
            document.body.style.cursor = 'none';
        });
    }
}
