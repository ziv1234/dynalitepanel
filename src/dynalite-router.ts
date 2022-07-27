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

  @property({ type: Boolean }) public narrow!: boolean;

  protected routerOptions: RouterOptions = {
    defaultPage: "areas",
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

  protected updatePageEl(el, changedProps: PropertyValues) {
    console.log("XXX router updatepage current=%s", this._currentPage);
    console.dir(this.hass);
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
