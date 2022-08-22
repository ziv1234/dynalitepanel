import memoizeOne from "memoize-one";
import { mdiPlus } from "@mdi/js";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/layouts/hass-subpage";
import "../homeassistant-frontend/src/components/ha-fab";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import { Dynalite, panelTabs, DynaliteAreaRowInfo, dynaliteRoute, ROUTE_EDIT } from "./common";
import type {
  DataTableColumnContainer,
  DataTableRowData,
} from "../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../homeassistant-frontend/src/components/data-table/ha-data-table";
import { navigate } from "../homeassistant-frontend/src/common/navigate";
import { CONF_DYNET_ID, TEMPLATE_COVER, TEMPLATE_MANUAL, TEMPLATE_ROOM } from "./const";

@customElement("dynalite-areas")
export class DynaliteAreas extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public dynalite!: Dynalite;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  protected render(): TemplateResult | void {
    if (!this.hass || !this.dynalite) {
      return html``;
    }
    const data = this._calculateData();
    return html`
      <hass-tabs-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .tabs=${panelTabs}
        .route=${this.route}
      >
        <ha-data-table
          .hass=${this.hass}
          .columns=${this._columns(this.narrow)}
          .data=${data}
          id=${CONF_DYNET_ID}
          clickable
          @row-click=${this._handleRowClicked}
        ></ha-data-table>
        <ha-fab slot="fab" label="Define New Area" extended @click=${this._createNew}>
          <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
        </ha-fab>
      </hass-tabs-subpage>
    `;
  }

  private _handleRowClicked(ev) {
    const dynetId = ev.detail.id;
    navigate(`/dynalite/edit/${dynetId}`);
  }

  private _columns = memoizeOne((narrow: boolean): DataTableColumnContainer => {
    if (narrow) {
      const columns: DataTableColumnContainer = {};
      // XXX TODO narrow
      return columns;
    }
    const columns: DataTableColumnContainer = {
      dynetId: {
        title: "Area Number",
        sortable: true,
        hidden: false,
        filterable: false,
        width: "10%",
      },
      name: {
        title: "Name",
        sortable: true,
        hidden: false,
        filterable: false,
        width: "15%",
      },
      template: {
        title: "Behavior",
        sortable: true,
        hidden: narrow,
        filterable: false,
        width: "10%",
      },
      fade: {
        title: "Fade",
        sortable: true,
        hidden: narrow,
        filterable: false,
        width: "10%",
      },
      preset: {
        title: "Presets",
        sortable: true,
        hidden: narrow,
        filterable: false,
        width: "25%",
      },
      channel: {
        title: "Channels",
        sortable: true,
        hidden: narrow,
        filterable: false,
        width: "25%",
      },
    };
    return columns;
  });

  private _calculateData(): DataTableRowData[] {
    function calcSingleArea(areaNum: string, areaConfig: any): DynaliteAreaRowInfo {
      const templateNames = { room: TEMPLATE_ROOM, time_cover: TEMPLATE_COVER };
      return {
        name: areaConfig.name,
        dynetId: areaNum,
        template: areaConfig.template ? templateNames[areaConfig.template] : TEMPLATE_MANUAL,
        fade: areaConfig.fade,
        preset: areaConfig.preset ? Object.keys(areaConfig.preset).join(", ") : "-",
        channel: areaConfig.channel ? Object.keys(areaConfig.channel).join(", ") : "-",
      };
    }
    const areas = this.dynalite.config.area!;
    const areaNumbers = Object.keys(areas);
    const data = areaNumbers.map((area) => calcSingleArea(area, areas[area]));
    return data;
  }

  private _createNew() {
    navigate(`${dynaliteRoute(ROUTE_EDIT)}/new`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-areas": DynaliteAreas;
  }
}
