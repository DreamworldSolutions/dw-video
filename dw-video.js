import { LitElement, html, css } from '@dreamworld/pwa-helpers/lit.js';
import Player from '@vimeo/player';
import dwFetch from '@dreamworld/fetch';

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
 * @event loaded - when video thumbnail/inline-video is successfully loaded.
 * @event dw-video-play { title, url, seconds, percent, duration }
 * @event dw-video-pause { title, url, seconds, percent, duration }
 * @event dw-video-seeked { title, url, seconds, percent, duration }
 * @event dw-video-ended { title, url, seconds, percent, duration }
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

        .embed-container {
          overflow: hidden;
          padding-bottom: 56.25%;
          position: relative;
          height: 0;
          border: var(--dw-video-border, none);
        }

        #video-player {
          left: 0;
          top: 0;
          height: 100%;
          width: 100%;
          position: absolute;
        }

        a {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: transparent;
        }

        a > img {
          width: 100%;
        }

        dw-loader {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
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
        type: String,
        reflect: true,
      },

      /**
       * If `true` then shows a inline vimeo video, Otherwise shows a viemo video thumbnail.
       */
      inline: {
        type: Boolean,
        reflect: true,
      },

      /**
       * Video thumbnail-url.
       */
      _thumbnailURL: {
        type: String,
      },

      /**
       * `true` when id content is loaded.
       */
      _previewLoaded: { type: Boolean, reflect: true, attribute: 'loaded' },

      /**
       * if `true` then video is autoplay.
       */
      autoplay: { type: Boolean, reflect: true, attribute: 'auto-play' },

      /**
       * if `true` then video is muted.
       */
      muted: { type: Boolean, reflect: true },

      /**
       * if `true` then video is muted.
       */
      loop: { type: Boolean, reflect: true },

      _visible: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.doNotDelayRendering = true;
    this._previewLoaded = false;
    this.autoplay = false;
    this.muted = false;
    this.loop = false;
    this._onPlay = this._onPlay.bind(this);
    this._onPause = this._onPause.bind(this);
    this._onSeeked = this._onSeeked.bind(this);
    this._onEnded = this._onEnded.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unbindVideoEvents();
  }

  render() {
    return html`
      ${!this._previewLoaded ? html`<dw-loader></dw-loader>` : ''}
      ${!this.inline
        ? html`<a href=${this.src} target="_blank"> ${this._thumbnailURL ? html`<img src=${this._thumbnailURL} />` : ''} </a>`
        : ''}

      <div class="embed-container">
        <iframe
          id="video-player"
          src="${this.src}${!this.inline ? (this.src.includes('?') ? `&controls=0` : `?controls=0`) : ''}"
          width="100%"
          frameborder="0"
          webkitallowfullscreen
          mozallowfullscreen
          allowfullscreen
          allow="autoplay"
          @load=${this.__onPreviewLoad}
        >
        </iframe>
      </div>
    `;
  }

  __onPreviewLoad() {
    this._previewLoaded = true;
    this.dispatchEvent(new CustomEvent('loaded', { detail: {} }, { bubbles: false }));
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.autoplay) {
      this._observeVisibility();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.autoplay) {
      this._unobserveVisibility();
    }
  }

  updated(changedProps) {
    super.updated && super.updated(changedProps);
    if (changedProps.has('src') && this.src) {
      this._previewLoaded = false;
      this._initVimeo();
      if (!this.inline) {
        this.__loadVideoThumbnail();
      }
    }

    if (this.autoplay && (changedProps.has('autoplay') || changedProps.has('_visible'))) {
      this._autoPlay();
    }
  }

  async __loadVideoThumbnail() {
    try {
      const response = await dwFetch(`https://vimeo.com/api/oembed.json?url=${this.src}&width=1920&height=1080`);
      let responseText;
      try {
        responseText = await response.text();
        responseText = responseText.trim();
      } catch (err) {}
      let responseJSON;
      try {
        responseJSON = JSON.parse(responseText);
      } catch (e) {}
      this._thumbnailURL = (responseJSON && (responseJSON['thumbnail_url_with_play_button'] || responseJSON['thumbnail_url'])) || '';
    } catch (error) {
      console.error('dw-video: load video thumbnail failed, due to this: ', error);
    }
  }

  async _initVimeo() {
    this._unbindVideoEvents();

    const options = {
      muted: this.autoplay || this.muted,
      loop: this.loop,
      autopause: true,
    };

    const el = this.shadowRoot.querySelector('#video-player');
    this._player = new Player(el, options);
    this._bindVideoEvents();
    await this._player.ready();
    this.autoplay && this._autoPlay();
  }

  _autoPlay() {
    if (!this._player) {
      return;
    }

    if (this._visible) {
      this._playVideo();
    } else {
      this._playing && this._pauseVideo();
    }
  }

  async _playVideo() {
    try {
      await this._player.play();
    } catch (error) {
      console.warn('Failed to autoplay:', error);
    }
  }

  async _pauseVideo() {
    try {
      await this._player.pause();
    } catch (error) {
      console.warn('Failed to pause:', error);
    }
  }

  _observeVisibility() {
    this._visibilityObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          this._visible = true;
        } else {
          this._visible = false;
        }
      });
    });
    this._visibilityObserver.observe(this);
  }

  _unobserveVisibility() {
    this._visibilityObserver && this._visibilityObserver.disconnect();
  }

  _bindVideoEvents() {
    this._player.on('play', this._onPlay);
    this._player.on('pause', this._onPause);
    this._player.on('seeked', this._onSeeked);
    this._player.on('ended', this._onEnded);
  }

  _unbindVideoEvents() {
    if (!this._player) {
      return;
    }

    this._player.off('play');
    this._player.off('pause');
    this._player.off('seeked');
    this._player.off('ended');
  }

  async _onPlay(event) {
    this._playing = true;
    const title = await this._player.getVideoTitle();
    const url = await this._player.getVideoUrl();
    window.dispatchEvent(new CustomEvent('dw-video-play', { detail: { ...event, title, url } }));
  }

  async _onPause(event) {
    this._playing = false;
    const title = await this._player.getVideoTitle();
    const url = await this._player.getVideoUrl();
    window.dispatchEvent(new CustomEvent('dw-video-pause', { detail: { ...event, title, url } }));
  }

  async _onSeeked(event) {
    this._playing = true;
    const title = await this._player.getVideoTitle();
    const url = await this._player.getVideoUrl();
    window.dispatchEvent(new CustomEvent('dw-video-seeked', { detail: { ...event, title, url } }));
  }

  async _onEnded(event) {
    this._playing = false;
    const title = await this._player.getVideoTitle();
    const url = await this._player.getVideoUrl();
    window.dispatchEvent(new CustomEvent('dw-video-ended', { detail: { ...event, title, url } }));
  }
}

customElements.define('dw-video', DwVideo);
