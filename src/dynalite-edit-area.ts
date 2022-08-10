import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import {
  Dynalite,
  DynaliteAreaData,
  DynaliteChannelData,
  dynaliteCopy,
  DynaliteDefaultTemplates,
  DynalitePresetData,
  panelTabs,
} from "./common";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-button-menu";
import "../homeassistant-frontend/src/components/ha-icon-button";
import "../homeassistant-frontend/src/components/ha-svg-icon";
import "./dynalite-input";
import "@material/mwc-button/mwc-button";
import "@material/mwc-list";
import { DynaliteInput } from "./dynalite-input";
import "./dynalite-preset-table";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import "./dynalite-channel-table";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { mdiDelete, mdiDotsVertical } from "@mdi/js";
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

interface DynaliteEditAreaInputs {
  number: string;
  name: string;
  template: string;
  class: string;
  duration: string;
  tiltEnabled: boolean;
  tilt: string;
  fade: string;
  nodefault: boolean;
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
      if (this.areaNumber && this.areaNumber in (this.dynalite.config.area || {})) {
        this._isNew = false;
        const areaData: DynaliteAreaData = this.dynalite.config.area![this.areaNumber];
        this.result = {
          number: this.areaNumber || "",
          name: areaData.name || "",
          template: areaData.template || "",
          class: areaData.class || DynaliteDefaultTemplates.time_cover?.class!,
          duration: areaData.duration || "",
          tiltEnabled: !(
            areaData.tilt == "0" ||
            (!("tilt" in areaData) && this.dynalite.config.template?.time_cover?.tilt == "0")
          ),
          tilt: areaData.tilt || DynaliteDefaultTemplates.time_cover?.tilt!,
          fade: areaData.fade || "",
          nodefault: areaData.nodefault || false,
        };
        this._channels = JSON.parse(JSON.stringify(areaData.channel || {}));
        this._presets = JSON.parse(JSON.stringify(areaData.preset || {}));
        this.disabled = ["number"];
      } else {
        this._isNew = true;
        this.excluded = { number: Object.keys(this.dynalite.config?.area!) };
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
      this.hasChanged &&
      this._inputElements?.length &&
      Array.from(this._inputElements).every((elem) => elem.isValid());
    console.log("canSave=%s", canSave);

    return html`
      <hass-tabs-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .tabs=${panelTabs}
        .route=${this.route}
        searchLabel="abcde1"
        )}
        clickable
      >
        <ha-button-menu
          corner="BOTTOM_START"
          slot="toolbar-icon"
          @action=${this._deleteArea}
          activatable
        >
          <ha-icon-button
            slot="trigger"
            label="Additional Actions"
            .path=${mdiDotsVertical}
          ></ha-icon-button>
          <mwc-list-item graphic="icon" class="warning">
            Delete Area
            <ha-svg-icon slot="graphic" .path=${mdiDelete} class="warning"> </ha-svg-icon>
          </mwc-list-item>
        </ha-button-menu>
        <div class="content">
          <ha-card outlined>
            <div class="card-content">
              <h1>${this._isNew ? html`New Area` : html`Edit Area ${this.areaNumber}`}</h1>
              <h2>Area Settings</h2>
              ${this.genInputElement("number")} ${this.genInputElement("name")}
              ${this.genInputElement("template")}
              ${this.result.template == "time_cover"
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
                defaultFade=${this.result.fade != ""
                  ? this.result.fade
                  : this.dynalite.config.default!.fade!}
                @dynalite-table=${(_ev) => {
                  console.log("global settings - dynalite-table event");
                  this.hasChanged = true;
                }}
              ></dynalite-preset-table>
              <h2>Area Specific Channels</h2>
              <dynalite-channel-table
                .hass=${this.hass}
                .narrow=${this.narrow}
                .route=${this.route}
                .channels=${this._channels || {}}
                defaultFade=${this.result.fade != ""
                  ? this.result.fade
                  : this.dynalite.config.default!.fade!}
                @dynalite-table=${(_ev) => {
                  console.log("global settings - dynalite-table event");
                  this.hasChanged = true;
                }}
              ></dynalite-channel-table>
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
    const res: DynaliteAreaData = {
      name: this.result.name,
      nodefault: this.result.nodefault,
      channel: dynaliteCopy(this._channels),
      preset: dynaliteCopy(this._presets),
    };
    ["name", "template", "fade"].forEach((param) => {
      if (this.result[param]) res[param] = this.result[param];
    });
    console.dir(res);
    this.dynalite.config.area![this.result.number] = res;
    this.hasChanged = false;
    fireEvent(this, "value-changed");
  }

  private _deleteArea(ev) {
    console.log("delete area %s", this.areaNumber);
    console.dir(ev);
    delete this.dynalite.config.area![this.areaNumber];
    fireEvent(this, "value-changed");
    navigate("/dynalite/areas");
  }

  protected result = {
    number: "",
    name: "",
    template: "",
    class: "",
    duration: "",
    tiltEnabled: false,
    tilt: "",
    fade: "",
    nodefault: false,
  };

  protected settings = {
    number: DynaliteIdInput("number", "area")
      .heading("Number")
      .desc("Dynalite area number (1-255)")
      .required(),
    name: DynaliteTextInput("name")
      .heading("Area Name")
      .desc("Usually a room of a function")
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
