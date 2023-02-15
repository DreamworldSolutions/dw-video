import { css } from '@dreamworld/pwa-helpers/lit.js';
import { isElementAlreadyRegistered } from "@dreamworld/pwa-helpers/utils.js";
import { CircularProgress } from "@material/mwc-circular-progress/mwc-circular-progress.js";

export class DwLoader extends CircularProgress {
  static get styles() {
    return [
      super.styles,
      css`
        /* Regular size */
        :host,
        .mdc-circular-progress {
          height: 28px !important;
          width: 28px !important;
        }

        /* Small size */
        :host([small]),
        :host([small]) .mdc-circular-progress {
          height: 20px !important;
          width: 20px !important;
        }

        /* Large size */
        :host([large]),
        :host([large]) .mdc-circular-progress {
          height: 36px !important;
          width: 36px !important;
        }
      `,
    ];
  }

  constructor() {
    super();
    this.indeterminate = true;
  }

  static get properties() {
    return {
      small: { type: Boolean, reflect: true },
      large: { type: Boolean, reflect: true },
    };
  }
}

if (isElementAlreadyRegistered("dw-loader")) {
  console.warn("lit: 'dw-loader' is already registered, so registration skipped.");
} else {
  customElements.define('dw-loader', DwLoader);
}