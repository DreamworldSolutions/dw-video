import { LitElement, html, css } from "@dreamworld/pwa-helpers/lit.js";
import { isElementAlreadyRegistered } from "@dreamworld/pwa-helpers/utils.js";
import Player from '@vimeo/player';

/**
 * A WebComponent to show a video on documentation & blog sites.
 *
 * ## Behaviours
 * - Currntly support only [viemo](https://vimeo.com/) video.
 * - Auto compute height or width based on `auto` property, give another value as a css of element.
 *
 * ## Examples 
 *  ```html
 *    <dw-video
 *      auto='width'
 *      src='https://player.vimeo.com/video/313303279'>
 *    </dw-video>
 *  ```
 *
 *  ```css
 *    <!-- In this above case you give a height css property as an element. -->
 *
 *    dw-video {
 *      height: 200px;
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
        }

        :host([auto='height']) {
          height: auto !important;
        }

        :host([auto='width']) {
          width: auto !important;
        }

        #video-player, 
        #video-player iframe {
          width: 100%;
          height: 100%;
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

      /**
       * Auto compute css property name.
       * Default value: height
       * Possible value: height, width.
       */
      auto: {
        type: String,
        reflect: true,
        attribute: 'auto'
      }
    };
  }

  constructor() {
    super();
    this.doNotDelayRendering = true;
    this.auto = 'height';
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