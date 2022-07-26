import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import { panelTabs } from "./common";

@customElement("dynalite-global-settings")
export class DynaliteGlobalSettings extends LitElement {
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

    if (!this.hass /*|| !this.dynalite */) {
      return;
    }
    //if (!this._unsubs) {
    //  this._getDevices();
    //}
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
        HELLO WORLD
      </hass-tabs-subpage>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-global-settings": DynaliteGlobalSettings;
  }
}
