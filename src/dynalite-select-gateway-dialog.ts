import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import type { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { CONF_HOST, CONF_PORT, CONF_NAME, EVENT_DIALOG_CLOSED } from "./const";
import type { DynaliteSelectGatewayDialogParams } from "./show-dialog-select-gateway";
import "@material/mwc-button/mwc-button";
import "../homeassistant-frontend/src/components/ha-dialog";
import "../homeassistant-frontend/src/components/ha-header-bar";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-formfield";
import "../homeassistant-frontend/src/components/ha-radio";

@customElement("dynalite-select-gateway-dialog")
export class DynaliteSelectGatewayDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  @state() private _params?: DynaliteSelectGatewayDialogParams;

  private _result = "";

  private _hasSelectionChanged = false;

  public async showDialog(params: DynaliteSelectGatewayDialogParams): Promise<void> {
    this.hass = params.hass;
    this._params = params;
    this._result = params.dynalite.entry_id;
    this._hasSelectionChanged = false;
  }

  protected render(): TemplateResult | void {
    if (!this._params) return html``;
    return html`
      <ha-dialog open .heading=${"abcde"} @closed=${this._close}>
        <div slot="heading">
          <ha-header-bar>
            <span slot="title"> Select Dynalite Gateway </span>
          </ha-header-bar>
        </div>
        <div class="wrapper">
          <ha-card outlined>
            <div class="content">
              <label>
                ${Object.entries(this._params.dynalite.completeConfig).map(
                  ([entry_id, data]) => html`<ha-formfield
                      .label=${`${data[CONF_NAME] || this._params?.dynalite.default.DEFAULT_NAME}
                    - Host ${data[CONF_HOST]} Port
                    ${data[CONF_PORT] || this._params?.dynalite.default.DEFAULT_PORT}`}
                      ><ha-radio
                        name="myGroup"
                        .value=${entry_id}
                        ?checked=${entry_id === this._params?.dynalite.entry_id}
                        @change=${this._handleChange}
                      ></ha-radio></ha-formfield
                    ><br />`
                )}
              </label>
            </div>
          </ha-card>
        </div>
        <mwc-button
          slot="primaryAction"
          @click=${this._save}
          ?disabled=${!this._hasSelectionChanged}
          >Select</mwc-button
        >
        <mwc-button slot="secondaryAction" @click=${this._close}>Cancel</mwc-button>
      </ha-dialog>
    `;
  }

  private _handleChange(ev) {
    this._result = ev.currentTarget.value;
    this._hasSelectionChanged = true;
    this.requestUpdate();
  }

  private _close(): void {
    this._params = undefined;
    fireEvent(this, EVENT_DIALOG_CLOSED, { dialog: this.localName });
  }

  private _save(): void {
    this._params?.onSave(this._result);
    this._close();
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        ha-dialog {
          --dialog-content-position: static;
          --dialog-content-padding: 0;
          --dialog-z-index: 6;
        }
        .content {
          display: block;
          padding: 20px 24px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-select-gateway-dialog": DynaliteSelectGatewayDialog;
  }
}
