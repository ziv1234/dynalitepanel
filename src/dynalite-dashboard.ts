import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/layouts/hass-subpage";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";

@customElement("dynalite-dashboard")
export class DynaliteDashboard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public dynalite!: boolean;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @state() private _showDisabled = false;

  public firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    if (!this.hass /*|| !this.dynalite*/) {
      return;
    }
    //    if (!this._unsubs) {
    //this._getDevices();
    //}
  }

  public updated(changedProperties) {
    super.updated(changedProperties);

    if (!this.hass || !this.insteon) {
      return;
    }
    //if (!this._unsubs) {
    //  this._getDevices();
    //}
  }

  protected render(): TemplateResult | void {
    return html`
      <hass-subpage
        .hass=${this.hass}
        header="Dynalite Dashboard"
        .narrow=${this.narrow}
      >
        Hello World!!!
      </hass-subpage>
    `;
  }

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-dashboard": DynaliteDashboard;
  }
}
