import memoizeOne from "memoize-one";
import { mdiPlus } from "@mdi/js";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/layouts/hass-subpage";
import "../homeassistant-frontend/src/components/ha-fab";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage-data-table";
import { Dynalite, panelTabs, DynaliteAreaRowInfo } from "./common";
import {
  DataTableColumnContainer,
  DataTableRowData,
} from "../homeassistant-frontend/src/components/data-table/ha-data-table";
import { navigate } from "../homeassistant-frontend/src/common/navigate";

@customElement("dynalite-areas")
export class DynaliteAreas extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public dynalite!: Dynalite;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  protected render(): TemplateResult | void {
    console.log("XXX areas render");
    console.dir(this.hass);
    if (!this.hass || !this.dynalite) {
      return html``;
    }
    console.log("XXX render areas");
    const data = this._calculateData();
    return html`
      <hass-tabs-subpage-data-table
        .hass=${this.hass}
        .narrow=${this.narrow}
        .tabs=${panelTabs}
        .route=${this.route}
        .columns=${this._columns(this.narrow)}
        .data=${data}
        id="dynetId"
        clickable
        @row-click=${this._handleRowClicked}
      >
        <ha-fab slot="fab" label="Define New Area" extended @click=${this._createNew}>
          <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
        </ha-fab>
      </hass-tabs-subpage-data-table>
    `;
  }

  private _handleRowClicked(ev) {
    const dynetId = ev.detail.id;
    console.log("XXX TBD table row-click dynetId=%s", dynetId);
    console.dir(ev);
    navigate(`/dynalite/edit/${dynetId}`);
  }

  private _columns = memoizeOne((narrow: boolean): DataTableColumnContainer => {
    if (narrow) {
      const columns: DataTableColumnContainer = {};
      // XXX TODO
      return columns;
    }
    const columns: DataTableColumnContainer = {
      dynetId: {
        title: "Area Number",
        sortable: true,
        hidden: false,
        filterable: true,
        width: "10%",
      },
      name: {
        title: "Name",
        sortable: true,
        hidden: false,
        filterable: true,
        width: "15%",
      },
      template: {
        title: "Behavior",
        sortable: true,
        hidden: narrow,
        filterable: true,
        width: "10%",
      },
      fade: {
        title: "Fade",
        sortable: true,
        hidden: narrow,
        filterable: true,
        width: "10%",
      },
      preset: {
        title: "Presets",
        sortable: true,
        hidden: narrow,
        filterable: true,
        width: "25%",
      },
      channel: {
        title: "Channels",
        sortable: true,
        hidden: narrow,
        filterable: true,
        width: "25%",
      },
    };
    return columns;
  });

  private _calculateData(): DataTableRowData[] {
    function calcSingleArea(areaNum: string, areaConfig: any): DynaliteAreaRowInfo {
      const templateNames = { room: "On/Off Switch", time_cover: "Blind or Cover" };
      return {
        name: areaConfig.name,
        dynetId: areaNum,
        template: areaConfig.template ? templateNames[areaConfig.template] : "Manual",
        fade: areaConfig.fade,
        preset: areaConfig.preset ? Object.keys(areaConfig.preset).join(", ") : "-",
        channel: areaConfig.channel ? Object.keys(areaConfig.channel).join(", ") : "-",
      };
    }
    console.log("XXX calculateData");
    console.dir(this.dynalite.config.area);
    const areas = this.dynalite.config.area!;
    const areaNumbers = Object.keys(areas);
    const data = areaNumbers.map((area) => calcSingleArea(area, areas[area]));
    console.log("XXX areas=%s", Object.keys(areas));
    return data;
  }

  private _createNew() {
    navigate("/dynalite/edit/new");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-areas": DynaliteAreas;
  }
}
