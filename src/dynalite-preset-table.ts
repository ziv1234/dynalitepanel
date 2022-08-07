import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { DataTableColumnContainer } from "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/ha-fab";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { DynalitePresetData } from "./common";
import "./dynalite-table";
import { DynaliteInputSettings } from "./dynalite-input";
import { DynaliteTableSettings } from "./dynalite-table";

@customElement("dynalite-preset-table")
export class DynalitePresetTable extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

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
        }
      >
      </dynalite-table>
    `;
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

  private _inputs = [
    new DynaliteInputSettings("number")
      .heading("Number")
      .desc("Dynalite preset number (1-255)")
      .min(1)
      .max(255)
      .step(1)
      .required()
      .validationMessage("Invalid preset"),
    new DynaliteInputSettings("name").heading("Name").desc("Name for this preset"),
    new DynaliteInputSettings("level")
      .heading("Level")
      .desc("Channel levels for this preset")
      .min(0)
      .max(100)
      .validationMessage("Invalid value")
      .suffix("%"),
    new DynaliteInputSettings("fade")
      .heading("Fade")
      .desc("Preset fade time (seconds)")
      .min(0)
      .step(0.01)
      .validationMessage("Invalid fade"),
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-preset-table": DynalitePresetTable;
  }
}
