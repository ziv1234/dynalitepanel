import { mdiPlus } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import type {
  DataTableColumnContainer,
  DataTableRowData,
} from "../homeassistant-frontend/src/components/data-table/ha-data-table";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { CONF_DYNET_ID } from "./const";
import {
  showDynaliteEditDialog,
  DynaliteEditDialogParams,
  DynaliteRowData,
} from "./show-dialog-dynalite-edit";
import type { DynaliteInputSettings } from "./dynalite-input-settings";
import "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/ha-fab";

export interface DynaliteTableSettings {
  name: string;
  inputs: { [key: string]: DynaliteInputSettings };
}

@customElement("dynalite-table")
export class DynaliteTable extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  @property({ attribute: false }) public settings!: DynaliteTableSettings;

  @property({ attribute: false }) public data!: { [key: string]: DynaliteRowData };

  @property({ attribute: false }) public helpers?: { [key: string]: string };

  @state() private _processedData: DataTableRowData[] = [];

  @state() private _columns: DataTableColumnContainer = {};

  protected willUpdate(_changedProperties: Map<string | number | symbol, unknown>): void {
    this._processedData = Object.entries(this.data).map(([num, rowData]) => {
      const temp: DynaliteRowData = {};
      Object.entries(this.settings.inputs).forEach(([field, data]) => {
        const value =
          field === CONF_DYNET_ID
            ? num
            : field in rowData && data.suffixVal === "%"
            ? rowData[field] * 100 + "%"
            : rowData[field];
        temp[field] = data.transformVal(value);
      });
      return temp;
    });
    // XXX move to memoizeOne
    this._columns = {};
    Object.entries(this.settings.inputs).forEach(([field, input]) => {
      this._columns[field] = {
        title: input.headingVal!,
        width: this.narrow ? input.narrowWidthVal : input.widthVal,
        hidden: this.narrow && !input.narrowWidthVal,
        sortable: true,
        filterable: false,
      };
    });
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }
    return html`
      <div class="dynalite-table">
        <ha-data-table
          .hass=${this.hass}
          .narrow=${this.narrow}
          .route=${this.route}
          .columns=${this._columns}
          .data=${this._processedData}
          clickable
          id=${CONF_DYNET_ID}
          auto-height
          @row-click=${this._handleRowClicked}
        >
        </ha-data-table>
        <ha-fab
          slot="fab"
          class="dynalite-fab"
          label="Add ${this.settings.name}"
          extended
          @click=${this._addRow}
        >
          <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
        </ha-fab>
      </div>
    `;
  }

  private _handleRowClicked(ev) {
    const dynetId = ev.detail.id;
    const value: DynaliteRowData = this.data[dynetId];
    value.dynetId = dynetId;
    showDynaliteEditDialog(this, {
      hass: this.hass,
      name: this.settings.name,
      value: value,
      inputs: this.settings.inputs,
      excluded: undefined,
      disabled: [CONF_DYNET_ID],
      helpers: this.helpers,
      onSave: this._saveRow.bind(this),
      onDelete: this._deleteRow.bind(this),
    });
  }

  private _saveRow(params: DynaliteEditDialogParams): void {
    const newRow: DynaliteRowData = JSON.parse(JSON.stringify(params.value));
    const dynetId = newRow.dynetId!;
    delete newRow.dynetId;
    this.data[dynetId] = newRow;
    this.dispatchEvent(new CustomEvent("dynalite-table"));
    this.requestUpdate();
  }

  private async _addRow(_ev) {
    showDynaliteEditDialog(this, {
      hass: this.hass,
      name: this.settings.name,
      value: {},
      inputs: this.settings.inputs,
      excluded: Object.keys(this.data),
      disabled: undefined,
      helpers: this.helpers,
      onSave: this._saveRow.bind(this),
    });
  }

  private _deleteRow(dynetId: string): void {
    delete this.data[dynetId];
    this.dispatchEvent(new CustomEvent("dynalite-table"));
    this.requestUpdate();
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
    "dynalite-table": DynaliteTable;
  }
}
