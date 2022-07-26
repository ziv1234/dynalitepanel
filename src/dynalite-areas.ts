import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/layouts/hass-subpage";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage-data-table";
import { DynaliteAreaInfo, panelTabs } from "./common";
import {
  DataTableColumnContainer,
  DataTableRowData,
} from "../homeassistant-frontend/src/components/data-table/ha-data-table";
import memoizeOne from "memoize-one";

@customElement("dynalite-areas")
export class DynaliteAreas extends LitElement {
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
    console.log("XXX areas render");
    console.dir(this.hass);
    if (!this.hass || !this.dynalite) {
      return html``;
    }
    const junkNumHidden = 777;
    console.log(
      "XXX render areas localize=%s",
      this.hass.localize("ui.panel.config.devices.picker.search")
    );
    return html`
      <hass-tabs-subpage-data-table
        .hass=${this.hass}
        .narrow=${this.narrow}
        .tabs=${panelTabs}
        .route=${this.route}
        .numHidden=${junkNumHidden}
        .searchLabel=${this.hass.localize("ui.panel.config.devices.picker.search")}
        .hiddenLabel=${this.hass.localize(
          "ui.panel.config.devices.picker.filter.hidden_devices",
          "number",
          junkNumHidden
        )}
        .columns=${this._columns(this.narrow)}
        .data=${this._data}
        clickable
      >
      </hass-tabs-subpage-data-table>
    `;
  }

  private _columns = memoizeOne((narrow: boolean): DataTableColumnContainer => {
    if (narrow) {
      const columns: DataTableColumnContainer = {};
      // XXX TODO
      return columns;
    }
    const columns: DataTableColumnContainer = {
      manufacturer: {
        title: this.hass.localize("ui.panel.config.devices.data_table.manufacturer"),
        sortable: true,
        hidden: narrow,
        filterable: true,
        width: "15%",
      },
      model: {
        title: "bla bla",
        sortable: true,
        hidden: narrow,
        filterable: true,
        width: "15%",
      },
    };
    return columns;
  });

  private _data: DataTableRowData[] = [];
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-areas": DynaliteAreas;
  }
}
