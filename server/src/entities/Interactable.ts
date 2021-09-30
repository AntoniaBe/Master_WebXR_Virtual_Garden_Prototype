import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";


export class PlantStatus extends Schema {
    @type("string") plantName: string = '';
    @type("number") currentWateringCount: number;
    @type("number") maxWateringCount: number;
    @type("string") lastWateredBy: string;
}


export class Interactable extends Schema {
    @type("string") interactableType: string = '';
    @type(PlantStatus) plantStatus = new PlantStatus();

}