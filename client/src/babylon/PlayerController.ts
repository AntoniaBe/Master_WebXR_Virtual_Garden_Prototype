import PlayerMovement from "./PlayerMovement";
import { Player } from "../../../server/src/entities/Player";
import { Room, Client } from "colyseus.js";
import {
  XRCameraPosition, XRCameraRotation, XRLeftHandMovement, XRRightHandMovement
} from "../../../server/src/entities/Player";
declare let BABYLON: any;



export default class PlayerController {
  public room: Room;
  public scene: any;
  public engine: any;
  public playerControls: any;
  private _controllable: boolean = false;
  private _playerModel: Player;
  private camera: any;
  public leftHandMesh: any;
  public rightHandMesh: any;
  public bodyMeshWithoutHands: any;
  public bodyMeshWithHands: any;
  public bodyMeshContainer: any;
  public xr: any;
  public userNameText: any;
  public tradingInfo: any;
  public xrCameraPosition: XRCameraPosition = { x: 0, y: 0, z: 0 };
  public xrCameraRotation: XRCameraRotation = { x: 0, y: 0, z: 0 };
  public xrLeftHandMovement: XRLeftHandMovement = { x: 0, y: 0, z: 0 };
  public xrRightHandMovement: XRRightHandMovement = { x: 0, y: 0, z: 0 };
  public movementFeature: any;
  public xrLeftHand: any;
  public xrRightHand: any;
  public ground: any;
  public appData: Client;
  private chatPanel: any;
  private menuPanel: any;
  public rotationAngle: number = Math.PI / 8;
  private panel: any;


  constructor(room: Room, scene: any, controllable: boolean = false, playerModel: Player, camera: any, engine: any, ground: any, appData: Client, chatPanel: any, menuPanel: any) {
    this.room = room;
    this.camera = camera;
    this.scene = scene;
    this.engine = engine;
    this._controllable = controllable;
    this._playerModel = playerModel;
    this.ground = ground;
    this.appData = appData;
    this.chatPanel = chatPanel;
    this.menuPanel = menuPanel;


    //Create Avatar with username and trading info
    BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = false;
    BABYLON.OBJFileLoader.COMPUTE_NORMALS = true;
    this.leftHandMesh = BABYLON.Mesh.CreateSphere("leftHand", 32, 1, this.scene);
    this.rightHandMesh = BABYLON.Mesh.CreateSphere("rightHand", 32, 1, this.scene);
    this.leftHandMesh.position.y = 0.45;
    this.leftHandMesh.position.x = -0.25;
    this.leftHandMesh.position.z = 0.4;
    this.leftHandMesh.scaling.x = 0.25;
    this.leftHandMesh.scaling.y = 0.25;
    this.leftHandMesh.scaling.z = 0.25;

    this.rightHandMesh.position.y = 0.45;
    this.rightHandMesh.position.x = 0.25;
    this.rightHandMesh.position.z = 0.4;
    this.rightHandMesh.scaling.x = 0.25;
    this.rightHandMesh.scaling.y = 0.25;
    this.rightHandMesh.scaling.z = 0.25;

    let usernamePlane = BABYLON.Mesh.CreatePlane("outputplane", 2, this.scene, false);
    usernamePlane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
    usernamePlane.material = new BABYLON.StandardMaterial("outputplane", this.scene);
    usernamePlane.position = new BABYLON.Vector3(0, 2, 0);

    let usernamePlaneTexture = new BABYLON.DynamicTexture("dynamic texture", 420, this.scene, true);
    usernamePlane.material.diffuseTexture = usernamePlaneTexture;
    usernamePlane.material.diffuseTexture.hasAlpha = true;
    usernamePlane.useAlphaFromDiffuseTexture = true;
    usernamePlane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    usernamePlane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    usernamePlane.material.backFaceCulling = false;


    setTimeout(() => usernamePlaneTexture.drawText(this._playerModel.name, null, 220, "bold 55px verdana", "white", "#00000000"), 500);
    this.userNameText = usernamePlane;


    let tradingInfoPlane = BABYLON.Mesh.CreatePlane("outputplane", 2, this.scene, false);
    tradingInfoPlane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
    tradingInfoPlane.material = new BABYLON.StandardMaterial("outputplane", this.scene);
    tradingInfoPlane.position = new BABYLON.Vector3(0, 2, 0);
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(tradingInfoPlane);

    this.panel = new BABYLON.GUI.StackPanel();
    this.panel.width = "800px";
    this.panel.height = "450px";
    this.panel.background = "green";
    advancedTexture.addControl(this.panel);


    let tb = new BABYLON.GUI.TextBlock();
    tb.text = "Trade Offer!";
    tb.height = "150px";
    tb.fontSize = "80px";

    this.panel.addControl(tb);

    this.tradingInfo = tradingInfoPlane;

    BABYLON.SceneLoader.ImportMesh("", "/assets/obj/dog/", "character_dog.obj", this.scene, (newMeshes: any[]) => {
      let bodyMesh = newMeshes[0];
      bodyMesh.isPickable = false;

      BABYLON.SceneLoader.ImportMesh("", "/assets/obj/dog/", "character_dogHead.obj", this.scene, (newMeshes: any[]) => {
        let meshes: any[] = [];
        newMeshes.forEach(function (mesh: any) {
          meshes.push(mesh);
        });
        let headMesh = BABYLON.Mesh.MergeMeshes(meshes, true, false, undefined, false, true);
        headMesh.isPickable = false;

        this.bodyMeshContainer = BABYLON.Mesh.MergeMeshes([headMesh, bodyMesh], true, false, undefined, false, true);
        this.bodyMeshWithHands = BABYLON.Mesh.MergeMeshes([this.bodyMeshContainer.clone(), this.leftHandMesh.clone(), this.rightHandMesh.clone()], true, false, undefined, false, true);

        this.bodyMeshWithHands.parent = this.bodyMeshContainer;

        this.bodyMeshWithHands.isPickable = false;
        this.bodyMeshContainer.isPickable = false;
        this.leftHandMesh.isPickable = false;
        this.rightHandMesh.isPickable = false;

        this.leftHandMesh.material = this.bodyMeshWithHands.material;
        this.rightHandMesh.material = this.bodyMeshWithHands.material;
        this.leftHandMesh.visibility = false;
        this.rightHandMesh.visibility = false;

        //enable player movement in desktop mode
        this.playerControls = new PlayerMovement(this.room, this.bodyMeshContainer);
        this.updatePlayer();
      });
    });

    //Enable XR
    this.initXR();
    //Default Mode is non XR Mode
    this.room.send("xr", false);
    this.scene.registerBeforeRender(() => {
    })
  }


  public get controllable(): boolean {
    return this._controllable
  }

  public get playerModel() {
    return this._playerModel;
  }

  public updatePlayer() {
    const playerModel: Player = this._playerModel;

    if (!this.bodyMeshContainer) {
      return
    }

    if (this._playerModel.trading.isTrading === true) {
      this.tradingInfo.visibility = true;

      for (let i = 0; i < this._playerModel.tradingItems.length; i++) {

        let tb = new BABYLON.GUI.TextBlock();
        tb.text = this._playerModel.tradingItems[i].plantName + " " + this._playerModel.tradingItems[i].seedCount;
        tb.height = "150px";
        tb.fontSize = "80px";

        this.panel.addControl(tb);

      }
      this.tradingInfo.position.set(
        playerModel.playerPosition.x,
        playerModel.playerPosition.y + 2.7,
        playerModel.playerPosition.z
      )
    } else {
      this.tradingInfo.visibility = false;
    }

    this.userNameText.position.set(
      playerModel.playerPosition.x,
      playerModel.playerPosition.y + 2,
      playerModel.playerPosition.z
    )

    if (playerModel.isXR === true) {
      this.bodyMeshWithHands.visibility = false;
      this.leftHandMesh.visibility = true;
      this.rightHandMesh.visibility = true;
    }

    this.bodyMeshContainer.position.set(
      playerModel.playerPosition.x,
      playerModel.playerPosition.y,
      playerModel.playerPosition.z
    )

    this.bodyMeshContainer.rotation.set(
      playerModel.rotation.x,
      playerModel.rotation.y,
      playerModel.rotation.z
    )

    this.leftHandMesh.position.set(
      playerModel.xrLeftHandPosition.x,
      playerModel.xrLeftHandPosition.y,
      playerModel.xrLeftHandPosition.z
    )

    this.leftHandMesh.rotation.y = playerModel.rotation.y;

    this.rightHandMesh.position.set(
      playerModel.xrRightHandPosition.x,
      playerModel.xrRightHandPosition.y,
      playerModel.xrRightHandPosition.z
    )
    this.rightHandMesh.rotation.y = playerModel.rotation.y;


    if (this._controllable) {
      this.camera.parent = this.bodyMeshContainer;
      this.bodyMeshContainer.visibility = false;
      this.tradingInfo.visibility = false;
      this.userNameText.visibility = false;
      this.leftHandMesh.visibility = false;
      this.rightHandMesh.visibility = false;
    }
  }

  public update(playerModel?: Player) {
    if (playerModel) {
      this._playerModel = playerModel;
    }
    this.updatePlayer()
  }

  remove() {

    if (this.bodyMeshContainer) {
      this.userNameText.dispose();
      this.bodyMeshContainer.dispose();
      this.bodyMeshWithHands.dispose();
      this.tradingInfo.dispose();
      this.leftHandMesh.dispose();
      this.rightHandMesh.dispose();
    }
  }


  //enable xr-session
  private async initXR() {
    this.xr = await this.scene.createDefaultXRExperienceAsync({
      floorMeshes: [this.ground],
      disableTeleportation: true,
    });

    //swap hand configuration, so that left hand is used for movement and right hand for rotation
    const swappedHandednessConfiguration = [
      {
        allowedComponentTypes: [
          BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE,
          BABYLON.WebXRControllerComponent.TOUCHPAD_TYPE,
        ],
        forceHandedness: "right",
        axisChangedHandler: (
          axes: { x: number; y: number; },
          movementState: { rotateX: any; rotateY: any; },
          featureContext: { rotationThreshold: number; },
          xrInput: any
        ) => {
          movementState.rotateX =
            Math.abs(axes.x) > featureContext.rotationThreshold
              ? axes.x
              : 0;

          movementState.rotateY =
            Math.abs(axes.y) > featureContext.rotationThreshold
              ? axes.y
              : 0;
        },
      },
      {
        allowedComponentTypes: [
          BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE,
          BABYLON.WebXRControllerComponent.TOUCHPAD_TYPE,
        ],
        forceHandedness: "left",
        axisChangedHandler: (
          axes: { x: number; y: number; },
          movementState: { moveX: any; moveY: any; },
          featureContext: { movementThreshold: number; },
          xrInput: any
        ) => {
          movementState.moveX =
            Math.abs(axes.x) > featureContext.movementThreshold
              ? axes.x
              : 0;
          movementState.moveY =
            Math.abs(axes.y) > featureContext.movementThreshold
              ? axes.y
              : 0;
        },
      },
    ]

    //Get feature Manager to enable or deactivate modules
    const featureManager = this.xr.baseExperience.featuresManager;
    featureManager.disableFeature(BABYLON.WebXRFeatureName.TELEPORTATION);

    //Enable Movement with controller
    this.movementFeature = featureManager.enableFeature(
      BABYLON.WebXRFeatureName.MOVEMENT,
      "latest",
      {
        xrInput: this.xr.input,
        // add options here
        customRegistrationConfigurations: swappedHandednessConfiguration,
        movementOrientationFollowsViewerPose: true, // default true,
        movementSpeed: 0.1,
        rotationSpeed: 0.5,
      }
    );


    this.xr.baseExperience.onStateChangedObservable.add((webXRState: any) => {
      switch (webXRState) {
        case BABYLON.WebXRState.ENTERING_XR:
          break;
        case BABYLON.WebXRState.IN_XR:

        //deactivates menu at first when in xr mode
          this.menuPanel.isVisible = false;
          for (let i = 0; i < this.menuPanel.children.length; i++) {
            this.menuPanel.children[i].isVisible = false;
          }

          //positioning of chat panel
          this.chatPanel.position.z = 2.5;

          this.room.send("xr", true);
          this.xr.input.xrCamera.applyGravity = true;
          this.xr.input.xrCamera.checkCollisions = true;
          this.xr.input.xrCamera.ellipsoid = new BABYLON.Vector3(0.1, 0.625, 0.1);

          //send first camera position to server
          this.xrCameraPosition.x = this.xr.input.xrCamera.position.x;
          // this.xrCameraPosition.y = this.xr.input.xrCamera.position.y;
          this.xrCameraPosition.z = this.xr.input.xrCamera.position.z + 0.5;
          this.room.send("xrCameraPosition", this.xrCameraPosition);

          break;

        case BABYLON.WebXRState.EXITING_XR:

          this.menuPanel.linkToTransformNode(this.camera);
          this.chatPanel.parent = this.camera;
          this.chatPanel.position.z = 2.5;

          this.menuPanel.isVisible = true;
          for (let i = 0; i < this.menuPanel.children.length; i++) {
            this.menuPanel.children[i].isVisible = true;
          }
          break;
        default:
          this.room.send("xr", false);
          break;
      }
    });


    // XR-way of interacting with the controllers for the left and right hand:
    this.xr.input.onControllerAddedObservable.add((controller: { onMotionControllerInitObservable: { add: (arg0: (motionController: any) => void) => void; }; grip: { position: any; }; }) => {
      controller.onMotionControllerInitObservable.add((motionController: { rootMesh: any; handness: string; onModelLoadedObservable: { add: (arg0: (mc: any) => void) => void; }; getComponentIds: () => any; getComponent: (arg0: any) => any; }) => {

        if (motionController.handness === "left") {

          //set left hand model
          motionController.onModelLoadedObservable.add((mc: any) => {
            this.xrLeftHand = controller.grip;
          })

          const xr_ids = motionController.getComponentIds();
          let thumbstickComponent = motionController.getComponent(xr_ids[2]);//xr-standard-thumbstick

          thumbstickComponent.onButtonStateChangedObservable.add(() => {
            if (thumbstickComponent.pressed) {

            }
          });
          thumbstickComponent.onAxisValueChangedObservable.add((axes: any) => {

            //Check if Thumbstick is used and send camera position to server
            this.xrCameraPosition.x = this.xr.input.xrCamera.position.x;
            //this.xrCameraPosition.y = this.xr.input.xrCamera.position.y;
            this.xrCameraPosition.z = this.xr.input.xrCamera.position.z + 0.5;
            this.room.send("xrCameraPosition", this.xrCameraPosition);
          });


        } else if (motionController.handness === "right") {

          //set right hand model
          motionController.onModelLoadedObservable.add((mc: any) => {
            this.xrRightHand = controller.grip;

          })

          const xr_ids = motionController.getComponentIds();

          //check if b-button on right controller is pressed
          let bbuttonComponent = motionController.getComponent(xr_ids[4]);//b-button
          bbuttonComponent.onButtonStateChangedObservable.add(() => {
            if (bbuttonComponent.pressed) {

              //activate / deactivate menu
              this.menuPanel.isVisible = !this.menuPanel.isVisible;
              for (let i = 0; i < this.menuPanel.children.length; i++) {
                this.menuPanel.children[i].isVisible = !this.menuPanel.children[i].isVisible;
              }
            }
          })

          this.scene.onPointerObservable.add((pointerInfo: any) => {
            switch (pointerInfo.type) {
              case BABYLON.PointerEventTypes.POINTERDOWN:
                //console.log('POINTER DOWN', pointerInfo)
                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh) {
                  // "Grab" it by attaching the picked mesh to the VR Controller
                  let xrInput = this.xr.pointerSelection.getXRControllerByPointerId(pointerInfo.event.pointerId)
                  if (xrInput) {
                    if (motionController) {
                      if (pointerInfo.pickInfo.pickedMesh.name === "Wateringcan") {
                        if (BABYLON.Vector3.Distance(this.xr.input.xrCamera.position, pointerInfo.pickInfo.pickedMesh.position) < 3) {
                          pointerInfo.pickInfo.pickedMesh.rotation.y = 3;
                          pointerInfo.pickInfo.pickedMesh.setParent(motionController.rootMesh)
                        }
                      }
                    }
                  }
                }
                break;
              case BABYLON.PointerEventTypes.POINTERUP:
                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh) {
                  // "Grab" it by attaching the picked mesh to the VR Controller
                  let xrInput = this.xr.pointerSelection.getXRControllerByPointerId(pointerInfo.event.pointerId)
                  if (xrInput) {
                    if (motionController) {

                      if (pointerInfo.pickInfo.pickedMesh.name === "Wateringcan") {
                        pointerInfo.pickInfo.pickedMesh.setParent(null)
                        // pointerInfo.pickInfo.pickedMesh.setParent(null)
                        this.scene.getMeshByName("Wateringcan").position.y = 0.5;
                        //this.scene.getMeshByName("Wateringcan").rotation.y = 0;
                        this.scene.getMeshByName("Wateringcan").rotation.z = 0;
                        this.scene.getMeshByName("Wateringcan").rotation.x = -1.4;
                        //this.scene.getMeshByName("Wateringcan").rotation = new BABYLON.Vector3(0, 0, 0);
                      }
                    }
                  }
                }
                break;

              case BABYLON.PointerEventTypes.POINTERMOVE:

                break;
              default: break
            }
          })
        }
      });
    });

    //Checks for every xrFrame 
    this.xr.baseExperience.sessionManager.onXRFrameObservable.add(() => {
      if (this.xr.baseExperience.state === BABYLON.WebXRState.IN_XR) {

        //Tell server that we are still in xr mode
        this.room.send("xr", true);

        //send camera rotation to server
        this.xrCameraRotation.y = this.movementFeature.movementDirection.toEulerAngles().y
        this.room.send("xrCameraRotation", this.xrCameraRotation);
        //this.xr.input.xrCamera.position.y = 1.25;

        //send right and left hand mesh position to server, to that other users see our hand movement
        if (this.xrLeftHand && this.xrRightHand) {

          this.xrLeftHandMovement.x = this.xrLeftHand.position.x;
          this.xrLeftHandMovement.y = this.xrLeftHand.position.y;
          this.xrLeftHandMovement.z = this.xrLeftHand.position.z;

          this.xrRightHandMovement.x = this.xrRightHand.position.x;
          this.xrRightHandMovement.y = this.xrRightHand.position.y;
          this.xrRightHandMovement.z = this.xrRightHand.position.z;

          this.room.send("xrLeftHandPos", this.xrLeftHandMovement);
          this.room.send("xrRightHandPos", this.xrRightHandMovement);
        }


      }
    });
  }


}