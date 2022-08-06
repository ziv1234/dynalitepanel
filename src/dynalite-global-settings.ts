import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-settings-row";
import "../homeassistant-frontend/src/components/ha-switch";
import "../homeassistant-frontend/src/components/ha-textfield";
import "../homeassistant-frontend/src/components/ha-select";
import { Dynalite, panelTabs } from "./common";
import "@material/mwc-button/mwc-button";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import "./dynalite-preset-table";
import { DynaliteInput, DynaliteInputSettings } from "./dynalite-input";
import "./dynalite-input";

@customElement("dynalite-global-settings")
export class DynaliteGlobalSettings extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public dynalite!: Dynalite;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @state() private _name = "";

  @state() private _autodiscover = false;

  @state() private _fade = "0.0";

  @state() private _active = "";

  @state() private _overridePresets = false;

  @state() private _preset;

  @state() private _hasInitialized = false;

  @state() private _hasChanged = false;

  @query("#dynalite-global-settings-element") _inputElement?: DynaliteInput;

  protected willUpdate(_changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(_changedProperties);
    console.log("XXX conn");
    console.dir(this.dynalite);
    if (!this.dynalite) return;
    if (!this._hasInitialized) {
      this._name = this.dynalite.config.name || "";
      this._autodiscover = this.dynalite.config.autodiscover!;
      this._fade = this.dynalite.config.default!.fade!;
      this._active = this.dynalite.config.active!;
      this._overridePresets = "preset" in this.dynalite.config;
      this._preset = JSON.parse(JSON.stringify(this.dynalite.config.preset || {}));
      this._hasInitialized = true;
    }
  }

  _nameInput = new DynaliteInputSettings("name")
    .heading("System Name")
    .desc("User-defined name for this Dynalite system");

  _autodiscoverInput = new DynaliteInputSettings("autodiscover")
    .heading("Auto Discover")
    .desc("Discover devices dynamically (useful for initial setup)")
    .type("boolean");

  _fadeInput = new DynaliteInputSettings("fade")
    .heading("Fade Time")
    .desc("Default fade for device actions (seconds)")
    .min(0)
    .step(0.01)
    .validationMessage("Invalid Fade");

  _activeInput = new DynaliteInputSettings("active")
    .heading("Active Mode")
    .desc("Actively poll system - may increase load")
    .type("select")
    .selection([
      ["off", "Not Active (default)"],
      ["init", "Initial Init"],
      ["on", "Always Active"],
    ]);

  protected render(): TemplateResult | void {
    console.log("XXX global settings render");
    console.dir(this.hass);
    if (!this.hass || !this.dynalite) {
      return html``;
    }
    console.log("XXX render global settings");
    console.dir(this._inputElement);
    return html`
      <hass-tabs-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .tabs=${panelTabs}
        .route=${this.route}
        clickable
      >
        <div class="content">
          <ha-card outlined>
            <div class="card-content">
              <h1>Configure Global Dynalite Settings</h1>
              <p>Host: ${this.dynalite.config.host} Port: ${this.dynalite.config.port}</p>
              <h2>Global Settings</h2>
              <dynalite-input
                .settings=${this._nameInput}
                @dynalite-input=${this._handleChange}
                .value=${this._name}
              ></dynalite-input>
              <dynalite-input
                .settings=${this._autodiscoverInput}
                @dynalite-input=${this._handleChange}
                .value=${this._autodiscover}
              ></dynalite-input>
              <dynalite-input
                id="dynalite-global-settings-element"
                .settings=${this._fadeInput}
                @dynalite-input=${this._handleChange}
                .value=${this._fade}
              ></dynalite-input>
              <dynalite-input
                .settings=${this._activeInput}
                @dynalite-input=${this._handleChange}
                .value=${this._active}
              ></dynalite-input>
              <h2>Default Presets</h2>
              <dynalite-preset-table
                .hass=${this.hass}
                .narrow=${this.narrow}
                .route=${this.route}
                .presets=${this._preset || {}}
              >
              </dynalite-preset-table>
            </div>
            <div class="card-actions">
              <mwc-button
                @click=${this._save}
                ?disabled=${!this._inputElement?.isValid() || !this._hasChanged}
              >
                Save
              </mwc-button>
            </div>
          </ha-card>
        </div>
      </hass-tabs-subpage>
    `;
  }

  private _save() {
    // fill complete and send update signal
    console.log("XXX save");
    if (this._name) {
      this.dynalite.config.name = this._name;
    } else {
      delete this.dynalite.config.name;
    }
    this.dynalite.config.autodiscover = this._autodiscover;
    this.dynalite.config.default!.fade = this._fade;
    this.dynalite.config.active = this._active;
    console.dir(this.dynalite.config);
    console.log("XXX dispatching");
    this._hasChanged = false;
    fireEvent(this, "value-changed");
  }

  private _handleChange(ev) {
    console.dir(ev);
    const detail = ev.detail;
    const target = detail.target;
    const value = detail.value;
    console.log("XXX TBD handle change name=%s value=%s", target, value);
    this["_" + target] = value;
    this._hasChanged = true;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        ha-settings-row {
          padding: 0;
        }
        p {
          margin-top: 0;
        }
        .footer {
          padding: 32px 0 16px;
          text-align: center;
        }
        .content {
          padding: 28px 20px 0;
          display: block;
          max-width: 600px;
          margin: 0 auto;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-global-settings": DynaliteGlobalSettings;
  }
}
