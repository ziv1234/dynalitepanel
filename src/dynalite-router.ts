import { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators";
import {
  HassRouterPage,
  RouterOptions,
} from "../homeassistant-frontend/src/layouts/hass-router-page";
import type { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import type { Dynalite } from "./common";
import { ROUTE_AREAS, ROUTE_EDIT, ROUTE_GLOBAL_SETTINGS } from "./const";

@customElement("dynalite-router")
class DynaliteRouter extends HassRouterPage {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public dynalite!: Dynalite;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow!: boolean;

  protected routerOptions: RouterOptions = {
    defaultPage: ROUTE_AREAS,
    routes: {
      [ROUTE_AREAS]: {
        tag: "dynalite-areas",
        load: () => import("./dynalite-areas"),
      },
      [ROUTE_GLOBAL_SETTINGS]: {
        tag: "dynalite-global-settings",
        load: () => import("./dynalite-global-settings"),
      },
      [ROUTE_EDIT]: {
        tag: "dynalite-edit-area",
        load: () => import("./dynalite-edit-area"),
      },
    },
  };

  protected updatePageEl(el, changedProps: PropertyValues) {
    el.route = this.routeTail;
    el.hass = this.hass;
    el.dynalite = this.dynalite;
    el.narrow = this.narrow;
    if ((!changedProps || changedProps.has("route")) && this._currentPage !== "dashboard") {
      const areaNumber = decodeURIComponent(this.routeTail.path.substring(1));
      el.areaNumber = areaNumber === "new" ? null : areaNumber;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-router": DynaliteRouter;
  }
}
