import { css, CSSResultGroup, html, TemplateResult } from "lit";
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
import { DynaliteInputElement } from "./dynalite-input-element";

interface DynaliteGlobalSettingsInput {
  name: string;
  autodiscover: boolean;
  fade: string;
  active: string;
  overridePresets: boolean;
  configureTemplates: boolean;
  room_on: string;
  room_off: string;
  open: string;
  close: string;
  stop: string;
  channel_cover: string;
  class: string;
  duration: string;
  tiltEnabled: boolean;
  tilt: string;
}

@customElement("dynalite-global-settings")
export class DynaliteGlobalSettings extends DynaliteInputElement<DynaliteGlobalSettingsInput> {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public dynalite!: Dynalite;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  @state() private _hasInitialized = false;

  @state() private _presets: { [key: string]: DynalitePresetData } = {};

  @queryAll("dynalite-input") _inputElements?: DynaliteInput[];

  protected willUpdate(_changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(_changedProperties);
    console.log("XXX conn");
    console.dir(this.dynalite);
    if (!this.dynalite) return;
    if (!this._hasInitialized) {
      console.log("initizlizing global settings");
      this.result = {
        name: this.dynalite.config.name || "",
        autodiscover: this.dynalite.config.autodiscover!,
        fade: this.dynalite.config.default!.fade!,
        active: this.dynalite.config.active!,
        overridePresets: "preset" in this.dynalite.config,
        configureTemplates: false,
        room_on: "",
        room_off: "",
        open: "",
        close: "",
        stop: "",
        channel_cover: "",
        class: "",
        duration: "",
        tiltEnabled: false,
        tilt: DynaliteDefaultTemplates.time_cover?.tilt!,
      };
      this.helpers = {
        name: "Default: " + this.dynalite.default.DEFAULT_NAME,
        fade: "0 For No fade",
      };
      this._presets = dynaliteCopy(this.dynalite.config.preset || {});
      for (const template in this.dynalite.config.template) {
        for (const param in this.dynalite.config.template[template]) {
          this.result[param] = this.dynalite.config.template[template][param];
        }
      }
      for (const template in DynaliteDefaultTemplates) {
        for (const param in DynaliteDefaultTemplates[template]) {
          this.helpers[param] = "Default: " + DynaliteDefaultTemplates[template][param];
        }
      }
      if ("tilt" in this.dynalite.config.template?.time_cover!) {
        this.result.tilt = this.dynalite.config.template?.time_cover.tilt!;
        if (this.result.tilt == "0") {
          this.result.tiltEnabled = false;
          this.result.tilt = DynaliteDefaultTemplates.time_cover!.tilt!;
        } else {
          this.result.tiltEnabled = true;
        }
      } else {
        this.result.tilt = DynaliteDefaultTemplates.time_cover!.tilt!;
        this.result.tiltEnabled = true;
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
      this.hasChanged &&
      this._inputElements?.length &&
      Array.from(this._inputElements).every(
        (elem) => elem.isValid() || (elem.settings.nameVal == "tilt" && !this.result.tiltEnabled)
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
              ${this.genInputElement("name")}
              ${this.genInputElement("autodiscover")}
              ${this.genInputElement("fade")}
              ${this.genInputElement("active")}
              <h2>Settings for Blinds and Covers</h2>
              ${this.genInputElement("class")}
              ${this.genInputElement("duration")}
              ${this.genInputElement("tiltEnabled")}
              ${this.result.tiltEnabled ? this.genInputElement("tilt") : html``}
              <h1>Advanced Settings</h1>
              ${this.result.overridePresets ? html` <h2>Default Presets</h2>` : html``}
              ${this.genInputElement("overridePresets")}
              ${
                this.result.overridePresets
                  ? html`<dynalite-preset-table
                      .hass=${this.hass}
                      .narrow=${this.narrow}
                      .route=${this.route}
                      .presets=${this._presets || {}}
                      defaultFade=${ifDefined(this.dynalite.config.default?.fade)}
                      @dynalite-table=${(_ev) => {
                        console.log("global settings - dynalite-table event");
                        this.hasChanged = true;
                      }}
                    ></dynalite-preset-table>`
                  : html``
              }
              </dynalite-preset-table>
              ${
                this.result.configureTemplates
                  ? html` <h2>Area Behavior Default Settings</h2>
                      <p>Advanced only - recommended to leave empty</p>`
                  : html``
              }
              ${this.genInputElement("configureTemplates")}
              ${
                this.result.configureTemplates
                  ? html`
                      <b>On/Off Switch</b>
                      ${this.genInputElement("room_on")} ${this.genInputElement("room_off")}
                      ${this.genInputElement("room_on")}
                      <b>Blind or Cover</b>
                      ${this.genInputElement("open")} ${this.genInputElement("close")}
                      ${this.genInputElement("stop")} ${this.genInputElement("channel_cover")}
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
    if (this.result.name) this.dynalite.config.name = this.result.name;
    else delete this.dynalite.config.name;
    this.dynalite.config.autodiscover = this.result.autodiscover;
    this.dynalite.config.default!.fade = this.result.fade;
    this.dynalite.config.active = this.result.active;
    if (this.result.overridePresets)
      this.dynalite.config.preset = JSON.parse(JSON.stringify(this._presets));
    else delete this.dynalite.config.preset;
    const templates: DynaliteTemplateData = { room: {}, time_cover: {} };
    for (const template in DynaliteDefaultTemplates) {
      for (const param in DynaliteDefaultTemplates[template]) {
        if (this.result[param] != "") templates[template][param] = this[underscore(param)];
      }
    }
    if (!this.result.tiltEnabled) templates.time_cover!.tilt = "0";
    this.dynalite.config.template = templates;
    console.dir(this.dynalite.config);
    console.log("XXX dispatching");
    this.hasChanged = false;
    fireEvent(this, "value-changed");
  }

  protected result = {
    name: "",
    autodiscover: false,
    fade: "",
    active: "off",
    overridePresets: false,
    configureTemplates: false,
    room_on: "",
    room_off: "",
    open: "",
    close: "",
    stop: "",
    channel_cover: "",
    class: "",
    duration: "",
    tiltEnabled: false,
    tilt: "",
  };

  protected settings = {
    name: DynaliteTextInput("name")
      .heading("System Name")
      .desc("User-defined name for this Dynalite system"),
    autodiscover: DynaliteBooleanInput("autodiscover")
      .heading("Auto Discover")
      .desc("Discover devices dynamically (useful for initial setup)"),
    fade: DynaliteFadeInput("fade")
      .heading("Fade Time")
      .desc("Default fade for device actions (seconds)"),
    active: DynaliteSelectInput("active")
      .heading("Active Mode")
      .desc("Actively poll system - may increase load")
      .selection([
        ["off", "Not Active (default)"],
        ["init", "Initial Init"],
        ["on", "Always Active"],
      ]),
    class: DynaliteSelectInput("class")
      .heading("Type")
      .desc("Default type for new blinds")
      .selection([
        // XXX add
        ["blind", "Blind"],
        ["cover", "Cover"],
      ]),
    duration: DynaliteDurationInput("duration")
      .heading("Default Open/Close Duration")
      .desc("Time in seconds to open a blind"),
    tiltEnabled: DynaliteBooleanInput("tiltEnabled")
      .heading("Enable Tilt")
      .desc("Enable tilt by default in blinds"),
    tilt: DynaliteDurationInput("tilt")
      .heading("Default Tilt Duration")
      .desc("Time in seconds to open the tilt")
      .required(),
    overridePresets: DynaliteBooleanInput("overridePresets")
      .heading("Override Default Presets")
      .desc("Not recommended"),
    configureTemplates: DynaliteBooleanInput("configureTemplates")
      .heading("Configure Behaviors")
      .desc("Not recommended"),
    room_on: DynaliteIdInput("room_on", "preset")
      .heading("Turn On")
      .desc("Preset that turns an area on"),
    room_off: DynaliteIdInput("room_off", "preset")
      .heading("Turn Off")
      .desc("Preset that turns an area off"),
    open: DynaliteIdInput("open", "preset").heading("Open").desc("Preset to open a blind"),
    close: DynaliteIdInput("close", "preset").heading("Close").desc("Preset to close a blind"),
    stop: DynaliteIdInput("stop", "preset").heading("Open").desc("Preset to open a blind"),
    channel_cover: DynaliteIdInput("channel_cover", "channel")
      .heading("Controlling channel")
      .desc("Channel number to control a blind"),
  };

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
