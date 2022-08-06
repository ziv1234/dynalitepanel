import { html, TemplateResult, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import { makeDialogManager } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";
import "../homeassistant-frontend/src/resources/ha-style";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { ProvideHassLitMixin } from "../homeassistant-frontend/src/mixins/provide-hass-lit-mixin";
import "./dynalite-router";
import { Dynalite, DynaliteConfigResponse, DynaliteEntryIdentifier } from "./common";

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
    makeDialogManager(this, this.shadowRoot!);
  }

  public disconnectedCallback() {
    console.log("XXX removeEventListener");
    this.removeEventListener("value-changed", this._updateDynalite);
    super.disconnectedCallback();
  }

  protected willUpdate(_changedProperties: Map<string | number | symbol, unknown>): void {
    console.log("XXX dynalite-panel willUpdate");
    super.willUpdate(_changedProperties);
    if (!this.hass) {
      console.log("XXX no hass");
      return;
    }
    if (!this.dynalite) {
      this._getDynaliteConfig();
    }
  }

  protected render(): TemplateResult | void {
    console.log("XXX dynalite-panel render 1");
    if (!this.hass || !this.dynalite) {
      console.log("XXX render - no hass(%s) or dynalite(%s)", this.hass, this.dynalite);
      return html``;
    }
    console.log("XXX dynalite-panel render 2");
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
                curConfig.default = { fade: "0" };
              }
              if (!curConfig.active) curConfig.active = "off";
              curConfig.preset = { "5": { name: "abc", fade: "0.3" }, "78": { level: "1.3" } };
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
    console.dir(this.dynalite.config);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-panel": DynalitePanel;
  }
}
