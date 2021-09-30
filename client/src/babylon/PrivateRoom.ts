//import * as BABYLON from 'babylonjs'

import { Room } from 'colyseus.js';
import PlayerController from "./PlayerController";
import GameMenu from "./GameMenu";
import BaseLevel from "./BaseLevel";
import { Player } from "../../../server/src/entities/Player";
import { Interactable } from "../../../server/src/entities/Interactable";

declare let BABYLON: any;

class PrivateRoom {
  public canvas: HTMLCanvasElement
  public scene: any
  private engine: any
  private camera: any
  private light?: any
  private playerId: string = 'NotYou'
  private room: Room
  private players: Map<string, PlayerController> = new Map<string, PlayerController>()
 // private _interactable: Interactable;
  private ground: any;
  public appData: any;
  public panelChat: any;
  public panelMenu: any;
  public gameMenu: any;
  public baseLevel: any;
  public chatRoom: any;
  public wateringCan: any;
  public flower: any;
  private watered: boolean = false;


  constructor(room: Room, appData: any, chatRoom: Room) {
    console.log("Private Room")
    this.room = room;
    this.chatRoom = chatRoom;

    this.canvas = (document.getElementById('renderCanvas') as HTMLCanvasElement);
    // Load the 3D engine
    this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new BABYLON.Scene(this.engine)
    this.scene.gravity = new BABYLON.Vector3(0, -0.15, 0);
    this.scene.collisionsEnabled = true;
    this.appData = appData;

    //create base level
    this.baseLevel = new BaseLevel(this.scene, this.engine);
    this.camera = this.baseLevel.createCamera();
    this.ground = this.baseLevel.createGround()
    this.light = this.scene.lights[0];
    this.importLevel();


    //Create Menu
    this.gameMenu = new GameMenu(this.chatRoom , this.camera, this.scene, appData, this.panelChat, this.panelMenu, this.room);
    this.gameMenu.createMenuXR();

    for (const player of this.players.values()) {
      player.update();
    }


    this.scene.registerBeforeRender( () => {

      if(this.wateringCan && this.flower){

        if ( this.wateringCan.intersectsMesh( this.flower, false)) {
      
          if(!this.watered){
            this.watered = true;
           this.room.send("plantSatus", this.room.sessionId  );
          }
      } else {
       this.watered = false;
      }
      }
  
    });
  }

  private importLevel() {

    BABYLON.SceneLoader.Append("/assets/babylon/", "Garden.babylon", this.scene, (newMeshes: any[]) => {
      this.scene.meshes.forEach((mesh: any) => {
        // set colliders and whether we can pick mesh with raycast
      
        if (mesh.name.includes("PlantingCollider")) {
          mesh.visibility = false;
        } else if (mesh.name.includes("Wateringcan")) {
          this.wateringCan = this.scene.getMeshByName("Wateringcan");
          mesh.checkCollisions = true;
          mesh.isPickable = true;
        }
        else if (mesh.name.includes("Collider")) {
          mesh.visibility = false;
          mesh.checkCollisions = true;
          mesh.isPickable = true;
        }
        else if (mesh.name.includes("Flower")) {
          this.flower = this.scene.getMeshByName("FlowerCollider.007");
        }
      });
    });
  }


  public Interactable() {
    //const interactableModel: Interactable = this._playerModel;
  }

  public addInteractable(interactableModel: Interactable) {
console.log("interactableModel", interactableModel);

  }

  public setPlayerId(playerId: string) {
    this.playerId = playerId
  }

  public addPlayer(playerModel: Player) {
    const controllable = playerModel.id === this.playerId;

    const controller = new PlayerController(this.room, this.scene, controllable, playerModel, this.camera, this.engine, this.ground, this.appData, this.gameMenu.panelChat, this.gameMenu.panelMenu);
    this.players.set(playerModel.id, controller);
  }

  public updatePlayer(playerModel: Player) {
    const player = this.players.get(playerModel.id)
    if (!player) {
      return
    }
    player.update(playerModel);
  }

  public removePlayer(playerModel: Player) {
    const controller = this.players.get(playerModel.id)
    if (!controller) {
      return
    }
    controller.remove();
    this.players.delete(playerModel.id);
  }
}

export { PrivateRoom }