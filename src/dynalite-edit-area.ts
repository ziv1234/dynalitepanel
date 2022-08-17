import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-button-menu";
import "../homeassistant-frontend/src/components/ha-icon-button";
import "../homeassistant-frontend/src/components/ha-svg-icon";
import "@material/mwc-button/mwc-button";
import "@material/mwc-list";
import {
  Dynalite,
  DynaliteAreaData,
  DynaliteChannelData,
  dynaliteCopy,
  DynaliteDefaultTemplates,
  DynalitePresetData,
  enumeratedTemplates,
  panelTabs,
} from "./common";
import "./dynalite-input";
import type { DynaliteInput } from "./dynalite-input";
import "./dynalite-preset-table";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import "./dynalite-channel-table";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import {
  DynaliteBooleanInput,
  DynaliteDurationInput,
  DynaliteFadeInput,
  DynaliteIdInput,
  DynaliteSelectInput,
  DynaliteTextInput,
} from "./dynalite-input-settings";
import { navigate } from "../homeassistant-frontend/src/common/navigate";
import { DynaliteInputElement } from "./dynalite-input-element";
import "./dynalite-action-button";
import {
  CONF_ADVANCED,
  CONF_AREA,
  CONF_CHANNEL,
  CONF_CHANNEL_COVER,
  CONF_CLASS,
  CONF_CLOSE,
  CONF_DURATION,
  CONF_DYNET_ID,
  CONF_FADE,
  CONF_NAME,
  CONF_NODEFAULT,
  CONF_OPEN,
  CONF_PRESET,
  CONF_ROOM,
  CONF_ROOM_OFF,
  CONF_ROOM_ON,
  CONF_STOP,
  CONF_TEMPLATE,
  CONF_TILT,
  CONF_TILT_ENABLED,
  CONF_TIME_COVER,
  EVENT_CONFIG_CHANGED,
  TEMPLATE_COVER,
  TEMPLATE_MANUAL,
  TEMPLATE_ROOM,
} from "./const";

interface DynaliteEditAreaInputs {
  dynetId: string;
  name: string;
  template: string;
  class: string;
  duration: string;
  tiltEnabled: boolean;
  tilt: string;
  fade: string;
  nodefault: boolean;
  advanced: boolean;
  room_on: string;
  room_off: string;
  open: string;
  close: string;
  stop: string;
  channel_cover: string;
}

@customElement("dynalite-edit-area")
export class DynaliteEditArea extends DynaliteInputElement<DynaliteEditAreaInputs> {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public dynalite!: Dynalite;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  @property({ attribute: false }) public areaNumber!: string;

  @state() private _hasInitialized = false;

  @state() private _isNew = false;

  @state() private _channels: { [key: string]: DynaliteChannelData } = {};

  @state() private _presets: { [key: string]: DynalitePresetData } = {};

  @queryAll("dynalite-input") _inputElements?: DynaliteInput[];

  protected willUpdate(_changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(_changedProperties);
    if (!this.dynalite) return;
    if (!this._hasInitialized) {
      this.helpers = { fade: `Default: ${this.dynalite.config.default?.fade}` };
      enumeratedTemplates.forEach(([template, param]) => {
        const defValue =
          this.dynalite.config.template![template][param] ||
          DynaliteDefaultTemplates[template][param];
        this.helpers![param] = `Default: ${defValue}`;
      });
      this.settings.class.selection(this.dynalite.classSelection);
      if (this.areaNumber && this.areaNumber in (this.dynalite.config.area || {})) {
        this._isNew = false;
        this.disabled = [CONF_DYNET_ID];
      } else {
        this._isNew = true;
        this.excluded = { dynetId: Object.keys(this.dynalite.config!.area!) };
      }
      const areaData: DynaliteAreaData = this.dynalite.config.area![this.areaNumber] || {};
      const calcTilt = parseFloat(
        CONF_TILT in areaData
          ? areaData.tilt!
          : CONF_TILT in this.dynalite.config.template!.time_cover!
          ? this.dynalite.config.template!.time_cover.tilt!
          : DynaliteDefaultTemplates.time_cover!.tilt!
      );
      this.result = {
        dynetId: this.areaNumber || "",
        name: areaData.name || "",
        template: areaData.template || "",
        class: areaData.class || DynaliteDefaultTemplates.time_cover!.class!,
        duration: areaData.duration || "",
        tiltEnabled: calcTilt !== 0,
        tilt: calcTilt.toString() || DynaliteDefaultTemplates.time_cover!.tilt!,
        fade: areaData.fade || "",
        nodefault: areaData.nodefault || false,
        advanced: enumeratedTemplates.some(([_template, param]) => areaData[param]),
        room_on: areaData.room_on || "",
        room_off: areaData.room_off || "",
        open: areaData.open || "",
        close: areaData.close || "",
        stop: areaData.stop || "",
        channel_cover: areaData.channel_cover || "",
      };
      this._channels = JSON.parse(JSON.stringify(areaData.channel || {}));
      this._presets = JSON.parse(JSON.stringify(areaData.preset || {}));
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
      Array.from(this._inputElements).every((elem) => elem.isValid());

    return html`
      <hass-tabs-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .tabs=${panelTabs}
        .route=${this.route}
        searchLabel="abcde1"
        )}
        clickable
        >${this._isNew
          ? html``
          : html` <span slot="toolbar-icon">
              <dynalite-action-button
                @dynalite-action-button=${this._deleteArea}
                param=${this.areaNumber}
                label="Area"
              ></dynalite-action-button>
            </span>`}
        <div class="content">
          <ha-card outlined>
            <div class="card-content">
              <h1>${this._isNew ? html`New Area` : html`Edit Area ${this.areaNumber}`}</h1>
              <h2>Area Settings</h2>
              ${this.genInputElement(CONF_DYNET_ID)} ${this.genInputElement(CONF_NAME)}
              ${this.genInputElement(CONF_TEMPLATE)}
              ${this.result.template === CONF_TIME_COVER
                ? html`
                    ${this.genInputElement(CONF_CLASS)} ${this.genInputElement(CONF_DURATION)}
                    ${this.genInputElement(CONF_TILT_ENABLED)}
                    ${this.result.tiltEnabled ? this.genInputElement(CONF_TILT) : html``}
                  `
                : html``}
              ${this.genInputElement(CONF_FADE)} ${this.genInputElement(CONF_NODEFAULT)}
              <h2>Area Specific Presets</h2>
              <dynalite-preset-table
                .hass=${this.hass}
                .narrow=${this.narrow}
                .route=${this.route}
                .presets=${this._presets || {}}
                defaultFade=${this.result.fade !== ""
                  ? this.result.fade
                  : this.dynalite.config.default!.fade!}
                @dynalite-table=${this._onDynaliteTableEvent}
              ></dynalite-preset-table>
              <h2>Area Specific Channels</h2>
              <dynalite-channel-table
                .hass=${this.hass}
                .narrow=${this.narrow}
                .route=${this.route}
                .channels=${this._channels || {}}
                defaultFade=${this.result.fade !== ""
                  ? this.result.fade
                  : this.dynalite.config.default!.fade!}
                @dynalite-table=${this._onDynaliteTableEvent}
              ></dynalite-channel-table>
              ${this.result.template
                ? html`<h2>Area Specific Behavior</h2>
                    ${this.genInputElement(CONF_ADVANCED)}
                    ${this.result.advanced
                      ? this.result.template === CONF_ROOM
                        ? html`${this.genInputElement(CONF_ROOM_ON)}
                          ${this.genInputElement(CONF_ROOM_OFF)}`
                        : this.result.template === CONF_TIME_COVER
                        ? html`${this.genInputElement(CONF_OPEN)}
                          ${this.genInputElement(CONF_CLOSE)} ${this.genInputElement(CONF_STOP)}
                          ${this.genInputElement(CONF_CHANNEL_COVER)}`
                        : html``
                      : html``}`
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
    const res: DynaliteAreaData = {
      channel: dynaliteCopy(this._channels),
      preset: dynaliteCopy(this._presets),
    };
    [CONF_NAME, CONF_TEMPLATE, CONF_FADE, CONF_NODEFAULT].forEach((param) => {
      if (this.result[param]) res[param] = this.result[param];
    });
    if (this.result.template && this.result.advanced) {
      if (this.result.template === CONF_ROOM) {
        [CONF_ROOM_ON, CONF_ROOM_OFF].forEach((param) => {
          if (this.result[param]) res[param] = this.result[param];
        });
      }
      if (this.result.template === CONF_TIME_COVER) {
        [
          CONF_OPEN,
          CONF_CLOSE,
          CONF_STOP,
          CONF_CHANNEL_COVER,
          CONF_CLASS,
          CONF_DURATION,
          CONF_TILT,
        ].forEach((param) => {
          if (this.result[param]) res[param] = this.result[param];
        });
        if (!this.result.tiltEnabled) res.tilt = "0";
      }
    }
    this.dynalite.config.area![this.result.dynetId] = res;
    this.hasElementChanged = false;
    fireEvent(this, EVENT_CONFIG_CHANGED);
  }

  private _deleteArea(ev) {
    const areaNumber = ev.detail;
    delete this.dynalite.config.area![areaNumber];
    fireEvent(this, EVENT_CONFIG_CHANGED);
    navigate("/dynalite/areas");
  }

  protected result: DynaliteEditAreaInputs = {
    dynetId: "",
    name: "",
    template: "",
    class: "",
    duration: "",
    tiltEnabled: false,
    tilt: "",
    fade: "",
    nodefault: false,
    advanced: false,
    room_on: "",
    room_off: "",
    open: "",
    close: "",
    stop: "",
    channel_cover: "",
  };

  protected settings = {
    dynetId: DynaliteIdInput(CONF_DYNET_ID, CONF_AREA)
      .heading("Number")
      .desc("Dynalite area number (1-255)")
      .required(),
    name: DynaliteTextInput(CONF_NAME)
      .heading("Area Name")
      .desc("Usually a room or a function")
      .required(),
    template: DynaliteSelectInput(CONF_TEMPLATE)
      .heading("Area Behavior")
      .desc("Configure specific area behaviors")
      .selection([
        [CONF_ROOM, TEMPLATE_ROOM],
        [CONF_TIME_COVER, TEMPLATE_COVER],
        ["", TEMPLATE_MANUAL],
      ]),
    class: DynaliteSelectInput(CONF_CLASS).heading("Type").desc("Blind type"),
    duration: DynaliteDurationInput(CONF_DURATION)
      .heading("Open/Close Duration")
      .desc("Time in seconds to open this blind"),
    tiltEnabled: DynaliteBooleanInput(CONF_TILT_ENABLED)
      .heading("Enable Tilt")
      .desc("Enable tilt for this blind"),
    tilt: DynaliteDurationInput(CONF_TILT)
      .heading("Tilt Duration")
      .desc("Time in seconds to open this tilt"),
    fade: DynaliteFadeInput(CONF_FADE)
      .heading("Fade Time")
      .desc("Default fade for this area (seconds)"),
    nodefault: DynaliteBooleanInput(CONF_NODEFAULT)
      .heading("Ignore Default Presets")
      .desc("Do not use the globally configured presets"),
    advanced: DynaliteBooleanInput(CONF_ADVANCED)
      .heading("Area-specific Behaviors")
      .desc("Advanced only"),
    room_on: DynaliteIdInput(CONF_ROOM_ON, CONF_PRESET)
      .heading("Turn On")
      .desc("Preset that turns this area on"),
    room_off: DynaliteIdInput(CONF_ROOM_OFF, CONF_PRESET)
      .heading("Turn Off")
      .desc("Preset that turns this area off"),
    open: DynaliteIdInput(CONF_OPEN, CONF_PRESET).heading("Open").desc("Preset to open this blind"),
    close: DynaliteIdInput(CONF_CLOSE, CONF_PRESET)
      .heading("Close")
      .desc("Preset to close this blind"),
    stop: DynaliteIdInput(CONF_STOP, CONF_PRESET).heading("Open").desc("Preset to open this blind"),
    channel_cover: DynaliteIdInput(CONF_CHANNEL_COVER, CONF_CHANNEL)
      .heading("Controlling channel")
      .desc("Channel number to control this blind"),
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
    "dynalite-edit-area": DynaliteEditArea;
  }
}
