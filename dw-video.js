import { LitElement, html, css } from "@dreamworld/pwa-helpers/lit.js";
import { isElementAlreadyRegistered } from "@dreamworld/pwa-helpers/utils.js";
import Player from '@vimeo/player';
import dwFetch from '@dreamworld/fetch'

/**
 * A WebComponent to show a video thumbnail on documentation & blog sites.
 *
 * ## Behaviours
 * - Currntly support only [viemo](https://vimeo.com/) video.
 * - Auto compute height based on width css style.
 * - If you want to show Vimeo actual video instead of a thumbnail then set the `inline` property as a `true`.
 *
 * ## Examples
 *  - Default Examples
 *    ```html
 *      <dw-video
 *        src='https://player.vimeo.com/video/313303279'>
 *      </dw-video>
 *    ```
 *
 *    ```css
 *      dw-video {
 *        width: 500px;
 *      }
 *    ```
 *
 * - Inline Video
 *    ```html
 *      <dw-video
 *        inline
 *        src='https://player.vimeo.com/video/313303279'>
 *      </dw-video>
 *    ```
 *
 *    ```css
 *      dw-video {
 *        width: 500px;
 *      }
 *    ```
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

      /**
       * If `true` then shows a inline vimeo video, Otherwise shows a viemo video thumbnail.
       */
      inline: {
        type: Boolean,
        reflect: true
      },

      /**
       * Video thumbnail-url.
       */
      _thumbnailURL: {
        type: String
      }
    };
  }

  constructor() {
    super();
    this.doNotDelayRendering = true;
  }

  render() {
    return html`
      ${this.inline ? html`
        <div id="video-player"></div>
      `: html`
        <div class="img-container">
          <img src=${this._thumbnailURL} />
        </div>
      `}
    `;
  }

  __onVideoLoad() {
    this.dispatchEvent(new CustomEvent('video-loaded', { detail: { } }, { bubbles: false }));
  }

  updated(changeProps) {
    super.updated && super.updated(changeProps);
    if(changeProps.has('src') || changeProps.has('inline')) {
      if(this.src) {
        if(this.inline) {
          this.__loadVideo();
        } else {
          this.__loadVideoThumbnail();
        }
      }
    }
  }

  async __loadVideoThumbnail() {
    try {
      const response = await dwFetch(`https://vimeo.com/api/oembed.json?url=${this.src}`);
      this._thumbnailURL = response && (response['thumbnail_url_with_play_button'] || response['thumbnail_url']) || '';
    } catch (error) {
      console.error("dw-video: load video thumbnail failed, due to this: ", console.error());
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