import { LitElement, html, css } from "@dreamworld/pwa-helpers/lit.js";
import Player from '@vimeo/player';
import dwFetch from '@dreamworld/fetch'

// Components
import './dw-loader.js';

/**
 * A WebComponent to show a video thumbnail on documentation & blog sites.
 *
 * ## Behaviours
 * - Currntly support only [Vimeo](https://vimeo.com/) video.
 * - Auto compute height based on width css style.
 * - On thumbnail click, open [Vimeo](https://vimeo.com/) video in new tab.
 * - If you want to show [Vimeo](https://vimeo.com/) actual video instead of a thumbnail then set the `inline` property as a `true`.
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
 * @fires loaded - when video thumbnail/inline-video is successfully loaded.
 *
 * @element dw-video
 */
export class DwVideo extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          position: relative;
          display: block;
          width: 100%;
        }

        #video-player, #img-container {
          overflow:hidden;
          padding-bottom:56.25%;
          position:relative;
          height:0;
          border:var(--dw-video-border, none);
        }

        #video-player iframe, #img-container img {
          left:0;
          top:0;
          height:100%;
          width:100%;
          position:absolute;
        }

        #img-container img {
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }

        :host([loaded]) #img-container img {
          opacity: 1;
        }

        dw-loader {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%)
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
      },

      /**
       * `true` when id content is loaded.
       */
      _previewLoaded: { type: Boolean, reflect: true, attribute: 'loaded'},

      /**
       * if `true` then video is autoplay.
       */
      autoplay : { type: Boolean, reflect: true },

      /**
       * if `true` then video is muted.
      */
      muted: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.doNotDelayRendering = true;
    this._previewLoaded = false;
    this.autoplay = false;
    this.muted = false;
  }

  render() {
    return html`
      ${this.inline ? html`
        <div id="video-player"></div>
      `: html`
        <div id="img-container">
          <a href=${this.src} target="_blank">
            <img @load=${this.__onPreviewLoad} src=${this._thumbnailURL}/>
          </a>
        </div>
      `}

      ${!this._previewLoaded ? html`<dw-loader></dw-loader>` : ''}
    `;
  }

  __onPreviewLoad() {
    this._previewLoaded = true;
    this.dispatchEvent(new CustomEvent('loaded', { detail: { } }, { bubbles: false }));
  }

  updated(changeProps) {
    super.updated && super.updated(changeProps);
    if(changeProps.has('src') || changeProps.has('inline')) {
      this._previewLoaded = false;
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
      let responseText; try { responseText = await response.text(); responseText = responseText.trim(); } catch (err) {}
      let responseJSON; try { responseJSON = JSON.parse(responseText); } catch (e) {}
      this._thumbnailURL = responseJSON && (responseJSON['thumbnail_url_with_play_button'] || responseJSON['thumbnail_url']) || '';
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
      autoplay: this.autoplay,
      muted: this.muted,
    };

    const el = this.shadowRoot.querySelector('#video-player');
    this._player = new Player(el, options);
    await this._player.ready();
    this.__onPreviewLoad();
    this.autoplay && this._playVideo();
  }

  async _playVideo() {
    try {
      await this._player.play();
    } catch (error) {}
  }
}

customElements.define("dw-video", DwVideo);