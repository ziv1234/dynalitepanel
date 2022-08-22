import { ifDefined } from "lit/directives/if-defined";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators";
import type { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { navigate } from "../homeassistant-frontend/src/common/navigate";
import {
  CONF_ACTIVE,
  CONF_ACTIVE_INIT,
  CONF_ACTIVE_OFF,
  CONF_ACTIVE_ON,
  CONF_AUTODISCOVER,
  CONF_CHANNEL,
  CONF_CHANNEL_COVER,
  CONF_CLASS,
  CONF_CLOSE,
  CONF_DURATION,
  CONF_FADE,
  CONF_NAME,
  CONF_OPEN,
  CONF_OVERRIDE_PRESETS,
  CONF_OVERRIDE_TEMPLATES,
  CONF_PRESET,
  CONF_ROOM_OFF,
  CONF_ROOM_ON,
  CONF_STOP,
  CONF_TILT,
  CONF_TILT_ENABLED,
  EVENT_CONFIG_CHANGED,
  ROUTE_AREAS,
  TEMPLATE_COVER,
  TEMPLATE_ROOM,
} from "./const";
import {
  Dynalite,
  dynaliteCopy,
  DynaliteDefaultTemplates,
  DynalitePresetData,
  dynaliteRoute,
  DynaliteTemplateData,
  enumeratedTemplates,
  panelTabs,
} from "./common";
import type { DynaliteInput } from "./dynalite-input";
import {
  DynaliteBooleanInput,
  DynaliteDurationInput,
  DynaliteFadeInput,
  DynaliteIdInput,
  DynaliteSelectInput,
  DynaliteTextInput,
} from "./dynalite-input-settings";
import { DynaliteInputElement } from "./dynalite-input-element";
import { showDynaliteSelectGatewayDialog } from "./show-dialog-select-gateway";
import "@material/mwc-button/mwc-button";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import "../homeassistant-frontend/src/components/ha-card";
import "./dynalite-preset-table";

interface DynaliteGlobalSettingsInput {
  name: string;
  autodiscover: boolean;
  fade: string;
  active: string;
  overridePresets: boolean;
  overrideTemplates: boolean;
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
    if (!this.dynalite) return;
    if (!this._hasInitialized) {
      this.settings.class.selection(this.dynalite.classSelection);
      this.result = {
        name: this.dynalite.config.name || "",
        autodiscover: this.dynalite.config.autodiscover!,
        fade: this.dynalite.config.default!.fade!,
        active: this.dynalite.config.active!,
        overridePresets: CONF_PRESET in this.dynalite.config,
        overrideTemplates: false,
        room_on: "",
        room_off: "",
        open: "",
        close: "",
        stop: "",
        channel_cover: "",
        class: "",
        duration: "",
        tiltEnabled: false,
        tilt: DynaliteDefaultTemplates.time_cover!.tilt!,
      };
      this.helpers = {
        name: "Default: " + this.dynalite.default.DEFAULT_NAME,
        fade: "0 For No fade",
      };
      this._presets = dynaliteCopy(this.dynalite.config.preset || {});
      enumeratedTemplates.forEach(([template, param]) => {
        if (param in this.dynalite.config.template![template])
          this.result[param] = this.dynalite.config.template![template][param];
        this.helpers![param] = "Default: " + DynaliteDefaultTemplates[template][param];
      });
      if (parseFloat(this.result.tilt) === 0) {
        this.result.tiltEnabled = false;
        this.result.tilt = DynaliteDefaultTemplates.time_cover!.tilt!;
      } else {
        this.result.tiltEnabled = true;
        this.result.tilt = this.dynalite.config.template!.time_cover!.tilt!;
      }
      this._hasInitialized = true;
    }
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this.dynalite) {
      return html``;
    }
    const canSave =
      this.hasElementChanged &&
      this._inputElements?.length &&
      Array.from(this._inputElements).every(
        (elem) =>
          elem.isValid() || (elem.settings.nameVal === CONF_TILT && !this.result.tiltEnabled)
      );
    const showAdvanced = this.hass.userData?.showAdvanced;
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
              ${Object.keys(this.dynalite.completeConfig).length > 1
                ? html`<a @click=${this._handleChangeHost} href="#select-gateway">Change</a>`
                : html``}
              <h2>Global Settings</h2>
              ${this.genInputElement(CONF_NAME)} ${this.genInputElement(CONF_AUTODISCOVER)}
              ${this.genInputElement(CONF_FADE)} ${this.genInputElement(CONF_ACTIVE)}
              <h2>Settings for Blinds and Covers</h2>
              ${this.genInputElement(CONF_CLASS)} ${this.genInputElement(CONF_DURATION)}
              ${this.genInputElement(CONF_TILT_ENABLED)}
              ${this.result.tiltEnabled ? this.genInputElement(CONF_TILT) : html``}
              ${showAdvanced
                ? html`
                  <h1>Advanced Settings</h1>
                  ${this.result.overridePresets ? html` <h2>Default Presets</h2>` : html``}
                  ${this.genInputElement(CONF_OVERRIDE_PRESETS)}
                  ${
                    this.result.overridePresets
                      ? html`<dynalite-preset-table
                          .hass=${this.hass}
                          .narrow=${this.narrow}
                          .route=${this.route}
                          .presets=${this._presets || {}}
                          defaultFade=${ifDefined(this.dynalite.config.default?.fade)}
                          @dynalite-table=${this._onDynaliteTableEvent}
                        ></dynalite-preset-table>`
                      : html``
                  }
                  </dynalite-preset-table>
                  ${
                    this.result.overrideTemplates
                      ? html` <h2>Area Behavior Default Settings</h2>
                          <p>Advanced only - recommended to leave empty</p>`
                      : html``
                  }
                  ${this.genInputElement(CONF_OVERRIDE_TEMPLATES)}
                  ${
                    this.result.overrideTemplates
                      ? html`
                          <b>${TEMPLATE_ROOM}</b>
                          ${this.genInputElement(CONF_ROOM_ON)}
                          ${this.genInputElement(CONF_ROOM_OFF)}
                          <b>${TEMPLATE_COVER}</b>
                          ${this.genInputElement(CONF_OPEN)} ${this.genInputElement(CONF_CLOSE)}
                          ${this.genInputElement(CONF_STOP)}
                          ${this.genInputElement(CONF_CHANNEL_COVER)}
                        `
                      : html``
                  }`
                : html``}
            </div>
            <div class="card-actions">
              <mwc-button @click=${this._save} ?disabled=${!canSave}> Save </mwc-button>
            </div>
          </ha-card>
        </div>
      </hass-tabs-subpage>
    `;
  }

  private _onDynaliteTableEvent(_ev: CustomEvent) {
    this.hasElementChanged = true;
    this.requestUpdate();
  }

  private _save() {
    // fill complete and send update signal
    if (this.result.name) this.dynalite.config.name = this.result.name;
    else delete this.dynalite.config.name;
    this.dynalite.config.autodiscover = this.result.autodiscover;
    this.dynalite.config.default!.fade = this.result.fade;
    this.dynalite.config.active = this.result.active;
    if (this.result.overridePresets)
      this.dynalite.config.preset = JSON.parse(JSON.stringify(this._presets));
    else delete this.dynalite.config.preset;
    const templates: DynaliteTemplateData = { room: {}, time_cover: {} };
    enumeratedTemplates.forEach(([template, param]) => {
      if (this.result[param] !== "") templates[template][param] = this.result[param];
    });
    if (!this.result.tiltEnabled) templates.time_cover!.tilt = "0";
    this.dynalite.config.template = templates;
    this.hasElementChanged = false;
    fireEvent(this, EVENT_CONFIG_CHANGED, { value: true });
    this.requestUpdate();
  }

  private _handleChangeHost(ev) {
    console.dir(ev);
    ev.preventDefault();
    showDynaliteSelectGatewayDialog(this, {
      hass: this.hass,
      dynalite: this.dynalite,
      onSave: this._hostChanged.bind(this),
    });
  }

  private _hostChanged(entry_id: string): void {
    console.error("selected %s", entry_id);
    this.dynalite.entry_id = entry_id;
    fireEvent(this, EVENT_CONFIG_CHANGED, { value: false });
    navigate(dynaliteRoute(ROUTE_AREAS));
  }

  protected result = {
    name: "",
    autodiscover: false,
    fade: "",
    active: "off",
    overridePresets: false,
    overrideTemplates: false,
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
    name: DynaliteTextInput(CONF_NAME)
      .heading("System Name")
      .desc("User-defined name for this Dynalite system"),
    autodiscover: DynaliteBooleanInput(CONF_AUTODISCOVER)
      .heading("Auto Discover")
      .desc("Discover devices dynamically (useful for initial setup)"),
    fade: DynaliteFadeInput(CONF_FADE)
      .heading("Fade Time")
      .desc("Default fade for device actions (seconds)"),
    active: DynaliteSelectInput(CONF_ACTIVE)
      .heading("Active Mode")
      .desc("Actively poll system - may increase load")
      .selection([
        [CONF_ACTIVE_OFF, "Not Active (default)"],
        [CONF_ACTIVE_INIT, "Initial Init"],
        [CONF_ACTIVE_ON, "Always Active"],
      ]),
    class: DynaliteSelectInput(CONF_CLASS).heading("Type").desc("Default type for new blinds"),
    duration: DynaliteDurationInput(CONF_DURATION)
      .heading("Default Open/Close Duration")
      .desc("Time in seconds to open a blind")
      .required(),
    tiltEnabled: DynaliteBooleanInput(CONF_TILT_ENABLED)
      .heading("Enable Tilt")
      .desc("Enable tilt by default in blinds"),
    tilt: DynaliteDurationInput(CONF_TILT)
      .heading("Default Tilt Duration")
      .desc("Time in seconds to open the tilt")
      .required(),
    overridePresets: DynaliteBooleanInput(CONF_OVERRIDE_PRESETS)
      .heading("Override Default Presets")
      .desc("Not recommended"),
    overrideTemplates: DynaliteBooleanInput(CONF_OVERRIDE_TEMPLATES)
      .heading("Configure Behaviors")
      .desc("Not recommended"),
    room_on: DynaliteIdInput(CONF_ROOM_ON, CONF_PRESET)
      .heading("Turn On")
      .desc("Preset that turns an area on"),
    room_off: DynaliteIdInput(CONF_ROOM_OFF, CONF_PRESET)
      .heading("Turn Off")
      .desc("Preset that turns an area off"),
    open: DynaliteIdInput(CONF_OPEN, CONF_PRESET).heading("Open").desc("Preset to open a blind"),
    close: DynaliteIdInput(CONF_CLOSE, CONF_PRESET)
      .heading("Close")
      .desc("Preset to close a blind"),
    stop: DynaliteIdInput(CONF_STOP, CONF_PRESET).heading("Open").desc("Preset to open a blind"),
    channel_cover: DynaliteIdInput(CONF_CHANNEL_COVER, CONF_CHANNEL)
      .heading("Controlling channel")
      .desc("Channel number to control a blind"),
  };

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        p {
          margin-top: 0;
          margin-bottom: 0;
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
