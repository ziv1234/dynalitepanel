import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { createCloseHeading } from "../homeassistant-frontend/src/components/ha-dialog";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { DynaliteEditPresetDialogParams } from "./show-dialog-dynalite-edit-preset";
import "../homeassistant-frontend/src/components/ha-dialog";

@customElement("dynalite-edit-preset-dialog")
export class DynaliteEditPresetDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @state() private _params?: DynaliteEditPresetDialogParams;

  public async showDialog(params: DynaliteEditPresetDialogParams): Promise<void> {
    this.hass = params.hass;
    this._params = params;
    console.log("show");
  }

  protected render(): TemplateResult | void {
    if (!this._params) return html``;
    return html`
      <ha-dialog
        open
        @closed=${this._close}
        .heading=${createCloseHeading(this.hass!, this._params?.number || "AAA")}
      >
        Hello World!!!
      </ha-dialog>
    `;
  }

  private _close(): void {
    this._params = undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-edit-preset-dialog": DynaliteEditPresetDialog;
  }
}
