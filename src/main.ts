import { html, TemplateResult, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import { makeDialogManager } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { ProvideHassLitMixin } from "../homeassistant-frontend/src/mixins/provide-hass-lit-mixin";
import "./dynalite-router";
import {
  capitalizeFirst,
  Dynalite,
  DynaliteConfigData,
  DynaliteConfigResponse,
  DynaliteDefaultTemplates,
} from "./common";
import {
  CONF_ACTIVE_OFF,
  EVENT_CONFIG_CHANGED,
  TIME_COVER_GENERAL_PARAMS,
  WS_GET_CONFIG,
  WS_SAVE_CONFIG,
} from "./const";
import "../homeassistant-frontend/src/resources/ha-style";

@customElement("dynalite-panel")
class DynalitePanel extends ProvideHassLitMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public narrow!: boolean;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public dynalite!: Dynalite;

  @state() private _activeEntry?: string;

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener(EVENT_CONFIG_CHANGED, this._updateDynalite);
    makeDialogManager(this, this.shadowRoot!);
  }

  public disconnectedCallback() {
    this.removeEventListener(EVENT_CONFIG_CHANGED, this._updateDynalite);
    super.disconnectedCallback();
  }

  protected async willUpdate(
    _changedProperties: Map<string | number | symbol, unknown>
  ): Promise<void> {
    if (!this.hass) {
      return;
    }
    if (!this.dynalite) {
      await this._getDynaliteConfig();
    }
    super.willUpdate(_changedProperties);
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this.dynalite) {
      return html``;
    }
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
    const resp: DynaliteConfigResponse = await this.hass.connection.sendMessagePromise({
      type: WS_GET_CONFIG,
    });
    if (resp) {
      const completeConfig = resp.config;
      if (!this._activeEntry) {
        this._activeEntry = Object.keys(completeConfig)[0];
      }
      this.dynalite = {
        config: this._processDynaliteConfig(completeConfig, this._activeEntry),
        default: resp.default,
        classSelection: resp.default.DEVICE_CLASSES.map((devClass) => [
          devClass,
          capitalizeFirst(devClass),
        ]),
        completeConfig: completeConfig,
        entry_id: this._activeEntry,
      };
    }
  }

  private _processDynaliteConfig(
    completeConfig: { [key: string]: DynaliteConfigData },
    entry_id: string
  ): DynaliteConfigData {
    const curConfig = completeConfig[entry_id];
    if (!curConfig.area) curConfig.area = {};
    if (!curConfig.autodiscover) curConfig.autodiscover = false;
    if (!curConfig.default || !curConfig.default.fade) {
      curConfig.default = { fade: "0" };
    }
    if (!curConfig.active) curConfig.active = CONF_ACTIVE_OFF;
    if (!curConfig.template) curConfig.template = {};
    Object.keys(DynaliteDefaultTemplates).forEach((template) => {
      if (!curConfig.template![template]) curConfig.template![template] = {};
    });
    TIME_COVER_GENERAL_PARAMS.forEach((param) => {
      if (!(param in curConfig.template!.time_cover!))
        curConfig.template!.time_cover![param] = DynaliteDefaultTemplates.time_cover![param];
    });
    return curConfig;
  }

  private async _updateDynalite(ev: Event) {
    const shouldSave = (ev as CustomEvent).detail.value;
    console.log("XXX updating dynalite - %s", shouldSave);
    console.dir(this.dynalite.config);
    this._activeEntry = this.dynalite.entry_id;
    this.dynalite.config = this._processDynaliteConfig(
      this.dynalite.completeConfig,
      this._activeEntry
    );
    if (shouldSave) {
      await this.hass.connection.sendMessagePromise({
        type: WS_SAVE_CONFIG,
        entry_id: this._activeEntry,
        config: this.dynalite.config,
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-panel": DynalitePanel;
  }
}
