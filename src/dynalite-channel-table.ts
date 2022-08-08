import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { DataTableColumnContainer } from "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/ha-fab";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { DynaliteChannelData } from "./common";
import "./dynalite-table";
import { DynaliteInputSettings } from "./dynalite-input";
import { DynaliteTableSettings } from "./dynalite-table";

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
      columns: this._columns,
      inputs: this._inputs,
    };
    const helpers = { name: `Default: Channel NUMBER`, fade: `Default: ${this.defaultFade}` };
    return html`
      <dynalite-table
        .hass=${this.hass}
        .narrow=${this.narrow}
        .route=${this.route}
        .settings=${settings}
        .data=${this.channels}
        .helpers=${helpers}
        @dynalite-table=${(_ev) => {
          this.dispatchEvent(new CustomEvent("dynalite-table"));
        }}
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
      width: "15%",
    },
    fade: {
      title: "Fade",
      sortable: false,
      hidden: false,
      filterable: false,
      width: "15%",
    },
    type: {
      title: "Type",
      sortable: false,
      hidden: false,
      filterable: false,
      width: "15%",
    },
  };

  private _inputs = [
    new DynaliteInputSettings("number")
      .heading("Number")
      .desc("Dynalite channel number (1-255)")
      .min(1)
      .max(255)
      .step(1)
      .required()
      .validationMessage("Invalid channel"),
    new DynaliteInputSettings("name").heading("Name").desc("Name for this channel"),
    new DynaliteInputSettings("fade")
      .heading("Fade")
      .desc("Preset fade time (seconds)")
      .min(0)
      .step(0.01)
      .validationMessage("Invalid fade"),
    new DynaliteInputSettings("type").type("select").selection([
      ["light", "Light (default)"],
      ["switch", "Switch"],
    ]),
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-channel-table": DynaliteChannelTable;
  }
}
