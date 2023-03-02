/** @jsxImportSource @emotion/react */

import videojs from "video.js";
import "video.js/dist/video-js.css";
import { ChangeEvent, useEffect, useRef } from "react";
import "./localVideoPlayer.css";
import { css } from "@emotion/react";

const localVideoPlayerId = "local-video-player";
const videoInputId = "video-input";
const subtitleInputId = "subtitle-input";

let VideoJsButton = videojs.getComponent("Button");

class SelectVideo extends VideoJsButton {
  public constructor(player: videojs.Player, options = {}) {
    super(player, options);
    this.setup();
  }

  public setup() {
    this.addClass("vjs-select-video");
    this.controlText("Select video");
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
    this.addClass("vjs-select-subtitle");
    this.controlText("Select subtitle");
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
    this.addClass("vjs-f11-full-screen-toggle");
    this.controlText("Full screen");
  }

  public handleClick() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }
}

function LocalVideoPlayer() {
  const videoNode = useRef<HTMLVideoElement>(null);
  const subtitleRenderContainer = useRef<HTMLDivElement>(null);
  const player = useRef<videojs.Player>();

  useEffect(() => {
    videojs.registerComponent("selectVideo", SelectVideo);
    videojs.registerComponent("selectSubtitle", SelectSubtitle);
    videojs.registerComponent("f11fullscreenToggle", F11fullscreenToggle);

    const initialOptions: videojs.PlayerOptions = {
      // sources: [
      //     {
      //         src: 'https://vjs.zencdn.net/v/oceans.mp4',
      //         type: 'video/mp4'
      //     }
      // ],
      autoplay: true,
      controls: true,
      fill: true,
      controlBar: {
        volumePanel: {
          inline: false,
        },
        children: [
          "playToggle",
          "volumePanel",
          "currentTimeDisplay",
          "timeDivider",
          "durationDisplay",
          "progressControl",
          "selectVideo",
          "selectSubtitle",
          "f11fullscreenToggle",
        ],
      },
      userActions: {
        doubleClick: false,
      },
    };

    player.current = videojs(videoNode.current!, {
      ...initialOptions,
    });

    player.current.controls(true);
  }, []);

  function videoInputOnChange(event: ChangeEvent<HTMLInputElement>) {
    if (!player.current) {
      return;
    }
    let file = event.target.files![0];
    document.title = file.name;

    let fileURL = URL.createObjectURL(file);
    player.current.src({ src: fileURL, type: file.type });
  }

  async function subtitleInputOnChange(event: ChangeEvent<HTMLInputElement>) {
    // if (!player.current) {
    //   return;
    // }
    // let file = event.target.files![0];
    // let text = await file.text();
    // let nodes = parseSync(text);
    // console.log(nodes);
    // let subtitleNodeList = generateSubtitleNodeList(nodes);
    // let subtitle = new Subtitle(subtitleNodeList);
    // let localVideo = new LocalVideo(videoNode.current!, player.current);
    // let mountElement = document.getElementById(localVideoPlayerId);
    // ReactDOM.render(
    //   <SubtitleContainer
    //     video={localVideo}
    //     subtitle={subtitle}
    //     mountElement={mountElement!}
    //   ></SubtitleContainer>,
    //   subtitleRenderContainer.current
    // );
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
      <video
        ref={videoNode}
        className="video-js vjs-big-play-centered"
        id={localVideoPlayerId}
      />
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
      <div ref={subtitleRenderContainer}></div>
    </div>
  );
}

export default LocalVideoPlayer;
