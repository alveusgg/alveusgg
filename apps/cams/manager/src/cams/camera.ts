import {
  getInfoPosition,
  getSettingsSpeed,
  setImagingAutofocus,
  setImagingCfocus,
  setImagingFocus,
  setImagingRfocus,
  setIrFilter,
  setIrLight,
  setPtzAreazoom,
  setPtzLoad,
  setPtzMove,
  setPtzPan,
  setPtzRpan,
  setPtzRptz,
  setPtzRtilt,
  setPtzRzoom,
  setPtzSpin,
  setPtzTilt,
  setPtzZoom,
  setSettingsSpeed,
} from "@alveusgg/cams-control-client";
import type { Client } from "@alveusgg/cams-control-client/client";
import type {
  SetImagingAutofocusParams,
  SetImagingCfocusParams,
  SetImagingFocusParams,
  SetImagingRfocusParams,
  SetIrFilterParams,
  SetIrLightParams,
  SetPtzAreazoomParams,
  SetPtzLoadParams,
  SetPtzMoveParams,
  SetPtzPanParams,
  SetPtzRpanParams,
  SetPtzRptzParams,
  SetPtzRtiltParams,
  SetPtzRzoomParams,
  SetPtzSpinParams,
  SetPtzTiltParams,
  SetPtzZoomParams,
  SetSettingsSpeedParams,
} from "@alveusgg/cams-control-client/zod";
import { RpcTarget } from "cloudflare:workers";
import { z } from "zod";

import type { CamControllerDurableObject } from "./controller.ts";
import type { Preset } from "./presets.ts";

const Position = z.object({
  pan: z.coerce.number(),
  tilt: z.coerce.number(),
  zoom: z.coerce.number(),
  focus: z.coerce.number().optional(),
  autofocus: z.enum(["on", "off"]).optional(),
});

export type Position = z.infer<typeof Position>;

const Speed = z.object({ speed: z.coerce.number() });

export class Camera extends RpcTarget {
  readonly name: string;
  private client: Client;
  private controller: CamControllerDurableObject;

  constructor(
    name: string,
    client: Client,
    controller: CamControllerDurableObject,
  ) {
    super();
    this.name = name;
    this.client = client;
    this.controller = controller;
  }

  private get options() {
    return { client: this.client, throwOnError: true } as const;
  }

  async load(name: string) {
    const preset = this.controller.presets.get(this.name, name);
    if (!preset) throw new Error(`Preset ${name} not found`);
    await this.pointAt(preset.position);
    if (preset.autofocus) await this.setAutofocus({ state: preset.autofocus });
  }

  async save(name: string) {
    const { autofocus, ...position } = await this.getPosition();
    const preset: Preset = { position, autofocus };
    this.controller.presets.set(this.name, name, preset);
  }

  removePreset(name: string) {
    return this.controller.presets.delete(this.name, name);
  }

  renamePreset(from: string, to: string) {
    return this.controller.presets.rename(this.name, from, to);
  }

  listPresets() {
    return this.controller.presets.names(this.name);
  }

  async getPosition() {
    const { data } = await getInfoPosition(this.options);
    return Position.parse(data);
  }

  async getSpeed() {
    const { data } = await getSettingsSpeed(this.options);
    return Speed.parse(data).speed;
  }

  async setSpeed(payload: SetSettingsSpeedParams) {
    await setSettingsSpeed({ body: payload, ...this.options });
  }

  async pan(payload: SetPtzPanParams) {
    await setPtzPan({ body: payload, ...this.options });
  }

  async panBy(payload: SetPtzRpanParams) {
    await setPtzRpan({ body: payload, ...this.options });
  }

  async tilt(payload: SetPtzTiltParams) {
    await setPtzTilt({ body: payload, ...this.options });
  }

  async tiltBy(payload: SetPtzRtiltParams) {
    await setPtzRtilt({ body: payload, ...this.options });
  }

  async zoom(payload: SetPtzZoomParams) {
    await setPtzZoom({ body: payload, ...this.options });
  }

  async zoomBy(payload: SetPtzRzoomParams) {
    await setPtzRzoom({ body: payload, ...this.options });
  }

  async areaZoom(payload: SetPtzAreazoomParams) {
    await setPtzAreazoom({ body: payload, ...this.options });
  }

  async move(payload: SetPtzMoveParams) {
    await setPtzMove({ body: payload, ...this.options });
  }

  async spin(payload: SetPtzSpinParams) {
    await setPtzSpin({ body: payload, ...this.options });
  }

  async moveBy(payload: SetPtzRptzParams) {
    await setPtzRptz({ body: payload, ...this.options });
  }

  async pointAt(payload: SetPtzLoadParams) {
    await setPtzLoad({ body: payload, ...this.options });
  }

  async setIrFilter(payload: SetIrFilterParams) {
    await setIrFilter({ body: payload, ...this.options });
  }

  async setIrLight(payload: SetIrLightParams) {
    await setIrLight({ body: payload, ...this.options });
  }

  async setAutofocus(payload: SetImagingAutofocusParams) {
    await setImagingAutofocus({ body: payload, ...this.options });
  }

  async setFocus(payload: SetImagingFocusParams) {
    await setImagingFocus({ body: payload, ...this.options });
  }

  async focusBy(payload: SetImagingRfocusParams) {
    await setImagingRfocus({ body: payload, ...this.options });
  }

  async focusContinuous(payload: SetImagingCfocusParams) {
    await setImagingCfocus({ body: payload, ...this.options });
  }
}
