import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { ifDefined } from "lit/directives/if-defined";
import "../homeassistant-frontend/src/components/ha-button-menu";
import "../homeassistant-frontend/src/components/ha-icon-button";
import { mdiDelete, mdiDotsVertical } from "@mdi/js";
import "@material/mwc-list/mwc-list-item";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { showConfirmationDialog } from "../homeassistant-frontend/src/dialogs/generic/show-dialog-box";

@customElement("dynalite-action-button")
export class DynaliteActionButton extends LitElement {
  @property({ type: String }) public param!: string;

  @property({ type: String }) public label!: string;

  protected render(): TemplateResult | void {
    console.log("XXX render action-button param=%s", this.param);
    console.dir(this);
    return html`
      <ha-button-menu
        @action=${this._handleAction}
        @closed=${this._onButtonClose}
        corner="BOTTOM_START"
        fixed
      >
        <ha-icon-button
          slot="trigger"
          label="Additional Actions"
          .path=${mdiDotsVertical}
        ></ha-icon-button>
        <mwc-list-item class="warning" graphic="icon">
          Delete ${this.label}
          <ha-svg-icon slot="graphic" .path=${mdiDelete} class="warning"> </ha-svg-icon>
        </mwc-list-item>
      </ha-button-menu>
    `;
  }

  private async _handleAction(ev) {
    console.log("handleAction");
    console.dir(ev);
    console.dir(this);
    const index = ev.detail.index;
    switch (index) {
      case 0: {
        if (
          !(await showConfirmationDialog(this, {
            title: `Delete ${this.label} ${this.param}`,
            text: `Are you sure you want to delete ${this.label.toLowerCase()} ${this.param}`,
            confirmText: "Confirm",
          }))
        ) {
          console.log("received no");
          return;
        }
        console.log("received yes");
        this.dispatchEvent(new CustomEvent("dynalite-action-button", { detail: this.param }));
        break;
      }
      default: {
        console.error("invalid index %s", index);
      }
    }
  }

  private _onButtonClose(ev) {
    ev.stopPropagation();
  }

  static get styles(): CSSResultGroup {
    return [haStyle];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-action-button": DynaliteActionButton;
  }
}
