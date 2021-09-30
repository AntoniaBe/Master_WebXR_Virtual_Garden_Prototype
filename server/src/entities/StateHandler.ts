import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "../entities/Player";
import { Interactable } from "../entities/Interactable";

export class StateHandler extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Interactable }) interactableItems  = new MapSchema<Interactable>();
}