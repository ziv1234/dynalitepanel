import { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators";
import {
  HassRouterPage,
  RouterOptions,
} from "../homeassistant-frontend/src/layouts/hass-router-page";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { Dynalite, ROUTE_AREAS, ROUTE_GLOBAL_SETTINGS, ROUTE_EDIT } from "./common";

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
        load: () => {
          // eslint-disable-next-line no-console
          console.info("Importing dynalite-areas");
          return import("./dynalite-areas");
        },
      },
      [ROUTE_GLOBAL_SETTINGS]: {
        tag: "dynalite-global-settings",
        load: () => {
          // eslint-disable-next-line no-console
          console.info("Importing dynalite-global-settings");
          return import("./dynalite-global-settings");
        },
      },
      [ROUTE_EDIT]: {
        tag: "dynalite-edit-area",
        load: () => {
          // eslint-disable-next-line no-console
          console.info("Importing dynalite-edit-area");
          return import("./dynalite-edit-area");
        },
      },
    },
  };

  protected firstUpdated(_changedProps: Map<string | number | symbol, unknown>): void {
    this.style.setProperty("--app-header-background-color", "var(--sidebar-background-color)");
    this.style.setProperty("--app-header-text-color", "var(--sidebar-text-color)");
    this.style.setProperty("--app-header-border-bottom", "1px solid var(--divider-color)");
    this.style.setProperty("--ha-card-border-radius", "var(--ha-config-card-border-radius, 8px)");
  }

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
