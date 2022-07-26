import { PolymerElement } from "@polymer/polymer";
import { customElement, property, state } from "lit/decorators";
import {
  HassRouterPage,
  RouterOptions,
} from "../homeassistant-frontend/src/layouts/hass-router-page";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { Dynalite } from "./common";

@customElement("dynalite-router")
class DynaliteRouter extends HassRouterPage {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public dynalite!: Dynalite;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean }) public narrow!: boolean;

  @state() private _wideSidebar = false;

  @state() private _wide = false;

  protected routerOptions: RouterOptions = {
    defaultPage: "areas",
    routes: {
      areas: {
        tag: "dynalite-areas",
        load: () => {
          // eslint-disable-next-line no-console
          console.info("Importing dynalite-areas");
          return import("./dynalite-areas");
        },
      },
      "global-settings": {
        tag: "dynalite-global-settings",
        load: () => {
          // eslint-disable-next-line no-console
          console.info("Importing dynalite-global-settings");
          return import("./dynalite-global-settings");
        },
      },
    },
  };

  protected updatePageEl(el) {
    const isWide = this.hass.dockedSidebar === "docked" ? this._wideSidebar : this._wide;
    console.log("XXX router updatepage");
    console.dir(this.hass);
    if ("setProperties" in el) {
      // As long as we have Polymer panels
      (el as PolymerElement).setProperties({
        route: this.routeTail,
        hass: this.hass,
        dynalite: this.dynalite,
        //showAdvanced: Boolean(this.hass.userData?.showAdvanced),
        //isWide,
        narrow: this.narrow,
      });
    } else {
      el.route = this.routeTail;
      el.hass = this.hass;
      el.dynalite = this.dynalite;
      //el.showAdvanced = Boolean(this.hass.userData?.showAdvanced);
      //el.isWide = isWide;
      el.narrow = this.narrow;
    }
  }

  protected updatePageElOld(el) {
    const section = this.route.path.replace("/", "");
    const isWide = this.hass.dockedSidebar === "docked" ? this._wideSidebar : this._wide;
    el.hass = this.hass;
    el.route = this.routeTail;
    el.narrow = this.narrow;
    el.isWide = isWide;
    el.section = section;

    // eslint-disable-next-line no-console
    console.info("Current Page: " + this._currentPage + " in dynalite-router");

    // eslint-disable-next-line no-console
    console.info("Route " + this.route.path + " in dynalite-router");

    if (this._currentPage != "devices") {
      const routeSplit = this.routeTail.path.split("/");
      el.deviceId = routeSplit[routeSplit.length - 1];

      // eslint-disable-next-line no-console
      console.info("Device ID: " + el.deviceId + " in dynalite-router");
    }
    el.dynalite = this.dynalite;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-router": DynaliteRouter;
  }
}
