import { rejects } from 'assert';
import delay from 'delay';
import videojs from 'video.js';

interface ContextFromVideo {
    voiceDataUrl: string;
    imgDataUrl: string;
}

class LocalVideo {
    public videoElement: HTMLVideoElement;
    private player: videojs.Player;

    public constructor(videoElement: HTMLVideoElement, player: videojs.Player) {
        this.videoElement = videoElement;
        this.player = player;
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
    public getCurrentTime(): number {
        return this.player.currentTime();
    }
    public setOntimeupdate(f: any): void {
        this.videoElement.ontimeupdate = f;
    }

    // all time unit is second
    public seekAndPlay(time: number | null) {
        if (!time) {
            return;
        }
        this.seek(time);
        this.play();
    }

    public async getContextFromVideo(begin: number, end: number): Promise<ContextFromVideo> {
        let contextFromVideo: ContextFromVideo = {
            voiceDataUrl: '',
            imgDataUrl: ''
        };
        this.pause();
        contextFromVideo.imgDataUrl = this.captureVideo(begin);
        contextFromVideo.voiceDataUrl = await this.captureAudio(begin, end);
        this.pause();
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
        return canvas.toDataURL();
    }

    private async captureAudio(begin: number, end: number): Promise<string> {
        let ctx = new AudioContext();
        // create an source node from the <video>
        let source = ctx.createMediaElementSource(this.videoElement);
        // now a MediaStream destination node
        let stream_dest = ctx.createMediaStreamDestination();
        // connect the source to the MediaStream
        source.connect(stream_dest);
        // grab the MediaStream
        let stream = stream_dest.stream;
        // record audio
        let chunks: Array<Blob> = [];

        const mediaRecorder = new MediaRecorder(stream);
        // TODO: data is empty when mediaRecorder stop, can't hear audio on website when recorder start
        mediaRecorder.ondataavailable = (e) => {
            console.log(e);
            chunks.push(e.data);
            const blob = new Blob(chunks);
            // convert blob to data url
            const audioDataURL = URL.createObjectURL(blob);
            console.log(audioDataURL);
            let reader = new window.FileReader();
            reader.onloadend = () => {
                console.log(reader.result);
            };
            reader.readAsDataURL(blob);
        };
        const timeExtend = 200;
        const duration = (end - begin) * 1000 + timeExtend;
        mediaRecorder.start();
        this.play();
        await delay(duration);
        mediaRecorder.stop();
        const blob = new Blob(chunks);
        // convert blob to data url
        const audioDataURL = URL.createObjectURL(blob);
        return audioDataURL;
    }
}

export { LocalVideo };
