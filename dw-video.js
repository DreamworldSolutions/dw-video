import { LitElement, html, css } from "@dreamworld/pwa-helpers/lit.js";
import { isElementAlreadyRegistered } from "@dreamworld/pwa-helpers/utils.js";
import Player from '@vimeo/player';

/**
 * A WebComponent to show a video on documentation & blog sites.
 *
 * ## Behaviours
 * - Currntly support only [viemo](https://vimeo.com/) video.
 * - Auto compute height based on width css style.
 * ## Examples 
 *  ```html
 *    <dw-video
 *      src='https://player.vimeo.com/video/313303279'>
 *    </dw-video>
 *  ```
 *
 *  ```css
 *    dw-video {
 *      width: 500px;
 *    }
 *  ```
 * 
 * @fires video-loaded - when video is successfully loaded.
 * 
 * @element dw-video
 */
export class DwVideo extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          display: block;
          width: 100%;
        }

        #video-player {
          overflow:hidden;
          padding-bottom:56.25%;
          position:relative;
          height:0;
          border:var(--dw-video-border, none);
        }

        #video-player iframe {
          left:0;
          top:0;
          height:100%;
          width:100%;
          position:absolute;
        }
      `,
    ];
  }

  static get properties() {
    return {
      /**
       * Video path/source.
       * It should be vimeo video path e.g. https://player.vimeo.com/video/313303279.
       */
      src: {
        type: String
      },
    };
  }

  constructor() {
    super();
    this.doNotDelayRendering = true;
  }

  render() {
    return html`
      <div id="video-player"></div>
    `;
  }

  __onVideoLoad() {
    this.dispatchEvent(new CustomEvent('video-loaded', { detail: { } }, { bubbles: false }));
  }

  updated(changeProps) {
    super.updated && super.updated(changeProps);
    if(changeProps.has('src')) {
      if(this.src) {
        this.__loadVideo();
      }
    }
  }

  async __loadVideo() {
    if(this._player) {
      this._player.destroy && this._player.destroy();
    }

    const options = {
      url: this.src,
      autoplay: true,
      muted: true,
    };

    const el = this.shadowRoot.querySelector('#video-player');
    this._player = new Player(el, options);
    await this._player.ready();
    this.__onVideoLoad();
    this._playVideo();
  }

  async _playVideo() {
    try {
      await this._player.play();
    } catch (error) {}
  }
}
  
if (isElementAlreadyRegistered("dw-video")) {
  console.warn("lit: 'dw-video' is already registered, so registration skipped.");
} else {
  customElements.define("dw-video", DwVideo);
}