import { Room } from "colyseus.js";
import {
    PressedKeys
} from "../../../server/src/entities/Player";

const keyboard: PressedKeys = { x: 0, y: 0 };

export default class PlayerMovement {
    public room: Room;
    public bodyMeshContainer: any;

    constructor(room: Room, bodyMeshContainer?: any) {
        this.room = room;
        this.bodyMeshContainer = bodyMeshContainer;
        this.setupListeners();
    }

    private setupListeners() {
        window.onkeydown = (e: KeyboardEvent) => this.handleKeyDown(e.code);
        window.onkeyup = (e: KeyboardEvent) => this.handleKeyUp(e.code);
    }

    //Player Movement based on keyboard input
    private handleKeyDown(code: string) {
        switch (code) {
            case "KeyW":
            case "ArrowUp":
                keyboard.y = -1;
                break;
            case "KeyA":
            case "ArrowLeft":
                keyboard.x = -1;
                break;
            case "KeyS":
            case "ArrowDown":
                keyboard.y = 1;
                break;
            case "KeyD":
            case "ArrowRight":
                keyboard.x = 1;
                break;
        }

        this.room.send("key", keyboard);
    }

    private handleKeyUp(code: string) {
        switch (code) {
            case "KeyW":
            case "ArrowUp":
                keyboard.y = 0;
                break;
            case "KeyA":
            case "ArrowLeft":
                keyboard.x = 0;
                break;
            case "KeyS":
            case "ArrowDown":
                keyboard.y = 0;
                break;
            case "KeyD":
            case "ArrowRight":
                keyboard.x = 0;
                break;
        }

        this.room.send("key", keyboard);
    }

}