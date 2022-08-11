import { mdiPlus } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import type {
  DataTableColumnContainer,
  DataTableRowData,
} from "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/ha-fab";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { showConfirmationDialog } from "../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import { showDynaliteEditDialog } from "./show-dialog-dynalite-edit";
import { DynaliteEditDialogParams, DynaliteRowData } from "./dynalite-edit-dialog-types";
import { DynaliteInputSettings } from "./dynalite-input-settings";

export interface DynaliteTableSettings {
  name: string;
  columns: DataTableColumnContainer;
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

  protected willUpdate(_changedProperties: Map<string | number | symbol, unknown>): void {
    console.log("table willUpdate");
    this._processedData = Object.keys(this.data).map((num) => {
      const temp: DynaliteRowData = {};
      for (const field in this.settings.inputs) {
        if (field === "number") {
          temp[field] = num;
        } else {
          temp[field] =
            !(field in this.data[num]) || this.settings.inputs[field].suffixVal !== "%"
              ? this.data[num][field]
              : this.data[num][field] * 100 + "%";
        }
      }
      return temp;
    });
  }

  protected render(): TemplateResult | void {
    console.log("XXX table render");
    console.dir(this.hass);
    if (!this.hass) {
      return html``;
    }
    console.log("XXX table render2");
    return html`
      <div class="dynalite-table">
        <ha-data-table
          .hass=${this.hass}
          .narrow=${this.narrow}
          .route=${this.route}
          .columns=${this.settings.columns}
          .data=${this._processedData}
          clickable
          id="number"
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
    const number = ev.detail.id;
    console.log("XXX TBD table row-click number=%s", number);
    console.dir(ev);
    const value: DynaliteRowData = this.data[number];
    value.number = number;
    console.log("handle row click");
    console.dir(value);
    showDynaliteEditDialog(this, {
      hass: this.hass,
      name: this.settings.name,
      value: value,
      inputs: this.settings.inputs,
      excluded: undefined,
      disabled: ["number"],
      helpers: this.helpers,
      onSave: this._saveRow.bind(this),
      onDelete: this._deleteRow.bind(this),
    });
  }

  private _saveRow(params: DynaliteEditDialogParams): void {
    console.log("saving row");
    console.dir(params);
    console.dir(this.data);
    const newRow: DynaliteRowData = JSON.parse(JSON.stringify(params.value));
    const number = newRow.number!;
    delete newRow.number;
    this.data[number] = newRow;
    console.dir(this.data);
    this.dispatchEvent(new CustomEvent("dynalite-table"));
    this.requestUpdate();
  }

  private async _addRow(ev) {
    console.log("XXX TBD table addRow");
    console.dir(ev);
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

  private async _deleteRow(params: DynaliteEditDialogParams): Promise<boolean> {
    const number = params.value.number!;
    if (
      !(await showConfirmationDialog(this, {
        title: `Delete ${this.settings.name} ${number}`,
        text: `Are you sure you want to delete ${this.settings.name.toLowerCase()} ${number}`,
        confirmText: "Confirm",
      }))
    ) {
      console.log("received no");
      return false;
    }
    console.log("received yes");
    delete this.data[number];
    this.dispatchEvent(new CustomEvent("dynalite-table"));
    this.requestUpdate();
    return true;
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
