import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators";
import "../homeassistant-frontend/src/components/ha-settings-row";
import "../homeassistant-frontend/src/components/ha-textfield";
import "../homeassistant-frontend/src/components/ha-switch";
import { HaSwitch } from "../homeassistant-frontend/src/components/ha-switch";
import "../homeassistant-frontend/src/components/ha-select";
import "@material/mwc-list/mwc-list-item";
import { ifDefined } from "lit/directives/if-defined";

export class DynaliteInputSettings {
  public nameVal: string;
  public headingVal?: string;
  public descVal?: string;
  public typeVal?: string;
  public requiredVal?: boolean;
  public minVal?: number;
  public maxVal?: number;
  public stepVal?: number;
  public selectionVal?: string[][];
  public excludedVal?: string[];
  public validationMessageVal?: string;
  public suffixVal?: string;

  public constructor(name: string) {
    this.nameVal = name;
  }

  public name(value: string): DynaliteInputSettings {
    this.nameVal = value;
    return this;
  }

  public heading(value: string): DynaliteInputSettings {
    this.headingVal = value;
    return this;
  }

  public desc(value: string): DynaliteInputSettings {
    this.descVal = value;
    return this;
  }

  public type(value: string): DynaliteInputSettings {
    this.typeVal = value;
    return this;
  }

  public min(value: number): DynaliteInputSettings {
    this.minVal = value;
    return this.type("number");
  }

  public max(value: number): DynaliteInputSettings {
    this.maxVal = value;
    return this.type("number");
  }

  public step(value: number): DynaliteInputSettings {
    this.stepVal = value;
    return this.type("number");
  }

  public selection(value: string[][]): DynaliteInputSettings {
    this.selectionVal = value;
    return this;
  }

  public excluded(value: string[]): DynaliteInputSettings {
    this.excludedVal = value;
    return this;
  }

  public validationMessage(value: string): DynaliteInputSettings {
    this.validationMessageVal = value;
    return this;
  }

  public required(): DynaliteInputSettings {
    this.requiredVal = true;
    return this;
  }

  public suffix(value: string): DynaliteInputSettings {
    this.suffixVal = value;
    return this;
  }
}

@customElement("dynalite-input")
export class DynaliteInput extends LitElement {
  @property({ attribute: false }) public settings!: DynaliteInputSettings;

  @property() public value?: string | boolean;

  @property({ type: Boolean }) public disabled?;

  @query("#my-textfield") myTextField;

  protected render(): TemplateResult | void {
    console.log("dynalite-input render");
    console.dir(this.settings);
    return html`
      <ha-settings-row>
        <span slot="heading" data-for=${this.settings.nameVal}> ${this.settings.headingVal} </span>
        <span slot="description" data-for=${this.settings.nameVal}> ${this.settings.descVal} </span>
        ${!this.settings.typeVal
          ? html`
              <ha-textfield
                id="my-textfield"
                name=${this.settings.nameVal}
                value=${ifDefined(this.value)}
                type=${this.settings.type}
                required=${ifDefined(this.settings.requiredVal)}
                disabled=${ifDefined(this.disabled)}
                @change=${this._handleTextChange}
                .validityTransform=${this._validityTransform.bind(this)}
                suffix=${ifDefined(this.settings.suffixVal)}
              ></ha-textfield>
            `
          : this.settings.typeVal == "boolean"
          ? html`
              <ha-switch
                .preference=${this.settings.nameVal}
                checked=${ifDefined(this.value)}
                .disabled=${this.disabled}
                @change=${this._handleBoolChange}
              >
              </ha-switch>
            `
          : this.settings.typeVal == "number"
          ? html`
              <ha-textfield
                id="my-textfield"
                name=${this.settings.nameVal}
                value=${ifDefined(this.value)}
                min=${ifDefined(this.settings.minVal)}
                max=${ifDefined(this.settings.maxVal)}
                step=${ifDefined(this.settings.stepVal)}
                autoValidate
                type="number"
                required=${ifDefined(this.settings.requiredVal)}
                disabled=${ifDefined(this.disabled)}
                @change=${this._handleTextChange}
                .validityTransform=${this._validityTransform.bind(this)}
                suffix=${ifDefined(this.settings.suffixVal)}
              ></ha-textfield>
            `
          : this.settings.typeVal == "select"
          ? html`
              <ha-select
                name=${this.settings.nameVal}
                fixedMenuPosition
                naturalMenuWidth
                value=${ifDefined(this.value)}
                .disabled=${this.disabled}
                @change=${this._handleTextChange}
              >
                ${this.settings.selectionVal?.map(
                  (entry) =>
                    html` <mwc-list-item .value=${entry[0]} .selected=${entry[0] == this.value}>
                      ${entry[1]}
                    </mwc-list-item>`
                )}
              </ha-select>
            `
          : html`Error - Unknown type`}
      </ha-settings-row>
    `;
  }

  private _updateParent(name: string, value: any) {
    this.dispatchEvent(
      new CustomEvent("dynalite-input", { detail: { target: name, value: value } })
    );
  }

  private _handleTextChange(ev) {
    console.log("XXX _handleChange");
    console.dir(ev.currentTarget);
    const target = ev.currentTarget;
    console.log("XXX TBD handle change name=%s value=%s", target.name, target.value);
    console.dir(ev);
    this._updateParent(target.name, target.value);
  }

  private _handleBoolChange(ev) {
    const target = ev.currentTarget as HaSwitch;
    const name = (target as any).preference;
    console.log("XXX TBD handle change name=%s checked=%s", name, target.checked);
    console.dir(ev);
    this._updateParent(name, target.checked);
  }

  private _validityTransform(value: string, nativeValidity: ValidityState): Partial<ValidityState> {
    console.log("validitytransform value=%s", value);
    console.dir(this);
    console.dir(nativeValidity);
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
    if (value == "12") {
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
