import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators";
import { ifDefined } from "lit/directives/if-defined";
import "../homeassistant-frontend/src/components/ha-settings-row";
import "../homeassistant-frontend/src/components/ha-textfield";
import "../homeassistant-frontend/src/components/ha-switch";
import type { HaSwitch } from "../homeassistant-frontend/src/components/ha-switch";
import "../homeassistant-frontend/src/components/ha-select";
import "@material/mwc-list/mwc-list-item";
import { DynaliteInputSettings } from "./dynalite-input-settings";

@customElement("dynalite-input")
export class DynaliteInput extends LitElement {
  @property({ attribute: false }) public settings!: DynaliteInputSettings;

  @property() public value?: string | boolean;

  @property({ type: Boolean }) public disabled?;

  @property({ attribute: false }) public excluded?: string[];

  @property() public helper?: string;

  @query("#my-textfield") myTextField;

  boundValidityTransform = this._validityTransform.bind(this);

  protected render(): TemplateResult | void {
    const value =
      this.settings.suffixVal !== "%" || !this.value
        ? this.value
        : Math.round(Number(this.value) * 100) + "";
    return html`
      <ha-settings-row>
        <span slot="heading" data-for=${this.settings.nameVal}> ${this.settings.headingVal} </span>
        <span slot="description" data-for=${this.settings.nameVal}> ${this.settings.descVal} </span>
        ${!this.settings.typeVal || this.settings.typeVal === "number"
          ? html`
              <ha-textfield
                id="my-textfield"
                name=${this.settings.nameVal}
                value=${ifDefined(value)}
                type=${ifDefined(this.settings.typeVal)}
                ?required=${this.settings.requiredVal}
                ?disabled=${this.disabled}
                min=${ifDefined(this.settings.minVal)}
                max=${ifDefined(this.settings.maxVal)}
                step=${ifDefined(this.settings.stepVal)}
                helper=${ifDefined(this.helper)}
                autoValidate
                validateOnInitialRender
                .validityTransform=${this.boundValidityTransform}
                suffix=${ifDefined(this.settings.suffixVal)}
                @input=${this._handleTextChange}
              ></ha-textfield>
            `
          : this.settings.typeVal === "boolean"
          ? html`
              <ha-switch
                .preference=${this.settings.nameVal}
                ?checked=${value}
                ?disabled=${this.disabled}
                @change=${this._handleBoolChange}
                haptic
              >
              </ha-switch>
            `
          : this.settings.typeVal === "select"
          ? html`
              <ha-select
                name=${this.settings.nameVal}
                fixedMenuPosition
                naturalMenuWidth
                value=${ifDefined(value)}
                ?disabled=${this.disabled}
                @change=${this._handleTextChange}
              >
                ${this.settings.selectionVal?.map(
                  (entry) =>
                    html` <mwc-list-item .value=${entry[0]} .selected=${entry[0] === this.value}>
                      ${entry[1]}
                    </mwc-list-item>`
                )}
              </ha-select>
            `
          : html`Error - Unknown type`}
      </ha-settings-row>
    `;
  }

  public isValid(): boolean {
    if (["boolean", "select"].includes(this.settings.typeVal || "")) return true;
    return this.myTextField && this.myTextField.validity.valid;
  }

  private _updateParent(name: string, value: any) {
    console.log("input update parent");
    this.dispatchEvent(
      new CustomEvent("dynalite-input", { detail: { target: name, value: value } })
    );
  }

  private _handleTextChange(ev) {
    console.log("XXX _handleChange");
    console.dir(ev.currentTarget);
    const target = ev.currentTarget;
    const value =
      this.settings.suffixVal !== "%" || !target.value
        ? target.value
        : Number(target.value) / 100 + "";
    console.log(
      "XXX TBD handle change name=%s value=%s target=%s",
      target.name,
      value,
      target.value
    );
    console.dir(ev);
    this._updateParent(target.name, value);
  }

  private _handleBoolChange(ev) {
    const target = ev.currentTarget as HaSwitch;
    const name = (target as any).preference;
    console.log("XXX TBD handle change name=%s checked=%s", name, target.checked);
    console.dir(ev);
    this._updateParent(name, target.checked);
  }

  private _validityTransform(value: string, nativeValidity: ValidityState): Partial<ValidityState> {
    if (!this.myTextField) return nativeValidity;
    if (
      nativeValidity.rangeOverflow ||
      nativeValidity.rangeUnderflow ||
      nativeValidity.stepMismatch
    ) {
      this.myTextField.setCustomValidity(this.settings.validationMessageVal);
      return {
        valid: false,
        rangeOverflow: nativeValidity.rangeOverflow,
        rangeUnderflow: nativeValidity.rangeUnderflow,
        stepMismatch: nativeValidity.stepMismatch,
      };
    }
    if (nativeValidity.valueMissing) {
      this.myTextField.setCustomValidity("Required");
      return { valid: false, valueMissing: true };
    }
    if (this.excluded && this.excluded.includes(value)) {
      this.myTextField.setCustomValidity("Already exists");
      return { valid: false, customError: true };
    }
    return { valid: true };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-input": DynaliteInput;
  }
}
