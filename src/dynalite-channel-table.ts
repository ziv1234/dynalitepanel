import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { capitalizeFirst, DynaliteChannelData } from "./common";
import "./dynalite-table";
import type { DynaliteTableSettings } from "./dynalite-table";
import {
  DynaliteFadeInput,
  DynaliteIdInput,
  DynaliteSelectInput,
  DynaliteTextInput,
} from "./dynalite-input-settings";
import {
  CONF_CHANNEL,
  CONF_DYNET_ID,
  CONF_FADE,
  CONF_LIGHT,
  CONF_NAME,
  CONF_SWITCH,
  CONF_TYPE,
} from "./const";

@customElement("dynalite-channel-table")
export class DynaliteChannelTable extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  @property({ attribute: false }) public channels!: { [key: string]: DynaliteChannelData };

  @property({ type: String }) public defaultFade!: string;

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }
    const settings: DynaliteTableSettings = {
      name: "Channel",
      inputs: this._inputs,
    };
    const helpers = {
      name: `Default: Channel ${CONF_DYNET_ID}`,
      fade: `Default: ${this.defaultFade}`,
    };
    return html`
      <dynalite-table
        .hass=${this.hass}
        .narrow=${this.narrow}
        .route=${this.route}
        .settings=${settings}
        .data=${this.channels}
        .helpers=${helpers}
        @dynalite-table=${this._redispatchEvent}
      >
      </dynalite-table>
    `;
  }

  private _redispatchEvent(_ev: CustomEvent) {
    this.dispatchEvent(new CustomEvent("dynalite-table"));
  }

  private _inputs = {
    dynetId: DynaliteIdInput(CONF_DYNET_ID, CONF_CHANNEL)
      .heading("Number")
      .width("15%")
      .narrowWidth("30%")
      .desc("Dynalite channel number (1-255)")
      .required(),
    name: DynaliteTextInput(CONF_NAME)
      .heading("Name")
      .desc("Name for this channel")
      .width("15%")
      .narrowWidth("70%"),
    fade: DynaliteFadeInput(CONF_FADE)
      .heading("Fade")
      .desc("Preset fade time (seconds)")
      .width("15%"),
    type: DynaliteSelectInput(CONF_TYPE)
      .heading("Type")
      .desc("Entity type to create")
      .width("15%")
      .selection([
        [CONF_LIGHT, "Light (default)"],
        [CONF_SWITCH, "Switch"],
      ])
      .transform(capitalizeFirst),
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-channel-table": DynaliteChannelTable;
  }
}
