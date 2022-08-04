import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { DynaliteEditPresetDialogParams } from "./show-dialog-dynalite-edit-preset";
import "../homeassistant-frontend/src/components/ha-dialog";
import "../homeassistant-frontend/src/components/ha-settings-row";
import "../homeassistant-frontend/src/components/ha-textfield";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-button-menu";
import "../homeassistant-frontend/src/components/ha-icon-button";
import "../homeassistant-frontend/src/components/ha-header-bar";
import { HaTextField } from "../homeassistant-frontend/src/components/ha-textfield";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { mdiDotsVertical } from "@mdi/js";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import "@material/mwc-list";
import "@material/mwc-button";

@customElement("dynalite-edit-preset-dialog")
export class DynaliteEditPresetDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @state() private _params?: DynaliteEditPresetDialogParams;

  @state() private _isNew = false;

  @query("#number-text-field", true) private _numTextField?: HaTextField;

  public async showDialog(params: DynaliteEditPresetDialogParams): Promise<void> {
    this.hass = params.hass;
    this._params = Object.assign({}, params); // XXX TBD check if needed
    this._isNew = "number" in this._params;
    console.log("show %s", this._isNew);
  }

  protected render(): TemplateResult | void {
    if (!this._params) return html``;
    return html`
      <ha-dialog open .heading=${"abcde"} @closed=${this._close}>
        <div slot="heading">
          <ha-header-bar>
            <span slot="title"> XXX correct title </span>
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
                <mwc-list-item> Delete Preset </mwc-list-item>
                <mwc-list-item disabled> edit_yaml </mwc-list-item>
                <mwc-list-item> duplicate </mwc-list-item>
                <mwc-list-item class="warning"> delete </mwc-list-item>
              </ha-button-menu>
            </span>
          </ha-header-bar>
        </div>
        <div class="wrapper">${this._renderTab()}</div>
        <mwc-button slot="primaryAction" @click=${this._save}>Save</mwc-button>
      </ha-dialog>
    `;
  }

  private _renderTab() {
    return html`
      <ha-card outlined>
        <div class="content">
          <ha-settings-row>
            <span slot="heading" data-for="number"> Number </span>
            <span slot="description" data-for="number"> Dynalite preset number (1-255) </span>
            <ha-textfield
              name="number"
              .value=${this._params.number || ""}
              required
              min="1"
              max="255"
              step="1"
              type="number"
              autovalidate
              @change=${this._handleChange}
              .validityTransform=${this._validityTransform.bind(this)}
              id="number-text-field"
            ></ha-textfield>
          </ha-settings-row>
          <ha-settings-row>
            <span slot="heading" data-for="name"> Name </span>
            <span slot="description" data-for="name"> Name for this preset </span>
            <ha-textfield
              name="name"
              .value=${this._params.name || ""}
              @change=${this._handleChange}
            ></ha-textfield>
          </ha-settings-row>
          <ha-settings-row>
            <span slot="heading" data-for="level"> Level </span>
            <span slot="description" data-for="level"> Channel levels for this preset </span>
            <ha-textfield
              name="level"
              .value=${this._params.level ? Math.round(Number(this._params.level) * 100) : ""}
              min="0"
              max="100"
              type="number"
              autovalidate
              @change=${this._handleChange}
              validationMessage="Illegal value"
              suffix="%"
            ></ha-textfield>
          </ha-settings-row>
          <ha-settings-row>
            <span slot="heading" data-for="fade"> Fade Time </span>
            <span slot="description" data-for="fade"> Preset fade time (seconds) </span>
            <ha-textfield
              name="fade"
              label="Fade"
              .value=${this._params.fade || ""}
              min="0"
              step="0.1"
              autoValidate
              type="number"
              @change=${this._handleChange}
              validationMessage="Invalid Fade"
            ></ha-textfield>
          </ha-settings-row>
        </div>
      </ha-card>
    `;
  }

  private _validityTransform(value: string, nativeValidity: ValidityState): Partial<ValidityState> {
    console.log("validitytransform value=%s", value);
    console.dir(this);
    console.dir(nativeValidity);
    if (!this._numTextField) return nativeValidity;
    if (
      nativeValidity.rangeOverflow ||
      nativeValidity.rangeUnderflow ||
      nativeValidity.stepMismatch
    ) {
      this._numTextField.setCustomValidity("Invalid preset");
      return {
        valid: false,
        rangeOverflow: nativeValidity.rangeOverflow,
        rangeUnderflow: nativeValidity.rangeUnderflow,
        stepMismatch: nativeValidity.stepMismatch,
      };
    }
    if (nativeValidity.valueMissing) {
      this._numTextField.setCustomValidity("Required");
      return { valid: false, valueMissing: true };
    }
    if (value == "12") {
      this._numTextField.setCustomValidity("Already exists");
      return { valid: false, customError: true };
    }
    return { valid: true };
  }

  private _handleChange(ev) {
    const target = ev.currentTarget;
    const name = target.name;
    const value = target.value;
    console.log("XXX TBD handle change name=%s value=%s", name, value);
    console.dir(ev);
    const actualValue = name == "level" ? (value == "" ? "" : value / 100) : value;
    if (["number", "name", "level", "fade"].includes(name)) {
      if (target.value == "") {
        console.log("deleting %s", name);
        delete this._params![name];
      } else {
        console.log("setting %s to %s", name, actualValue);
        this._params![name] = actualValue;
      }
    } else {
      console.log("invalid update - existing function");
    }
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
        .disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        .card-content {
          padding-top: 16px;
          margin-top: 0;
        }
        .card-menu {
          float: var(--float-end, right);
          z-index: 3;
          margin: 4px;
          --mdc-theme-text-primary-on-background: var(--primary-text-color);
          display: flex;
          align-items: center;
        }
        ha-header-bar {
          --mdc-theme-on-primary: var(--primary-text-color);
          --mdc-theme-primary: var(--mdc-theme-surface);
          flex-shrink: 0;
        }

        mwc-tab-bar {
          border-bottom: 1px solid var(--mdc-dialog-scroll-divider-color, rgba(0, 0, 0, 0.12));
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
