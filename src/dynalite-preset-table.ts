import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import {
  DataTableColumnContainer,
  DataTableRowData,
} from "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/ha-fab";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { DynalitePresetData } from "./common";
import { mdiPlus } from "@mdi/js";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";

interface DynalitePresetRowData extends DynalitePresetData {
  number?: string;
}

@customElement("dynalite-preset-table")
export class DynalitePresetTable extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public presets!: { [key: string]: DynalitePresetData };

  protected render(): TemplateResult | void {
    console.log("XXX preset table render");
    console.dir(this.hass);
    if (!this.hass) {
      return html``;
    }
    console.log("XXX preset table render2");
    const columns: DataTableColumnContainer = {
      // XXX move to memoizeOne
      number: {
        title: "Number",
        sortable: false,
        hidden: false,
        filterable: false,
        width: "25%",
      },
      name: {
        title: "Name",
        sortable: true,
        hidden: false,
        filterable: false,
        width: "35%",
      },
      level: {
        title: "Level",
        sortable: true,
        hidden: false,
        filterable: false,
        width: "15%",
      },
    };

    const data: DataTableRowData[] = Object.keys(this.presets).map((num) => {
      let temp: DynalitePresetRowData = this.presets[num];
      temp.number = num;
      return temp;
    });

    return html`
      <div class="dynalite-table">
        <ha-data-table
          .hass=${this.hass}
          .narrow=${this.narrow}
          .route=${this.route}
          .columns=${columns}
          .data=${data}
          clickable
          id="number"
          auto-height
          @row-click=${this._handleRowClicked}
        >
        </ha-data-table>
        <ha-fab
          slot="fab"
          class="dynalite-fab md-fab-bottom-right"
          label="Add Preset"
          extended
          @click=${this._addRow}
        >
          <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
        </ha-fab>
      </div>
    `;
  }

  private _handleRowClicked(ev) {
    const target = ev.detail.id;
    console.log("XXX TBD preset table row-click id=%s", target);
    console.dir(ev);
    return;
  }

  private _addRow(ev) {
    const target = ev.detail.id;
    console.log("XXX TBD preset table row-click id=%s", target);
    console.dir(ev);
    return;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        .dynalite-table {
          position: relative;
        }
        .dynalite-fab {
          display: inline-flex;
          position: absolute;
          bottom: -15px;
          right: 0;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-preset-table": DynalitePresetTable;
  }
}
