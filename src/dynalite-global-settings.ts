import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-settings-row";
import "../homeassistant-frontend/src/components/ha-switch";
import "../homeassistant-frontend/src/components/ha-textfield";
import "../homeassistant-frontend/src/components/ha-select";
import {
  Dynalite,
  dynaliteCopy,
  DynaliteDefaultTemplates,
  DynalitePresetData,
  DynaliteTemplateData,
  panelTabs,
  undefinedIfEmpty,
  underscore,
} from "./common";
import "@material/mwc-button/mwc-button";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import "./dynalite-preset-table";
import { DynaliteInput, DynaliteInputSettings } from "./dynalite-input";
import "./dynalite-input";
import { ifDefined } from "lit/directives/if-defined";

@customElement("dynalite-global-settings")
export class DynaliteGlobalSettings extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public dynalite!: Dynalite;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  @state() private _hasInitialized = false;

  @state() private _hasChanged = false;

  @state() private _helpers: { [key: string]: string } = {};

  @state() private _name = "";

  @state() private _autodiscover = false;

  @state() private _fade = "0.0";

  @state() private _active = "";

  @state() private _overridePresets = false;

  @state() private _presets: { [key: string]: DynalitePresetData } = {};

  @state() private _room_on = "";

  @state() private _room_off = "";

  @state() private _open = "";

  @state() private _close = "";

  @state() private _stop = "";

  @state() private _channel_cover = "";

  @state() private _class = "";

  @state() private _duration = "";

  @state() private _tilt = "";

  @queryAll("dynalite-input") _inputElements?: DynaliteInput[];

  protected willUpdate(_changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(_changedProperties);
    console.log("XXX conn");
    console.dir(this.dynalite);
    if (!this.dynalite) return;
    if (!this._hasInitialized) {
      console.log("initizlizing global settings");
      this._name = this.dynalite.config.name || "";
      this._helpers = {
        name: "Default: " + this.dynalite.default.DEFAULT_NAME,
        fade: "0 For No fade",
      };
      this._autodiscover = this.dynalite.config.autodiscover!;
      this._fade = this.dynalite.config.default!.fade!;
      this._active = this.dynalite.config.active!;
      this._overridePresets = "preset" in this.dynalite.config;
      this._presets = dynaliteCopy(this.dynalite.config.preset || {});
      for (const template in this.dynalite.config.template) {
        for (const param in this.dynalite.config.template[template]) {
          this["_" + param] = this.dynalite.config.template[template][param];
        }
      }
      for (const template in DynaliteDefaultTemplates) {
        for (const param in DynaliteDefaultTemplates[template]) {
          this._helpers[param] = "Default: " + DynaliteDefaultTemplates[template][param];
        }
      }
      this._hasInitialized = true;
    }
  }

  protected render(): TemplateResult | void {
    console.log("XXX global settings render");
    console.dir(this.hass);
    if (!this.hass || !this.dynalite) {
      return html``;
    }
    console.log("XXX render global settings len=%s", this._inputElements?.length);
    console.dir(this._inputElements);
    const canSave =
      this._hasChanged &&
      this._inputElements?.length &&
      Array.from(this._inputElements).every((elem) => elem.isValid());
    console.log("canSave=%s", canSave);
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
              ${["name", "autodiscover", "fade", "active"].map(
                (param) => html`
                  <dynalite-input
                    .settings=${this[underscore(param) + "Input"]}
                    @dynalite-input=${this._handleChange}
                    .value=${this[underscore(param)]}
                    helper=${ifDefined(this._helpers[param])}
                  ></dynalite-input>
                `
              )}
              <h2>Settings for Blinds and Covers</h2>
              ${["class", "duration", "tilt"].map(
                (param) => html`
                  <dynalite-input
                    .settings=${this[underscore(param) + "Input"]}
                    @dynalite-input=${this._handleChange}
                    .value=${this[underscore(param)]}
                    helper=${ifDefined(this._helpers[param])}
                  ></dynalite-input>
                `
              )}
              <h2>Default Presets</h2>
              <dynalite-input
                .settings=${this._overridePresetsInput}
                @dynalite-input=${this._handleChange}
                .value=${this._overridePresets}
              ></dynalite-input>
              ${
                this._overridePresets
                  ? html`<dynalite-preset-table
                      .hass=${this.hass}
                      .narrow=${this.narrow}
                      .route=${this.route}
                      .presets=${this._presets || {}}
                      defaultFade=${ifDefined(this.dynalite.config.default?.fade)}
                      @dynalite-table=${(_ev) => {
                        console.log("global settings - dynalite-table event");
                        this._hasChanged = true;
                      }}
                    ></dynalite-preset-table>`
                  : html``
              }
              </dynalite-preset-table>
              <h2>Area Behavior Default Settings</h2>
              <p>Advanced only - recommended not to change</p>
              <b>On/Off Switch</b>
              ${["room_on", "room_off"].map(
                (param) => html`
                  <dynalite-input
                    .settings=${this[underscore(param) + "Input"]}
                    @dynalite-input=${this._handleChange}
                    .value=${this[underscore(param)]}
                    helper=${ifDefined(this._helpers[param])}
                  ></dynalite-input>
                `
              )}
              <b>Blind or Cover</b>
              ${["open", "close", "stop", "channel_cover"].map(
                (param) => html`
                  <dynalite-input
                    .settings=${this[underscore(param) + "Input"]}
                    @dynalite-input=${this._handleChange}
                    .value=${this[underscore(param)]}
                    helper=${ifDefined(this._helpers[param])}
                  ></dynalite-input>
                `
              )}
            </div>
            <div class="card-actions">
              <mwc-button @click=${this._save} ?disabled=${!canSave}> Save </mwc-button>
            </div>
          </ha-card>
        </div>
      </hass-tabs-subpage>
    `;
  }

  private _save() {
    // fill complete and send update signal
    console.log("XXX save");
    if (this._name) this.dynalite.config.name = this._name;
    else delete this.dynalite.config.name;
    this.dynalite.config.autodiscover = this._autodiscover;
    this.dynalite.config.default!.fade = this._fade;
    this.dynalite.config.active = this._active;
    if (this._overridePresets)
      this.dynalite.config.preset = JSON.parse(JSON.stringify(this._presets));
    else delete this.dynalite.config.preset;
    const templates: DynaliteTemplateData = { room: {}, time_cover: {} };
    for (const template in DynaliteDefaultTemplates) {
      for (const param in DynaliteDefaultTemplates[template]) {
        if (this[underscore(param)] != "") templates[template][param] = this[underscore(param)];
      }
    }
    this.dynalite.config.template = templates;
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
    this.requestUpdate();
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

  _overridePresetsInput = new DynaliteInputSettings("overridePresets")
    .heading("Override Default Presets")
    .desc("Advanced use only")
    .type("boolean");

  _room_onInput = new DynaliteInputSettings("room_on")
    .heading("Turn On")
    .desc("Preset that turns an area on")
    .min(1)
    .max(255)
    .validationMessage("Invalid Preset");

  _room_offInput = new DynaliteInputSettings("room_off")
    .heading("Turn Off")
    .desc("Preset that turns an area off")
    .min(1)
    .max(255)
    .validationMessage("Invalid Preset");

  _openInput = new DynaliteInputSettings("open")
    .heading("Open")
    .desc("Preset to open a blind")
    .min(1)
    .max(255)
    .validationMessage("Invalid Preset");

  _closeInput = new DynaliteInputSettings("close")
    .heading("Close")
    .desc("Preset to close a blind")
    .min(1)
    .max(255)
    .validationMessage("Invalid Preset");

  _stopInput = new DynaliteInputSettings("stop")
    .heading("Open")
    .desc("Preset to open a blind")
    .min(1)
    .max(255)
    .validationMessage("Invalid Preset");

  _channel_coverInput = new DynaliteInputSettings("channel_cover")
    .heading("Controlling channel")
    .desc("Channel number to control a blind")
    .min(1)
    .max(255)
    .validationMessage("Invalid Channel");

  _classInput = new DynaliteInputSettings("class")
    .heading("Type")
    .desc("Default type for new blinds")
    .type("select")
    .selection([
      // XXX addd
      ["blind", "Blind"],
      ["cover", "Cover"],
    ]);

  _durationInput = new DynaliteInputSettings("duration")
    .heading("Default Open/Close Duration")
    .desc("Time in seconds to open a blind")
    .min(1)
    .validationMessage("Invalid Time");

  _tiltInput = new DynaliteInputSettings("tilt")
    .heading("Default Tilt Duration")
    .desc("Time in seconds to open the tilt (0 for no tilt)")
    .min(1)
    .validationMessage("Invalid Time");

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
