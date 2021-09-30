import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export interface PressedKeys {
    x: number;
    y: number;
}

export class Position extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
}

export class XRLeftHandPosition extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
}

export class XRRightHandPosition extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
}

export class Rotation extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
}

export class Trading extends Schema {
    @type("boolean") isTrading: boolean = false;
}

export interface XRCameraPosition {
    x: number;
    y: number;
    z: number;
}

export interface XRCameraRotation {
    x: number;
    y: number;
    z: number;
}


export interface XRLeftHandMovement{
    x: number;
    y: number;
    z: number;
}

export interface XRRightHandMovement {
    x: number;
    y: number;
    z: number;
}

export class ItemSeeds extends Schema {
    @type("string") plantName: string = '';
    @type("number") seedCount: number;

    constructor(plantName: string, seedCount: number) {
        super();
        this.plantName = plantName;
        this.seedCount = seedCount;
    }
}


export class Player extends Schema {
    @type("string") id: string = '';
    @type("boolean") admin: boolean = false;
    @type("string") name: string;
    @type("boolean") isXR: boolean;
    @type(Position) playerPosition = new Position();
    @type(XRLeftHandPosition) xrLeftHandPosition = new XRLeftHandPosition();
    @type(XRRightHandPosition) xrRightHandPosition = new XRRightHandPosition();
    @type(Rotation) rotation = new Rotation();
    @type(Trading) trading = new Trading();
    @type([ ItemSeeds ]) itemSeeds = new ArraySchema<ItemSeeds>();
    @type([ ItemSeeds ]) tradingItems = new ArraySchema<ItemSeeds>();

    xrCameraPosition: XRCameraPosition = { x: 0, y: 0, z:0 };
    xrCameraRotation: XRCameraRotation = { x: 0, y: 0, z:0 };
    xrLeftHandMovement: XRLeftHandMovement = { x: 0, y: 0, z:0 };
    xrRightHandMovement: XRRightHandMovement = { x: 0, y: 0, z:0 };
    pressedKeys: PressedKeys = { x: 0, y: 0 };
 
}