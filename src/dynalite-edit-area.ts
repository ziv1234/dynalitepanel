import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import { Dynalite, DynaliteChannelData, DynalitePresetData, panelTabs } from "./common";
import "../homeassistant-frontend/src/components/ha-card";
import "./dynalite-input";
import "@material/mwc-button/mwc-button";
import { DynaliteInput, DynaliteInputSettings } from "./dynalite-input";
import { ifDefined } from "lit/directives/if-defined";
import "./dynalite-preset-table";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";

@customElement("dynalite-edit-area")
export class DynaliteEditArea extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public dynalite!: Dynalite;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public areaNumber!: string;

  @state() private _hasInitialized = false;

  @state() private _hasChanged = false;

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
      this._name = this.dynalite.config.area[this.areaNumber]?.name || "";
      this._template = this.dynalite.config.area[this.areaNumber]?.template || "";
      this._fade = this.dynalite.config.area[this.areaNumber]?.fade || "";
      this._fadeHelper = `Default: ${this.dynalite.config.default?.fade}`;
      this._nodefault = this.dynalite.config.area[this.areaNumber]?.nodefault || false;
      this._channels = JSON.parse(
        JSON.stringify(this.dynalite.config.area[this.areaNumber]?.channel || {})
      );
      this._presets = JSON.parse(
        JSON.stringify(this.dynalite.config.area[this.areaNumber]?.preset || {})
      );
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
      this._inputElements?.length == 4 &&
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
                      defaultFade=${ifDefined(this.dynalite.config.default?.fade)}
                      @dynalite-table=${(_ev) => {
                        console.log("global settings - dynalite-table event");
                        this._hasChanged = true;
                      }}
                    ></dynalite-preset-table>
              </dynalite-preset-table>
            </div>
            <div class="card-actions">
              <mwc-button @click=${this._save} ?disabled=${!canSave}> Save </mwc-button>
            </div>
          </ha-card>
        </div>

        HELLO WORLD edit-area ${this.areaNumber}
      </hass-tabs-subpage>
    `;
  }

  private _save() {
    // fill complete and send update signal
    console.log("XXX save");
    // if (this._name) this.dynalite.config.name = this._name;
    // else delete this.dynalite.config.name;
    // this.dynalite.config.autodiscover = this._autodiscover;
    // this.dynalite.config.default!.fade = this._fade;
    // this.dynalite.config.active = this._active;
    // if (this._overridePresets)
    //   this.dynalite.config.preset = JSON.parse(JSON.stringify(this._presets));
    // else delete this.dynalite.config.preset;
    // console.dir(this.dynalite.config);
    // console.log("XXX dispatching");
    // this._hasChanged = false;
    // fireEvent(this, "value-changed");
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
    .heading("Area Name")
    .desc("Usually a room of a function")
    .required();

  _templateInput = new DynaliteInputSettings("template")
    .heading("Area Behavior")
    .desc("Configure specific area behaviors")
    .type("select")
    .selection([
      ["room", "On/Off Switch"],
      ["time_cover", "Blind or Cover"],
      ["", "Manual Setup"],
    ]);

  _fadeInput = new DynaliteInputSettings("fade")
    .heading("Fade Time")
    .desc("Default fade for area actions (seconds)")
    .min(0)
    .step(0.01)
    .validationMessage("Invalid Fade");

  _nodefaultInput = new DynaliteInputSettings("nodefault")
    .heading("Ignore Default Presets")
    .desc("Do not use the globally configured presets")
    .type("boolean");

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
