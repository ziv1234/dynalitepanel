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
import { showConfirmationDialog } from "../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import {
  DynaliteEditPresetDialogParams,
  showDynaliteEditPresetDialog,
} from "./show-dialog-dynalite-edit-preset";

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
        <ha-fab slot="fab" class="dynalite-fab" label="Add Preset" extended @click=${this._addRow}>
          <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
        </ha-fab>
      </div>
    `;
  }

  private _handleRowClicked(ev) {
    const preset = ev.detail.id;
    console.log("XXX TBD preset table row-click preset=%s", preset);
    console.dir(ev);
    showDynaliteEditPresetDialog(this, {
      hass: this.hass,
      onSave: this._saveRow.bind(this),
      onDelete: this._deleteRow.bind(this),
      number: preset,
      name: this.presets[preset].name,
      level: this.presets[preset].level,
      fade: this.presets[preset].fade,
    });
    return;
  }

  private _saveRow(params: DynaliteEditPresetDialogParams): void {
    console.log("saving row");
    console.dir(params);
    console.dir(this.presets);
    const newPreset: DynalitePresetData = {};
    if (params.name) newPreset.name = params.name;
    if (params.level) newPreset.level = params.level;
    if (params.fade) newPreset.fade = params.fade;
    this.presets[params.number!] = newPreset;
    console.dir(this.presets);
    this.requestUpdate();
  }

  private async _addRow(ev) {
    console.log("XXX TBD preset table addRow");
    console.dir(ev);
    showDynaliteEditPresetDialog(this, {
      hass: this.hass,
      onSave: this._saveRow.bind(this),
      excluded: Object.keys(this.presets),
    });
  }

  private async _deleteRow(params: DynaliteEditPresetDialogParams): Promise<boolean> {
    const preset = params.number!;
    if (
      !(await showConfirmationDialog(this, {
        title: `Delete Preset ${preset}`,
        text: `Are you sure you want to delete preset ${preset}`,
        confirmText: "Confirm",
      }))
    ) {
      console.log("received no");
      return false;
    }
    console.log("received yes");
    delete this.presets[preset];
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
    "dynalite-preset-table": DynalitePresetTable;
  }
}
