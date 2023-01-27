import { LitElement, html, css } from "@dreamworld/pwa-helpers/lit.js";
import { isElementAlreadyRegistered } from "@dreamworld/pwa-helpers/utils.js";

import Player from '@vimeo/player';
import debounce from 'lodash-es/debounce';

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
 *      src='https://player.vimeo.com/video/313303279?&autoplay=0'>
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
       * It should be vimeo video path e.g. https://player.vimeo.com/video/313303279?&autoplay=0.
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
    this._onKeyDown = this._onKeyDown.bind(this);
    this.__onVideoTimeupdate = debounce(this.__onVideoTimeupdate.bind(this), 100, {'maxWait': 200});
    this.auto = 'height';
  }

  render() {
    return html`
      <div id="video-player" auto=${this.auto}></div>
    `;
  }

  __onPreviewLoad() {
    this._previewLoaded = true;
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
    this.__onPreviewLoad();
    this.__bindVideoEvents();
    this._playVideo();
  }

  async _playVideo() {
    try {
      await this._player.play();
    } catch (error) {}
  }

  __bindVideoEvents() {
    this.__unbindVideoEvents();
    this._player && this._player.on && this._player.on('play', this.__onVideoPlay.bind(this));
    this._player && this._player.on && this._player.on('pause', this.__onVideoPause.bind(this));
    this._player && this._player.on && this._player.on('timeupdate', this.__onVideoTimeupdate);
    this._player && this._player.on && this._player.on('seeked', this.__onVideoSeeked.bind(this));
    this._player && this._player.on && this._player.on('ended', this.__onVideoEnded.bind(this));
  }

  __unbindVideoEvents() {
    this._player && this._player.off && this._player.off('play');
    this._player && this._player.off && this._player.off('pause');
    this._player && this._player.off && this._player.off('timeupdate');
    this._player && this._player.off && this._player.off('seeked');
    this._player && this._player.off && this._player.off('ended');
  }

  __onVideoTimeupdate(params) {
    this.__lastTimeupdate = params && params.seconds || 0;
  }

  __onVideoPlay() {
    //If already video is play.
    if(this.__videoPlayStart) {
      return;
    }
    this.__videoPlayStart = true;
    amplitude.logVideoEvent('video played');
  }

  __onVideoPause(params) {
    const time =  Math.floor(params && params.seconds || 0);
    //If video start/completed then this event is not track.
    if(!time ||  time == params.duration || params.seconds == params.duration) {
      return;
    }

    this.__videoPlayStart = false;
    amplitude.logVideoEvent('video paused', { 'time': Math.floor(params && params.seconds || 0) });
  }

  __onVideoSeeked(params) {
    if(!params) {
      return;
    }

    if(params.percent) {
      const timeTo = Math.floor(params && params.seconds || 0);
      const timeFrom = Math.floor(this.__lastTimeupdate || 0);
      amplitude.logVideoEvent('video seeked', { 'time_to': timeTo, 'time_from': timeFrom });
    } else {
      this.__onVideoEnded();
      this.__onVideoPlay(params);
    }
  }

  __onVideoEnded() {
    this.__videoPlayStart = false;
    amplitude.logVideoEvent('video completed');
  }

  /**
   * History back.
   * @protected
   */
  async _onCloseClick(e) {
    await waitForEntryAnimation(e);
    this.__closeDialog('CLOSE_ICON_BUTTON');
  }

  __closeDialog(ux) {
    if (dialogRouter.getDialogName() === 'VIDEOS') {
      const time = Math.floor(this.__lastTimeupdate || 0);
      amplitude.logVideoEvent('video closed', {ux: ux || 'UNKNOWN', time});
      router.actions.back();
    }
  }

  /**
   * Closes dialog on `ESC` key.
   * @param {Object} e Event
   */
  _onKeyDown(e) {
    const keyCode = e.keyCode || e.which;
    if (keyCode === 27) {
      e.preventDefault();
      this.__closeDialog('ESC');
    }
  }

  stateChanged(state) {
    this._dialogName = router.selectors.dialogName(state);
    this.src = router.selectors.videoUrl(state);
  }

  disconnectedCallback(){
    document.removeEventListener('keydown', this._onKeyDown);
    this.__unbindVideoEvents();
    super.disconnectedCallback && super.disconnectedCallback();
  }
}

if (isElementAlreadyRegistered("dw-video")) {
  console.warn("lit: 'dw-video' is already registered, so registration skipped.");
} else {
  customElements.define("dw-video", DwVideo);
}