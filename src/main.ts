import { html, TemplateResult, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { applyThemesOnElement } from "../homeassistant-frontend/src/common/dom/apply_themes_on_element";
import { makeDialogManager } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";
import "../homeassistant-frontend/src/resources/ha-style";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { ProvideHassLitMixin } from "../homeassistant-frontend/src/mixins/provide-hass-lit-mixin";
import "./dynalite-router";
import { Dynalite, DynaliteConfigResponse, LocationChangedEvent } from "./common";
import { localize } from "./localize/localize";
import { navigate } from "../homeassistant-frontend/src/common/navigate";

@customElement("dynalite-panel")
class DynalitePanel extends ProvideHassLitMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public narrow!: boolean;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public dynalite!: Dynalite;

  protected firstUpdated(changedProps) {
    console.log("XXX dynalite-panel firstUpdated");
    super.firstUpdated(changedProps);
    if (!this.hass) {
      console.log("XXX no hass");
      return;
    }
    if (!this.dynalite) {
      this._getDynaliteConfig();
    }
    this.addEventListener("dynalite-location-changed", (e) =>
      this._setRoute(e as LocationChangedEvent)
    );

    makeDialogManager(this, this.shadowRoot!);
    //this._applyTheme();
  }

  protected render(): TemplateResult | void {
    console.log("XXX dynalite-panel render 1");
    if (!this.hass || !this.dynalite) {
      console.log("XXX render - no hass");
      return html``;
    }
    console.log("XXX dynalite-panel render 2");
    console.log(
      "XXX render dynalite-panel localize=%s",
      this.hass.localize("ui.panel.config.devices.picker.search")
    );
    console.dir(this.hass);
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
    this.parentElement!.style.backgroundColor = "var(--primary-background-color)";
  }

  private _getDynaliteConfig(): void {
    console.log("XXX getDynaliteConfig");
    this.hass.connection
      .sendMessagePromise({
        type: "dynalite/get-config",
      })
      .then(
        (resp) => {
          console.log("XXX Message success!");
          console.dir(resp);
          const config_data = (resp as DynaliteConfigResponse).config[0];
          if (!config_data.area) config_data.area = {};
          this.dynalite = {
            config_data: config_data,
          };
        },
        (err) => {
          console.error("Message failed!", err);
        }
      );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-panel": DynalitePanel;
  }
}
