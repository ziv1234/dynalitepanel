import { html, TemplateResult, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { applyThemesOnElement } from "../homeassistant-frontend/src/common/dom/apply_themes_on_element";
import { navigate } from "../homeassistant-frontend/src/common/navigate";
import { makeDialogManager } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";
import "../homeassistant-frontend/src/resources/ha-style";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
//import { LocationChangedEvent } from "./data/common";
import { ProvideHassLitMixin } from "../homeassistant-frontend/src/mixins/provide-hass-lit-mixin";
import "./dynalite-router";

@customElement("dynalite-frontend")
class DynaliteFrontend extends ProvideHassLitMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public narrow!: boolean;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public dynalite!: boolean;

  protected firstUpdated(changedProps) {
    console.log("XXX dynalite-frontend firstUpdated");
    super.firstUpdated(changedProps);
    if (!this.hass) {
      return;
    }
    // this.addEventListener("dynalite-location-changed", (e) =>
    // this._setRoute(e as LocationChangedEvent)
    //);

    makeDialogManager(this, this.shadowRoot!);
    //if (this.route.path === "") {
    //  navigate("/dynalite/devices", { replace: true });
    //}

    this._applyTheme();
  }

  protected render(): TemplateResult | void {
    console.log("XXX dynalite-frontend render 1");
    if (!this.hass /*|| !this.dynalite*/) {
      return html``;
    }
    console.log("XXX dynalite-frontend render 2");

    return html`
      <dynalite-router
        .hass=${this.hass}
        .dynalite=${this.dynalite}
        .route=${this.route}
        .narrow=${this.narrow}
      ></dynalite-router>
    `;
  }

  private _setRoute(ev: LocationChangedEvent): void {
    this.route = ev.detail!.route;
    navigate(this.route.path, { replace: true });
    this.requestUpdate();
  }

  private _applyTheme() {
    let options: Partial<HomeAssistant["selectedTheme"]> | undefined;

    const themeName =
      this.hass.selectedTheme?.theme ||
      (this.hass.themes.darkMode && this.hass.themes.default_dark_theme
        ? this.hass.themes.default_dark_theme!
        : this.hass.themes.default_theme);

    options = this.hass.selectedTheme;
    if (themeName === "default" && options?.dark === undefined) {
      options = {
        ...this.hass.selectedTheme,
      };
    }

    applyThemesOnElement(this.parentElement, this.hass.themes, themeName, {
      ...options,
      dark: this.hass.themes.darkMode,
    });
    this.parentElement!.style.backgroundColor =
      "var(--primary-background-color)";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-frontend": DynaliteFrontend;
  }
}
