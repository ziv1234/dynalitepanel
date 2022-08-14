import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { DynaliteChannelData } from "./common";
import "./dynalite-table";
import type { DynaliteTableSettings } from "./dynalite-table";
import {
  DynaliteFadeInput,
  DynaliteIdInput,
  DynaliteSelectInput,
  DynaliteTextInput,
} from "./dynalite-input-settings";

@customElement("dynalite-channel-table")
export class DynaliteChannelTable extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  @property({ attribute: false }) public channels!: { [key: string]: DynaliteChannelData };

  @property({ type: String }) public defaultFade!: string;

  protected render(): TemplateResult | void {
    console.log("XXX channel table render");
    console.dir(this.hass);
    if (!this.hass) {
      return html``;
    }
    console.log("XXX channel table render2");
    const settings: DynaliteTableSettings = {
      name: "Channel",
      inputs: this._inputs,
    };
    const helpers = { name: `Default: Channel DYNETID`, fade: `Default: ${this.defaultFade}` };
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
    dynetId: DynaliteIdInput("dynetId", "channel")
      .heading("Number")
      .width("15%")
      .desc("Dynalite channel number (1-255)")
      .required(),
    name: DynaliteTextInput("name").heading("Name").desc("Name for this channel").width("15%"),
    fade: DynaliteFadeInput("fade").heading("Fade").desc("Preset fade time (seconds)").width("15%"),
    type: DynaliteSelectInput("type")
      .heading("Type")
      .desc("Entity type to create")
      .width("15%")
      .selection([
        ["light", "Light (default)"],
        ["switch", "Switch"],
      ])
      .transform((val) => val[0].toUpperCase() + val.substring(1)),
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-channel-table": DynaliteChannelTable;
  }
}
