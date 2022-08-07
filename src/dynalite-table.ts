import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import {
  DataTableColumnContainer,
  DataTableRowData,
} from "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/ha-fab";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { mdiPlus } from "@mdi/js";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import { showConfirmationDialog } from "../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import { showDynaliteEditDialog } from "./show-dialog-dynalite-edit";
import { DynaliteEditDialogParams, DynaliteRowData } from "./dynalite-edit-dialog-types";
import { DynaliteInputSettings } from "./dynalite-input";

interface DynaliteTableSettings {
  columns: DataTableColumnContainer;
  inputs: DynaliteInputSettings[];
}

@customElement("dynalite-table")
export class DynaliteTable extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public settings!: DynaliteTableSettings;

  @property({ attribute: false }) public data!: { [key: string]: DynaliteRowData };

  @state() private _processedData: DataTableRowData[] = [];

  protected willUpdate(_changedProperties: Map<string | number | symbol, unknown>): void {
    console.log("table willUpdate");
    this._processedData = Object.keys(this.data).map((num) => {
      let temp: DynaliteRowData = this.data[num];
      temp.number = num;
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
        <ha-fab slot="fab" class="dynalite-fab" label="Add Preset" extended @click=${this._addRow}>
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
    showDynaliteEditDialog(this, {
      hass: this.hass,
      value: value,
      inputs: this.settings.inputs,
      excluded: undefined,
      disabled: undefined,
      helpers: undefined,
      onSave: this._saveRow.bind(this),
      onDelete: this._deleteRow.bind(this),
    });
    return;
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
    this.dispatchEvent(new CustomEvent("dynalite-table", { detail: params }));
    this.requestUpdate();
  }

  private async _addRow(ev) {
    console.log("XXX TBD preset table addRow");
    console.dir(ev);
    showDynaliteEditDialog(this, {
      hass: this.hass,
      value: {},
      inputs: this.settings.inputs,
      excluded: undefined,
      disabled: undefined,
      helpers: undefined,
      onSave: this._saveRow.bind(this),
    });
  }

  private async _deleteRow(params: DynaliteEditDialogParams): Promise<boolean> {
    const number = params.value.number!;
    if (
      !(await showConfirmationDialog(this, {
        title: `Delete Preset ${number}`,
        text: `Are you sure you want to delete preset ${number}`,
        confirmText: "Confirm",
      }))
    ) {
      console.log("received no");
      return false;
    }
    console.log("received yes");
    delete this.data[number];
    this.dispatchEvent(new CustomEvent("dynalite-table", { detail: params }));
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
