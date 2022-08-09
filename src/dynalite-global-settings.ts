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
  underscore,
} from "./common";
import "@material/mwc-button/mwc-button";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import "./dynalite-preset-table";
import { DynaliteInput } from "./dynalite-input";
import "./dynalite-input";
import { ifDefined } from "lit/directives/if-defined";
import {
  DynaliteBooleanInput,
  DynaliteFadeInput,
  DynaliteIdInput,
  DynaliteNumberInput,
  DynaliteSelectInput,
  DynaliteTextInput,
} from "./dynalite-input-settings";

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

  // @ts-ignore:
  @state() private _room_on = "";

  // @ts-ignore:
  @state() private _room_off = "";

  // @ts-ignore:
  @state() private _open = "";

  // @ts-ignore:
  @state() private _close = "";

  // @ts-ignore:
  @state() private _stop = "";

  // @ts-ignore:
  @state() private _channel_cover = "";

  // @ts-ignore:
  @state() private _class = "";

  // @ts-ignore:
  @state() private _duration = "";

  // @ts-ignore:
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
              <p>Advanced only - recommended to leave empty</p>
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

  _nameInput = DynaliteTextInput("name")
    .heading("System Name")
    .desc("User-defined name for this Dynalite system");

  _autodiscoverInput = DynaliteBooleanInput("autodiscover")
    .heading("Auto Discover")
    .desc("Discover devices dynamically (useful for initial setup)");

  _fadeInput = DynaliteFadeInput("fade")
    .heading("Fade Time")
    .desc("Default fade for device actions (seconds)");

  _activeInput = DynaliteSelectInput("active")
    .heading("Active Mode")
    .desc("Actively poll system - may increase load")
    .selection([
      ["off", "Not Active (default)"],
      ["init", "Initial Init"],
      ["on", "Always Active"],
    ]);

  _overridePresetsInput = DynaliteBooleanInput("overridePresets")
    .heading("Override Default Presets")
    .desc("Advanced use only");

  _room_onInput = DynaliteIdInput("room_on", "preset")
    .heading("Turn On")
    .desc("Preset that turns an area on");

  _room_offInput = DynaliteIdInput("room_off", "preset")
    .heading("Turn Off")
    .desc("Preset that turns an area off");

  _openInput = DynaliteIdInput("open", "preset").heading("Open").desc("Preset to open a blind");

  _closeInput = DynaliteIdInput("close", "preset").heading("Close").desc("Preset to close a blind");

  _stopInput = DynaliteIdInput("stop", "preset").heading("Open").desc("Preset to open a blind");

  _channel_coverInput = DynaliteIdInput("channel_cover", "channel")
    .heading("Controlling channel")
    .desc("Channel number to control a blind");

  _classInput = DynaliteSelectInput("class")
    .heading("Type")
    .desc("Default type for new blinds")
    .selection([
      // XXX add
      ["blind", "Blind"],
      ["cover", "Cover"],
    ]);

  _durationInput = DynaliteNumberInput("duration")
    .heading("Default Open/Close Duration")
    .desc("Time in seconds to open a blind")
    .min(1)
    .validationMessage("Invalid Time");

  _tiltInput = DynaliteNumberInput("tilt")
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
