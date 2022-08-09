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
  DynaliteDurationInput,
  DynaliteFadeInput,
  DynaliteIdInput,
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

  @state() private _configureTemplates = false;

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
  @state() private _tiltEnabled = false;

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
      if ("tilt" in this.dynalite.config.template?.time_cover!) {
        this._tilt = this.dynalite.config.template?.time_cover.tilt!;
        if (this._tilt == "0") {
          this._tiltEnabled = false;
          this._tilt = DynaliteDefaultTemplates.time_cover!.tilt!;
        } else {
          this._tiltEnabled = true;
        }
      } else {
        this._tilt = DynaliteDefaultTemplates.time_cover!.tilt!;
        this._tiltEnabled = true;
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
      Array.from(this._inputElements).every(
        (elem) => elem.isValid() || (elem.settings.nameVal == "tilt" && !this._tiltEnabled)
      );
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
              ${this._genInputElement("name")}
              ${this._genInputElement("autodiscover")}
              ${this._genInputElement("fade")}
              ${this._genInputElement("active")}
              <h2>Settings for Blinds and Covers</h2>
              ${this._genInputElement("class")}
              ${this._genInputElement("duration")}
              ${this._genInputElement("tiltEnabled")}
              ${this._tiltEnabled ? this._genInputElement("tilt") : html``}
              <h1>Advanced Settings</h1>
              ${this._overridePresets ? html` <h2>Default Presets</h2>` : html``}
              ${this._genInputElement("overridePresets")}
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
              ${
                this._configureTemplates
                  ? html` <h2>Area Behavior Default Settings</h2>
                      <p>Advanced only - recommended to leave empty</p>`
                  : html``
              }
              ${this._genInputElement("configureTemplates")}
              ${
                this._configureTemplates
                  ? html`
                      <b>On/Off Switch</b>
                      ${this._genInputElement("room_on")} ${this._genInputElement("room_off")}
                      ${this._genInputElement("room_on")}
                      <b>Blind or Cover</b>
                      ${this._genInputElement("open")} ${this._genInputElement("close")}
                      ${this._genInputElement("stop")} ${this._genInputElement("channel_cover")}
                    `
                  : html``
              }
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
    if (!this._tiltEnabled) templates.time_cover!.tilt = "0";
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
    if (target == "tiltEnabled" && !value && this._tilt == "")
      this._tilt = DynaliteDefaultTemplates.time_cover?.tilt!;
    this._hasChanged = true;
    this.requestUpdate();
  }

  private _genInputElement(param: string): TemplateResult {
    return html`
      <dynalite-input
        .settings=${this[underscore(param) + "Input"]}
        @dynalite-input=${this._handleChange}
        .value=${this[underscore(param)]}
        helper=${ifDefined(this._helpers[param])}
      ></dynalite-input>
    `;
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
    .desc("Not recommended");

  _configureTemplatesInput = DynaliteBooleanInput("configureTemplates")
    .heading("Configure Behaviors")
    .desc("Not recommended");

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

  _durationInput = DynaliteDurationInput("duration")
    .heading("Default Open/Close Duration")
    .desc("Time in seconds to open a blind");

  _tiltEnabledInput = DynaliteBooleanInput("tiltEnabled")
    .heading("Enable Tilt")
    .desc("Enable tilt by default in blinds");

  _tiltInput = DynaliteDurationInput("tilt")
    .heading("Default Tilt Duration")
    .desc("Time in seconds to open the tilt (0 for no tilt)")
    .required();

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
