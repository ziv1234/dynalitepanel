import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { DynaliteEditPresetDialogParams } from "./show-dialog-dynalite-edit-preset";
import "../homeassistant-frontend/src/components/ha-dialog";
import "../homeassistant-frontend/src/components/ha-settings-row";
import "../homeassistant-frontend/src/components/ha-textfield";
import { HaTextField } from "../homeassistant-frontend/src/components/ha-textfield";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";

@customElement("dynalite-edit-preset-dialog")
export class DynaliteEditPresetDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @state() private _params?: DynaliteEditPresetDialogParams;

  @query("#number-text-field", true) private _numTextField?: HaTextField;

  public async showDialog(params: DynaliteEditPresetDialogParams): Promise<void> {
    this.hass = params.hass;
    this._params = Object.assign({}, params); // XXX TBD check if needed
    console.log("show");
  }

  protected render(): TemplateResult | void {
    if (!this._params) return html``;
    return html`
      <ha-dialog open @closed=${this._close} heading="Edit Preset">
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
        <div class="buttons">
          <mwc-button @click=${this._save}>Save</mwc-button>
        </div>
      </ha-dialog>
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
  }

  private _save(): void {
    console.log("saving");
    console.dir(this._params);
    this._params?.onSave(this._params);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-edit-preset-dialog": DynaliteEditPresetDialog;
  }
}
