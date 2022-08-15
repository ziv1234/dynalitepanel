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
    console.log("XXX conn");
    console.dir(this.dynalite);
    if (!this.dynalite) return;
    if (!this._hasInitialized) {
      console.log("initizlizing global settings");
      this.helpers = { fade: `Default: ${this.dynalite.config.default?.fade}` };
      Object.entries(DynaliteDefaultTemplates).forEach(([_template, conf]) =>
        Object.keys(conf).forEach((param) => {
          const defValue =
            this.dynalite.config.template?.[param] || DynaliteDefaultTemplates[_template][param];
          this.helpers![param] = `Default: ${defValue}`;
        })
      );
      if (this.areaNumber && this.areaNumber in (this.dynalite.config.area || {})) {
        this._isNew = false;
        const areaData: DynaliteAreaData = this.dynalite.config.area![this.areaNumber];
        this.result = {
          dynetId: this.areaNumber || "",
          name: areaData.name || "",
          template: areaData.template || "",
          class: areaData.class || DynaliteDefaultTemplates.time_cover!.class!,
          duration: areaData.duration || "",
          tiltEnabled: !(
            areaData.tilt === "0" ||
            (!("tilt" in areaData) && this.dynalite.config.template?.time_cover?.tilt === "0")
          ),
          tilt: areaData.tilt || DynaliteDefaultTemplates.time_cover!.tilt!,
          fade: areaData.fade || "",
          nodefault: areaData.nodefault || false,
          advanced: Object.entries(DynaliteDefaultTemplates).some(([_template, conf]) =>
            Object.keys(conf).some((param) => areaData[param])
          ),
          room_on: areaData.room_on || "",
          room_off: areaData.room_off || "",
          open: areaData.open || "",
          close: areaData.close || "",
          stop: areaData.stop || "",
          channel_cover: areaData.channel_cover || "",
        };
        this._channels = JSON.parse(JSON.stringify(areaData.channel || {}));
        this._presets = JSON.parse(JSON.stringify(areaData.preset || {}));
        this.disabled = ["dynetId"];
      } else {
        this._isNew = true;
        this.excluded = { dynetId: Object.keys(this.dynalite.config!.area!) };
      }
      this._hasInitialized = true;
    }
  }

  protected render(): TemplateResult | void {
    console.log("XXX edit area render");
    console.dir(this.hass);
    if (!this.hass || !this.dynalite) {
      return html``;
    }
    console.log("XXX render edit area");
    const canSave =
      this.hasElementChanged &&
      this._inputElements?.length &&
      Array.from(this._inputElements).every((elem) => elem.isValid());
    console.log("canSave=%s", canSave);
    console.dir(this._inputElements);
    if (this._inputElements)
      console.dir(Array.from(this._inputElements).map((elem) => elem.isValid()));

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
              ${this.genInputElement("dynetId")} ${this.genInputElement("name")}
              ${this.genInputElement("template")}
              ${this.result.template === "time_cover"
                ? html`
                    ${this.genInputElement("class")} ${this.genInputElement("duration")}
                    ${this.genInputElement("tiltEnabled")}
                    ${this.result.tiltEnabled ? this.genInputElement("tilt") : html``}
                  `
                : html``}
              ${this.genInputElement("fade")} ${this.genInputElement("nodefault")}
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
                    ${this.genInputElement("advanced")}
                    ${this.result.advanced
                      ? this.result.template === "room"
                        ? html`${this.genInputElement("room_on")}
                          ${this.genInputElement("room_off")}`
                        : this.result.template === "time_cover"
                        ? html`${this.genInputElement("open")} ${this.genInputElement("close")}
                          ${this.genInputElement("stop")} ${this.genInputElement("channel_cover")}`
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
    console.log("XXX save");
    const res: DynaliteAreaData = {
      channel: dynaliteCopy(this._channels),
      preset: dynaliteCopy(this._presets),
    };
    ["name", "template", "fade", "nodefault"].forEach((param) => {
      if (this.result[param]) res[param] = this.result[param];
    });
    if (this.result.template && this.result.advanced) {
      if (this.result.template === "room") {
        ["room_on", "room_off"].forEach((param) => {
          if (this.result[param]) res[param] = this.result[param];
        });
      }
      if (this.result.template === "room") {
        ["open", "close", "stop", "channel_cover", "class", "duration", "tilt"].forEach((param) => {
          if (this.result[param]) res[param] = this.result[param];
        });
        if (!this.result.tiltEnabled) res.tilt = "0";
      }
    }
    console.dir(res);
    this.dynalite.config.area![this.result.dynetId] = res;
    this.hasElementChanged = false;
    fireEvent(this, "value-changed");
  }

  private _deleteArea(ev) {
    const areaNumber = ev.detail;
    console.log("delete area %s", areaNumber);
    delete this.dynalite.config.area![areaNumber];
    fireEvent(this, "value-changed");
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
    dynetId: DynaliteIdInput("dynetId", "area")
      .heading("Number")
      .desc("Dynalite area number (1-255)")
      .required(),
    name: DynaliteTextInput("name")
      .heading("Area Name")
      .desc("Usually a room or a function")
      .required(),
    template: DynaliteSelectInput("template")
      .heading("Area Behavior")
      .desc("Configure specific area behaviors")
      .selection([
        ["room", "On/Off Switch"],
        ["time_cover", "Blind or Cover"],
        ["", "Manual Setup"],
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
      .heading("Open/Close Duration")
      .desc("Time in seconds to open this blind"),
    tiltEnabled: DynaliteBooleanInput("tiltEnabled")
      .heading("Enable Tilt")
      .desc("Enable tilt for this blind"),
    tilt: DynaliteDurationInput("tilt")
      .heading("Tilt Duration")
      .desc("Time in seconds to open this tilt"),
    fade: DynaliteFadeInput("fade")
      .heading("Fade Time")
      .desc("Default fade for this area (seconds)"),
    nodefault: DynaliteBooleanInput("nodefault")
      .heading("Ignore Default Presets")
      .desc("Do not use the globally configured presets"),
    advanced: DynaliteBooleanInput("advanced")
      .heading("Area-specific Behaviors")
      .desc("Advanced only"),
    room_on: DynaliteIdInput("room_on", "preset")
      .heading("Turn On")
      .desc("Preset that turns this area on"),
    room_off: DynaliteIdInput("room_off", "preset")
      .heading("Turn Off")
      .desc("Preset that turns this area off"),
    open: DynaliteIdInput("open", "preset").heading("Open").desc("Preset to open this blind"),
    close: DynaliteIdInput("close", "preset").heading("Close").desc("Preset to close this blind"),
    stop: DynaliteIdInput("stop", "preset").heading("Open").desc("Preset to open this blind"),
    channel_cover: DynaliteIdInput("channel_cover", "channel")
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
