import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import {
  Dynalite,
  DynaliteAreaData,
  DynaliteChannelData,
  dynaliteCopy,
  DynalitePresetData,
  panelTabs,
  underscore,
} from "./common";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-button-menu";
import "../homeassistant-frontend/src/components/ha-icon-button";
import "../homeassistant-frontend/src/components/ha-svg-icon";
import "./dynalite-input";
import "@material/mwc-button/mwc-button";
import "@material/mwc-list";
import { DynaliteInput } from "./dynalite-input";
import { ifDefined } from "lit/directives/if-defined";
import "./dynalite-preset-table";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import "./dynalite-channel-table";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { mdiDelete, mdiDotsVertical } from "@mdi/js";
import {
  DynaliteBooleanInput,
  DynaliteFadeInput,
  DynaliteIdInput,
  DynaliteSelectInput,
  DynaliteTextInput,
} from "./dynalite-input-settings";

@customElement("dynalite-edit-area")
export class DynaliteEditArea extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public dynalite!: Dynalite;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  @property({ attribute: false }) public areaNumber!: string;

  @state() private _hasInitialized = false;

  @state() private _hasChanged = false;

  @state() private _isNew = false;

  @state() private _number = "";

  @state() private _name = "";

  @state() private _template = "";

  @state() private _fade = "";

  @state() private _fadeHelper?;

  @state() private _nodefault = false;

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
      if (this.areaNumber && this.areaNumber in (this.dynalite.config.area || {})) {
        const areaData: DynaliteAreaData = this.dynalite.config.area![this.areaNumber];
        this._name = areaData.name || "";
        this._template = areaData.template || "";
        this._fade = areaData.fade || "";
        this._fadeHelper = `Default: ${this.dynalite.config.default?.fade}`;
        this._nodefault = areaData.nodefault || false;
        this._channels = JSON.parse(JSON.stringify(areaData.channel || {}));
        this._presets = JSON.parse(JSON.stringify(areaData.preset || {}));
      }
      this._number = this.areaNumber || "";
      this._isNew = this._number == "";
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
      this._hasChanged &&
      this._inputElements?.length == 5 &&
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
          @action=${console.error}
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
              <dynalite-input
                .settings=${this._numberInput}
                .value=${this._number}
                ?disabled=${!this._isNew}
                .excluded=${this._isNew ? Object.keys(this.dynalite.config?.area || {}) : []}
                @dynalite-input=${this._handleChange}
              ></dynalite-input>
              <dynalite-input
                .settings=${this._nameInput}
                @dynalite-input=${this._handleChange}
                .value=${this._name}
              ></dynalite-input>
              <dynalite-input
                .settings=${this._templateInput}
                @dynalite-input=${this._handleChange}
                .value=${this._template || ""}
              ></dynalite-input>
              <dynalite-input
                .settings=${this._fadeInput}
                @dynalite-input=${this._handleChange}
                .value=${this._fade}
                helper=${ifDefined(this._fadeHelper)}
              ></dynalite-input>
              <dynalite-input
                .settings=${this._nodefaultInput}
                @dynalite-input=${this._handleChange}
                .value=${this._nodefault}
              ></dynalite-input>
              <h2>Area Specific Presets</h2>
              <dynalite-preset-table
                .hass=${this.hass}
                .narrow=${this.narrow}
                .route=${this.route}
                .presets=${this._presets || {}}
                defaultFade=${this._fade != "" ? this._fade : this.dynalite.config.default!.fade!}
                @dynalite-table=${(_ev) => {
                  console.log("global settings - dynalite-table event");
                  this._hasChanged = true;
                }}
              ></dynalite-preset-table>
              <h2>Area Specific Channels</h2>
              <dynalite-channel-table
                .hass=${this.hass}
                .narrow=${this.narrow}
                .route=${this.route}
                .channels=${this._channels || {}}
                defaultFade=${this._fade != "" ? this._fade : this.dynalite.config.default!.fade!}
                @dynalite-table=${(_ev) => {
                  console.log("global settings - dynalite-table event");
                  this._hasChanged = true;
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
      name: this._name,
      nodefault: this._nodefault,
      channel: dynaliteCopy(this._channels),
      preset: dynaliteCopy(this._presets),
    };
    ["name", "template", "fade"].forEach((param) => {
      if (this[underscore(param)]) res[param] = this[underscore(param)];
    });
    console.dir(res);
    this.dynalite.config.area![this._number] = res;
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

  _numberInput = DynaliteIdInput("number", "area")
    .heading("Number")
    .desc("Dynalite area number (1-255)")
    .required();

  _nameInput = DynaliteTextInput("name")
    .heading("Area Name")
    .desc("Usually a room of a function")
    .required();

  _templateInput = DynaliteSelectInput("template")
    .heading("Area Behavior")
    .desc("Configure specific area behaviors")
    .selection([
      ["room", "On/Off Switch"],
      ["time_cover", "Blind or Cover"],
      ["", "Manual Setup"],
    ]);

  _fadeInput = DynaliteFadeInput("fade")
    .heading("Fade Time")
    .desc("Default fade for area actions (seconds)");

  _nodefaultInput = DynaliteBooleanInput("nodefault")
    .heading("Ignore Default Presets")
    .desc("Do not use the globally configured presets");

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
