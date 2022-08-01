import { html, TemplateResult, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import { makeDialogManager } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";
import "../homeassistant-frontend/src/resources/ha-style";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { ProvideHassLitMixin } from "../homeassistant-frontend/src/mixins/provide-hass-lit-mixin";
import "./dynalite-router";
import {
  Dynalite,
  DynaliteConfigResponse,
  DynaliteEntryIdentifier,
  LocationChangedEvent,
} from "./common";
import { navigate } from "../homeassistant-frontend/src/common/navigate";

@customElement("dynalite-panel")
class DynalitePanel extends ProvideHassLitMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public narrow!: boolean;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public dynalite!: Dynalite;

  @state() private _activeEntry?: DynaliteEntryIdentifier;

  public connectedCallback() {
    console.log("XXX addEventListener");
    super.connectedCallback();
    this.addEventListener("value-changed", this._updateDynalite);
  }

  public disconnectedCallback() {
    console.log("XXX removeEventListener");
    this.removeEventListener("value-changed", this._updateDynalite);
    super.disconnectedCallback();
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
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
    console.log("XXX setRoute - it may have a reason");
    this.route = ev.detail!.route;
    navigate(this.route.path, { replace: true });
    this.requestUpdate();
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
          const completeConfig = (resp as DynaliteConfigResponse).config;
          if (completeConfig.length == 1 || !this._activeEntry) {
            this._activeEntry = { host: completeConfig[0].host, port: completeConfig[0].port };
          }
          for (const curConfig of completeConfig) {
            if (
              curConfig.host == this._activeEntry!.host &&
              curConfig.port == this._activeEntry!.port
            ) {
              if (!curConfig.area) curConfig.area = {};
              if (!curConfig.autodiscover) curConfig.autodiscover = false;
              if (!curConfig.default || !curConfig.default.fade) {
                curConfig.default = { fade: 0 };
              }
              if (!curConfig.active) curConfig.active = "off";
              this.dynalite = {
                config: curConfig,
                default: (resp as DynaliteConfigResponse).default,
              };
              break;
            }
          }
        },
        (err) => {
          console.error("Message failed!", err);
        }
      );
  }

  private _updateDynalite(e: Event) {
    console.log("XXX TBD _updateDynalite");
    console.dir(e);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-panel": DynalitePanel;
  }
}
