import { Video } from '../definition/watchVideoDefinition';
import videojs from 'video.js';

class LocalVideo extends Video {
    private player: videojs.Player;

    public constructor(videoElement: HTMLVideoElement, player: videojs.Player) {
        super(videoElement);
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
}

export { LocalVideo };
