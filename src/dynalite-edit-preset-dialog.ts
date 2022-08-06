import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { DynaliteEditPresetDialogParams } from "./show-dialog-dynalite-edit-preset";
import "../homeassistant-frontend/src/components/ha-dialog";
import "../homeassistant-frontend/src/components/ha-settings-row";
import "../homeassistant-frontend/src/components/ha-textfield";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-button-menu";
import "../homeassistant-frontend/src/components/ha-icon-button";
import "../homeassistant-frontend/src/components/ha-header-bar";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { mdiDotsVertical } from "@mdi/js";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import "@material/mwc-list";
import "@material/mwc-button";
import { DynaliteInputSettings } from "./dynalite-input";

@customElement("dynalite-edit-preset-dialog")
export class DynaliteEditPresetDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @state() private _params?: DynaliteEditPresetDialogParams;

  @state() private _isNew = false;

  public async showDialog(params: DynaliteEditPresetDialogParams): Promise<void> {
    this.hass = params.hass;
    this._params = Object.assign({}, params); // XXX TBD check if needed
    this._isNew = !("number" in this._params);
    console.log("show %s", this._isNew);
  }

  _numberInput = new DynaliteInputSettings("number")
    .heading("Number")
    .desc("Dynalite preset number (1-255)")
    .min(1)
    .max(255)
    .step(1)
    .required()
    .validationMessage("Invalid preset");

  _nameInput = new DynaliteInputSettings("name").heading("Name").desc("Name for this preset");

  _levelInput = new DynaliteInputSettings("level")
    .heading("Level")
    .desc("Channel levels for this preset")
    .min(0)
    .max(100)
    .validationMessage("Invalid value")
    .suffix("%");

  _fadeInput = new DynaliteInputSettings("fade")
    .heading("Fade")
    .desc("Preset fade time (seconds)")
    .min(0)
    .step(0.01)
    .validationMessage("Invalid fade");

  protected render(): TemplateResult | void {
    if (!this._params) return html``;
    return html`
      <ha-dialog open .heading=${"abcde"} @closed=${this._close}>
        <div slot="heading">
          <ha-header-bar>
            <span slot="title">
              ${this._isNew ? "New Preset" : "Edit Preset " + this._params.number}
            </span>
            <span slot="actionItems">
              <ha-button-menu
                @action=${console.log}
                @closed=${(ev) => {
                  ev.stopPropagation();
                }}
                corner="BOTTOM_START"
                fixed
              >
                <ha-icon-button
                  slot="trigger"
                  label="Additional Actions"
                  .path=${mdiDotsVertical}
                ></ha-icon-button>
                <mwc-list-item class="warning"> Delete Preset </mwc-list-item>
                <mwc-list-item disabled> edit_yaml </mwc-list-item>
                <mwc-list-item> duplicate </mwc-list-item>
                <mwc-list-item class="warning"> delete </mwc-list-item>
              </ha-button-menu>
            </span>
          </ha-header-bar>
        </div>
        <div class="wrapper">
          <ha-card outlined>
            <div class="content">
              <dynalite-input
                .settings=${this._numberInput}
                .value=${this._params.number}
                ?disabled=${!this._isNew}
                .excluded=${this._params.excluded}
                @dynalite-input=${this._handleChange}
              ></dynalite-input>
              <dynalite-input
                .settings=${this._nameInput}
                .value=${this._params.name}
                @dynalite-input=${this._handleChange}
              ></dynalite-input>
              <dynalite-input
                .settings=${this._levelInput}
                .value=${this._params.level
                  ? Math.round(Number(this._params.level) * 100) + ""
                  : ""}
                @dynalite-input=${this._handleChange}
              ></dynalite-input>
              <dynalite-input
                .settings=${this._fadeInput}
                .value=${this._params.fade}
                @dynalite-input=${this._handleChange}
              ></dynalite-input>
            </div>
          </ha-card>
        </div>
        <mwc-button slot="primaryAction" @click=${this._save}>Save</mwc-button>
        <mwc-button slot="secondaryAction" @click=${this._close}>Cancel</mwc-button>
      </ha-dialog>
    `;
  }

  private _handleChange(ev) {
    console.dir(ev);
    const detail = ev.detail;
    const target = detail.target;
    let value = detail.value;
    if (target == "level" && value != "") {
      value = value / 100;
    }
    console.log("XXX TBD handle change name=%s value=%s", target, value);
    this._params![target] = value;
  }

  private _close(): void {
    this._params = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  private _save(): void {
    console.log("saving");
    console.dir(this._params);
    this._params?.onSave(this._params);
    this._close();
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        ha-header-bar {
          --mdc-theme-on-primary: var(--primary-text-color);
          --mdc-theme-primary: var(--mdc-theme-surface);
          flex-shrink: 0;
        }
        ha-dialog {
          --dialog-content-position: static;
          --dialog-content-padding: 0;
          --dialog-z-index: 6;
        }
        .content {
          display: block;
          padding: 20px 24px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-edit-preset-dialog": DynaliteEditPresetDialog;
  }
}
