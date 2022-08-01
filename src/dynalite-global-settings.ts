import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-settings-row";
import "../homeassistant-frontend/src/components/ha-switch";
import "../homeassistant-frontend/src/components/ha-textfield";
import "../homeassistant-frontend/src/components/ha-select";
import { Dynalite, panelTabs } from "./common";
import "@material/mwc-button/mwc-button";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { HaSwitch } from "../homeassistant-frontend/src/components/ha-switch";
import { mdiPlus } from "@mdi/js";
import "./dynalite-preset-table";

@customElement("dynalite-global-settings")
export class DynaliteGlobalSettings extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public dynalite!: Dynalite;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @state() private _name;

  @state() private _autodiscover;

  @state() private _fade;

  @state() private _active;

  public firstUpdated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.firstUpdated(changedProperties);
    console.log("XXX conn");
    console.dir(this.dynalite);
    this._name = this.dynalite.config.name;
    this._autodiscover = this.dynalite.config.autodiscover;
    this._fade = this.dynalite.config.default?.fade;
    this._active = this.dynalite.config.active;
  }

  protected render(): TemplateResult | void {
    console.log("XXX global settings render");
    console.dir(this.hass);
    if (!this.hass || !this.dynalite) {
      return html``;
    }
    console.log("XXX render global settings");
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
              <ha-settings-row>
                <span slot="heading" data-for="name"> System Name </span>
                <span slot="description" data-for="name">
                  User-defined name for this Dynalite system
                </span>
                <ha-textfield
                  name="name"
                  label="Name"
                  .value=${this._name || this.dynalite.default.DEFAULT_NAME}
                  @change=${this._handleChange}
                ></ha-textfield> </ha-settings-row
              ><ha-settings-row>
                <span slot="heading" data-for="autodiscover"> Auto Discover </span>
                <span slot="description" data-for="autodiscover">
                  Discover devices dynamically (useful for initial setup)
                </span>
                <ha-switch
                  @change=${this._handleBoolChange}
                  .checked=${this._autodiscover}
                  .preference=${"autodiscover"}
                >
                </ha-switch>
              </ha-settings-row>
              <ha-settings-row>
                <span slot="heading" data-for="fade"> Fade Time </span>
                <span slot="description" data-for="fade">
                  Default fade for device actions (seconds)
                </span>
                <ha-textfield
                  name="fade"
                  label="Fade"
                  .value=${this._fade}
                  min="0"
                  step="0.1"
                  autoValidate
                  type="number"
                  @change=${this._handleChange}
                  validationMessage="Invalid Fade"
                ></ha-textfield>
              </ha-settings-row>
              <ha-settings-row>
                <span slot="heading" data-for="active"> Active Mode </span>
                <span slot="description" data-for="fade">
                  Actively poll system - may increase load
                </span>
                <ha-select
                  label="Active"
                  name="active"
                  fixedMenuPosition
                  naturalMenuWidth
                  .value=${this._active}
                  @change=${this._handleChange}
                >
                  <mwc-list-item value="off">Not Active (default)</mwc-list-item>
                  <mwc-list-item value="init">Initial Init</mwc-list-item>
                  <mwc-list-item value="on">Always Active</mwc-list-item>
                </ha-select>
              </ha-settings-row>
              <h2>Default Presets</h2>
              <dynalite-preset-table
                .hass=${this.hass}
                .narrow=${this.narrow}
                .route=${this.route}
                .presets=${this.dynalite.config.preset || {}}
                >
              </dynalite-preset-table>
              </dynalite-preset-table>
            </div>
            <div class="card-actions">
              <mwc-button @click=${this._save}> Save </mwc-button>
            </div>
          </ha-card>
          <div class="footer">Learn more</div>
        </div>
      </hass-tabs-subpage>
    `;
  }

  private _save() {
    // fill complete and send update signal
    console.log("XXX save");
    if (this._name) {
      this.dynalite.config.name = this._name;
    } else {
      delete this.dynalite.config.name;
    }
    this.dynalite.config.autodiscover = this._autodiscover;
    this.dynalite.config.default!.fade = this._fade;
    this.dynalite.config.active = this._active;
    console.dir(this.dynalite.config);
    console.log("XXX dispatching");
    fireEvent(this, "value-changed");
  }

  private _handleChange(ev) {
    const target = ev.currentTarget;
    console.log("XXX TBD handle change name=%s value=%s", target.name, target.value);
    console.dir(ev);
    switch (target.name) {
      case "name": {
        console.log("updating name");
        this._name = target.value;
        break;
      }
      case "fade": {
        console.log("updating fade");
        this._fade = target.value;
        break;
      }
      default: {
        // exit without sending update signal
        console.log("invalid update - existing function");
        return;
      }
    }
    return;
  }

  private _handleBoolChange(ev) {
    const target = ev.currentTarget as HaSwitch;
    const name = (target as any).preference;
    console.log("XXX TBD handle change name=%s checked=%s", name, target.checked);
    console.dir(ev);
    switch (name) {
      case "autodiscover": {
        console.log("updating autodiscover");
        this._autodiscover = target.checked;
        break;
      }
      default: {
        // exit without sending update signal
        console.log("invalid update - existing function");
      }
    }
  }

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
