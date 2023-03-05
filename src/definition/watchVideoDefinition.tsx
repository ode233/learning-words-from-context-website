import { ContextFromVideo } from './tanslatePopupDefintion';

abstract class Video {
    public videoElement: HTMLVideoElement;
    private stream: MediaStream | null = null;

    public constructor(videoElement: HTMLVideoElement) {
        this.videoElement = videoElement;
    }

    // all time unit is second
    public seekAndPlay(time: number | null) {
        if (!time) {
            return;
        }
        this.seek(time);
        this.play();
    }

    public getContextFromVideo(begin: number, end: number): ContextFromVideo {
        let contextFromVideo: ContextFromVideo = {
            videoSentenceVoiceDataUrl: '',
            imgDataUrl: ''
        };
        this.initStream();
        this.pause();
        contextFromVideo.imgDataUrl = this.captureVideo(begin);
        contextFromVideo.videoSentenceVoiceDataUrl = this.captureAudio(begin, end);
        this.pause();
        return contextFromVideo;
    }

    /**
     * init stream only audio
     */
    private initStream() {
        if (this.stream && this.stream.getAudioTracks().length > 0) {
            return;
        }
        navigator.mediaDevices
            .getDisplayMedia({
                video: true,
                audio: true
            })
            .then((stream) => {
                if (stream.getAudioTracks().length === 0) {
                    window.alert('please share system audio');
                    throw new Error('no audio track');
                }
                this.stream = stream;
            })
            .catch((e) => {
                window.alert('please share system audio');
                throw e;
            });
    }

    // capture video
    private captureVideo(time: number): string {
        this.seek(time);
        let canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        let ctx = canvas.getContext('2d')!;
        ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL();
    }

    private captureAudio(begin: number, end: number): string {
        if (!this.stream) {
            window.alert('please share system audio');
            throw new Error('no stream');
        }
        let chunks: Array<Blob> = [];
        const mediaRecorder = new MediaRecorder(this.stream);
        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
        };

        let mediaRecorderOnStopPromise = new Promise<Blob>((resolve) => {
            mediaRecorder.addEventListener('stop', () => {
                const blob = new Blob(chunks);
                resolve(blob);
            });
        });

        const timeExtend = 200;
        const duration = (end - begin) * 1000 + timeExtend;
        mediaRecorder.start();
        this.play();
        setTimeout(() => {
            mediaRecorder.stop();
        }, duration);

        let res;
        mediaRecorderOnStopPromise.then((blob) => {
            let reader = new window.FileReader();
            res = reader.readAsDataURL(blob);
        });
        if (!res) {
            throw new Error('readAsDataURL error');
        }
        return res;
    }

    public abstract seek(time: number): void;
    public abstract play(): void;
    public abstract pause(): void;
    public abstract getCurrentTime(): number;
    public abstract setOntimeupdate(f: any): void;
}

export { Video };
