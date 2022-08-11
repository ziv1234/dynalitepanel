import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import type { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { DynalitePresetData } from "./common";
import {
  DynaliteFadeInput,
  DynaliteIdInput,
  DynalitePercentageInput,
  DynaliteTextInput,
} from "./dynalite-input-settings";
import type { DynaliteTableSettings } from "./dynalite-table";
import "./dynalite-table";

@customElement("dynalite-preset-table")
export class DynalitePresetTable extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  @property({ attribute: false }) public presets!: { [key: string]: DynalitePresetData };

  @property({ type: String }) public defaultFade!: string;

  protected render(): TemplateResult | void {
    console.log("XXX preset table render");
    console.dir(this.hass);
    if (!this.hass) {
      return html``;
    }
    console.log("XXX preset table render2");
    const settings: DynaliteTableSettings = {
      name: "Preset",
      inputs: this._inputs,
    };
    const helpers = { name: `Default: Preset NUMBER`, fade: `Default: ${this.defaultFade}` };
    return html`
      <dynalite-table
        .hass=${this.hass}
        .narrow=${this.narrow}
        .route=${this.route}
        .settings=${settings}
        .data=${this.presets}
        .helpers=${helpers}
        @dynalite-table=${this._redispatchEvent}
        }
      >
      </dynalite-table>
    `;
  }

  private _redispatchEvent(_ev: CustomEvent) {
    console.log("redispatch");
    this.dispatchEvent(new CustomEvent("dynalite-table"));
  }

  private _inputs = {
    number: DynaliteIdInput("number", "preset")
      .heading("Number")
      .width("15%")
      .desc("Dynalite preset number (1-255)")
      .required(),
    name: DynaliteTextInput("name").heading("Name").desc("Name for this preset").width("35%"),
    level: DynalitePercentageInput("level")
      .heading("Level")
      .desc("Channel levels for this preset")
      .width("15%"),
    fade: DynaliteFadeInput("fade").heading("Fade").desc("Preset fade time (seconds)").width("15%"),
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-preset-table": DynalitePresetTable;
  }
}
