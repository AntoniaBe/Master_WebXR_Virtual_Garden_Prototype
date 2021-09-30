//import * as BABYLON from 'babylonjs'

import { Room } from 'colyseus.js';
import PlayerController from "./PlayerController";
import GameMenu from "./GameMenu";
import BaseLevel from "./BaseLevel";
import { Player } from "../../../server/src/entities/Player";

declare let BABYLON: any;

class MarketplaceRoom {

  public canvas: HTMLCanvasElement
  public scene: any
  private engine: any
  private camera: any
  private light?: any
  private playerId: string = 'NotYou'
  private room: Room
  private players: Map<string, PlayerController> = new Map<string, PlayerController>()
  private ground: any;
  public appData: any;
  public panelChat: any;
  public panelMenu: any;
  public gameMenu: any;
  public baseLevel: any;


  constructor(room: Room, appData: any, chatRoom: Room) {
    console.log("Marketplace")
    this.room = room;

    this.canvas = (document.getElementById('renderCanvas') as HTMLCanvasElement);
    // Load the 3D engine
    this.engine = new BABYLON.Engine( this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new BABYLON.Scene(this.engine)
    this.scene.gravity = new BABYLON.Vector3(0, -0.15, 0);
    this.scene.collisionsEnabled = true;
    this.appData = appData;

    //create base level
    this.baseLevel = new BaseLevel(this.scene, this.engine);
    this.camera = this.baseLevel.createCamera();
    this.ground = this.baseLevel.createGround();
    this.light = this.scene.lights[0];
    this.light.intensity = 200;
    this.importLevel();

    //Create Menu
    this.gameMenu = new GameMenu(chatRoom, this.camera, this.scene, appData, this.panelChat, this.panelMenu, this.room);
    this.gameMenu.createMenuXR();
    
    this.gameMenu.panelMenu.isVisible = false;
    for (let i = 0; i < this.gameMenu.panelMenu.children.length; i++) {
      this.gameMenu.panelMenu.children[i].isVisible = false;
    }

    for (const player of this.players.values()) {
      player.update();
    }

  }


  private importLevel() {

    //Import level for marketplace
    BABYLON.SceneLoader.Append("/assets/babylon/", "MarketSquare.babylon", this.scene, (newMeshes: any[]) => {
      this.scene.meshes.forEach((mesh: { name: string | string[]; checkCollisions: any; isPickable: any; visibility: boolean; }) => {

        // set colliders and whether we can pick mesh with raycast
        if (mesh.name.includes("Collider")) {
          mesh.visibility = false;
          mesh.checkCollisions = true;
          mesh.isPickable = false;
        } else if (mesh.name.includes("NPC_2")){
          //console.log("NPC", mesh)
          //Can be used later for interaction with NPCs

        }
      });
      this.light.includedOnlyMeshes = [this.scene.getMeshByName("MarketMesh")];
    });
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

export { MarketplaceRoom }