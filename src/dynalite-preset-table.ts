import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import type { DataTableColumnContainer } from "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/ha-fab";
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
      columns: this._columns,
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

  private _columns: DataTableColumnContainer = {
    // XXX move to memoizeOne
    number: {
      title: "Number",
      sortable: false,
      hidden: false,
      filterable: false,
      width: "15%",
    },
    name: {
      title: "Name",
      sortable: false,
      hidden: false,
      filterable: false,
      width: "35%",
    },
    level: {
      title: "Level",
      sortable: false,
      hidden: false,
      filterable: false,
      width: "15%",
    },
    fade: {
      title: "Fade",
      sortable: false,
      hidden: false,
      filterable: false,
      width: "15%",
    },
  };

  private _inputs = {
    number: DynaliteIdInput("number", "preset")
      .heading("Number")
      .desc("Dynalite preset number (1-255)")
      .required(),
    name: DynaliteTextInput("name").heading("Name").desc("Name for this preset"),
    level: DynalitePercentageInput("level").heading("Level").desc("Channel levels for this preset"),
    fade: DynaliteFadeInput("fade").heading("Fade").desc("Preset fade time (seconds)"),
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-preset-table": DynalitePresetTable;
  }
}
