import { LitElement, html, css } from "@dreamworld/pwa-helpers/lit.js";
import { isElementAlreadyRegistered } from "@dreamworld/pwa-helpers/utils.js";

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
        type: String
      }
    };
  }

  render() {
    return html`
    `;
  }
}

if (isElementAlreadyRegistered("dw-video")) {
  console.warn("lit: 'dw-video' is already registered, so registration skipped.");
} else {
  customElements.define("dw-video", DwVideo);
}