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

  protected async willUpdate(
    _changedProperties: Map<string | number | symbol, unknown>
  ): Promise<void> {
    console.log("XXX dynalite-panel willUpdate");
    if (!this.hass) {
      console.log("XXX no hass");
      return;
    }
    if (!this.dynalite) {
      console.log("before");
      await this._getDynaliteConfig();
      console.log("after");
    }
    super.willUpdate(_changedProperties);
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

  private async _getDynaliteConfig(): Promise<void> {
    console.log("XXX getDynaliteConfig");
    const resp = await this.hass.connection.sendMessagePromise({
      type: "dynalite/get-config",
    });
    if (resp) {
      console.log("XXX Message success!");
      console.dir(resp);
      const completeConfig = (resp as DynaliteConfigResponse).config;
      if (completeConfig.length === 1 || !this._activeEntry) {
        this._activeEntry = { host: completeConfig[0].host, port: completeConfig[0].port };
      }
      for (const curConfig of completeConfig) {
        if (
          curConfig.host === this._activeEntry!.host &&
          curConfig.port === this._activeEntry!.port
        ) {
          if (!curConfig.area) curConfig.area = {};
          if (!curConfig.autodiscover) curConfig.autodiscover = false;
          if (!curConfig.default || !curConfig.default.fade) {
            curConfig.default = { fade: "0" };
          }
          if (!curConfig.active) curConfig.active = "off";
          if (!curConfig.template) curConfig.template = {};
          ["room", "time_cover"].forEach((template) => {
            if (!curConfig.template![template]) curConfig.template![template] = {};
          });
          if (!curConfig.template.time_cover?.class) curConfig.template.time_cover!.class = "blind";
          curConfig.preset = { "5": { name: "abc", fade: "0.3" }, "78": { level: "0.85" } }; // XXX TBD
          this.dynalite = {
            config: curConfig,
            default: (resp as DynaliteConfigResponse).default,
          };
          break;
        }
      }
    } else {
      console.error("Message failed!");
    }
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
