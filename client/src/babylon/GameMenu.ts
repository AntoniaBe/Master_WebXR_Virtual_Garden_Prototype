
import { Room, Client, RoomAvailable } from 'colyseus.js';
import e from 'cors';

declare let BABYLON: any;

export default class GameMenu {
  private chatRoom: Room;
  private camera: any;
  private scene: any;
  private appData: any;
  public panelChat: any;
  public panelMenu: any;
  public currentRoom: Room;


  constructor(chatRoom: Room, camera: any, scene: any, appData: any, panelChat: any, panelMenu: any, currentRoom: Room) {

    this.chatRoom = chatRoom;
    this.camera = camera;
    this.scene = scene;
    this.appData = appData;
    this.panelMenu = panelChat;
    this.panelMenu = panelMenu;
    this.currentRoom = currentRoom;
  }

  createMenuXR() {

    //Chat
    let plane = BABYLON.Mesh.CreatePlane("plane", 4);
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

    let panel = new BABYLON.GUI.StackPanel();
    panel.width = "100%";
    //  panel.background= "green";
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    panel.height = "80%";
    panel.top = "200px";
    panel.left = "5px";


    let sv = new BABYLON.GUI.ScrollViewer();
    sv.thickness = 7;
    sv.color = "white";
    sv.width = "515px";
    sv.height = "250px";
    sv.background = "black";
    sv.paddingTop = "10px";
    sv.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    sv.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    panel.addControl(sv);

    let stackpanel = new BABYLON.GUI.StackPanel();
    stackpanel.height = "100%";
    stackpanel.width = "100%";
    sv.addControl(stackpanel);

    let tb = new BABYLON.GUI.TextBlock();
    tb.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    tb.lineSpacing = "10px";
    tb.paddingTop = "20px";
    tb.paddingLeft = "10px";
    tb.paddingRight = "10px"
    tb.paddingBottom = "10px";
    tb.resizeToFit = true;
    tb.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    tb.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    tb.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    tb.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    tb.color = "white";
    tb.background = "yellow";
    tb.fontSize = "16px";
    stackpanel.addControl(tb);

    this.chatRoom.onMessage("messages", (message) => {
      tb.text += message + "\n";
    });


    let inputButtonContainer = new BABYLON.GUI.StackPanel("inputButtonContainer");
    inputButtonContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    inputButtonContainer.isVertical = false;
    inputButtonContainer.height = "45px";
    panel.addControl(inputButtonContainer);

    let input = new BABYLON.GUI.InputText();
    input.width = "400px";
    input.maxWidth = "515px";
    input.height = "40px";
    input.text = "";
    input.onBeforeKeyAddObservable.add(function (input: any) {

    });

    input.color = "white";
    input.background = "black";
    input.paddingTop = "10px";
    input.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    input.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    inputButtonContainer.addControl(input);

    let sendButton = BABYLON.GUI.Button.CreateSimpleButton("sendButton", "Send");
    sendButton.width = "115px"
    sendButton.height = "30px";
    sendButton.color = "white";
    sendButton.background = "black";
    sendButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    sendButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    sendButton.onPointerUpObservable.add(() => {
      this.chatRoom.send("username", localStorage.getItem("username"));
      this.chatRoom.send("message", input.text);
      input.text = '';
    });
    inputButtonContainer.addControl(sendButton);


    advancedTexture.addControl(panel);

    let keyboard = BABYLON.GUI.VirtualKeyboard.CreateDefaultLayout();
    keyboard.paddingTop = "40px";
    keyboard.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(keyboard);

    keyboard.connect(input);

    plane.parent = this.camera;
    plane.position.z = 2.5;
    this.panelChat = plane;
    plane.isVisible = false;

    //Menu
    var manager = new BABYLON.GUI.GUI3DManager(this.scene);

    this.panelMenu = new BABYLON.GUI.PlanePanel();
    this.panelMenu.margin = 0.2;

    manager.addControl(this.panelMenu);
    this.panelMenu.position.x = this.camera.position.x + 1.5;
    this.panelMenu.position.y = this.camera.position.y - 0.15;
    this.panelMenu.position.z = this.camera.position.z + 2;

    //Enable VoiceChat -> not yet implemented
    let voiceButton = new BABYLON.GUI.HolographicButton("VoiceButton");
    this.panelMenu.addControl(voiceButton);
    voiceButton.text = "VOICE ON";


    //Open Chat Window
    let chatButton = new BABYLON.GUI.HolographicButton("ChatButton");
    this.panelMenu.addControl(chatButton);
    chatButton.text = "CHAT OFF";
    chatButton.onPointerUpObservable.add(() => {
      plane.isVisible = !plane.isVisible
      if (plane.isVisible === true) {
        chatButton.text = "CHAT ON";
      } else if (plane.isVisible === false) {
        chatButton.text = "CHAT OFF";
      }
    });


    //Show available Rooms
    let roomButtom = new BABYLON.GUI.HolographicButton("RoomButton");
    this.panelMenu.addControl(roomButtom);
    roomButtom.text = "SHOW ROOMS";
    roomButtom.onPointerUpObservable.add(() => {
      panelRooms.isVisible = !panelRooms.isVisible
      if (panelRooms.isVisible === true) {
        roomButtom.text = "HIDE ROOMS";
        for (let i = 0; i < panelRooms.children.length; i++) {
          panelRooms.children[i].isVisible = true;
        }

      } else if (panelRooms.isVisible === false) {
        roomButtom.text = "SHOW ROOMS";
        for (let i = 0; i < panelRooms.children.length; i++) {
          panelRooms.children[i].isVisible = false;
        }
      }
    });

    this.panelMenu.scaling.x = 0.35;
    this.panelMenu.scaling.y = 0.35;
    this.panelMenu.scaling.z = 0.35;
    this.panelMenu.linkToTransformNode(this.camera);
    this.panelMenu.isVisible = true;


    //Rooms
    let panelRooms = new BABYLON.GUI.PlanePanel();
    panelRooms.margin = 0.2;

    manager.addControl(panelRooms);
    panelRooms.position.x = this.camera.position.x + 1.65;
    panelRooms.position.y = this.camera.position.y - 0.75;
    panelRooms.position.z = this.camera.position.z + 2;
    panelRooms.scaling.x = 0.35;
    panelRooms.scaling.y = 0.35;
    panelRooms.scaling.z = 0.35;
    panelRooms.linkToTransformNode(this.camera);

    this.appData.client.getAvailableRooms().then((serverRoom: any) => {
      serverRoom.forEach((room: RoomAvailable) => {
        let roomsButton = new BABYLON.GUI.HolographicButton(room.metadata.name + "-Button");

        roomsButton.onPointerUpObservable.add(() => {
          let roomUrl = `/room/${room.roomId}`;
          this.appData.history.push(roomUrl);
          window.location.reload();
        })
        roomsButton.text = room.metadata.name
        panelRooms.addControl(roomsButton);
        panelRooms.isVisible = false;
        roomsButton.isVisible = false;
      })
    })

    //Trade Menu
    let tradeButton = new BABYLON.GUI.HolographicButton("TradeButton");
    this.panelMenu.addControl(tradeButton);
    tradeButton.text = "OPEN TRADE";
    tradeButton.onPointerUpObservable.add(() => {

      tradePlane.isVisible = !tradePlane.isVisible
      if (tradePlane.isVisible === true) {
        tradeButton.text = "CLOSE TRADE";
      } else if (tradePlane.isVisible === false) {
        tradeButton.text = "OPEN TRADE";
      }
    });

    let tradePlane = BABYLON.Mesh.CreatePlane("plane", 4);
    tradePlane.isVisible = false;
    let advancedTexturePlane = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(tradePlane);

    tradePlane.parent = this.camera;
    tradePlane.position.z = 2.5;

    let panelTradeContainer = new BABYLON.GUI.StackPanel();
    panelTradeContainer.width = "500px";
    panelTradeContainer.height = "400px";
    panelTradeContainer.top = "100px";
    panelTradeContainer.left = "5px";
    //panelTradeContainer.background = "green";
    panelTradeContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    panelTradeContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexturePlane.addControl(panelTradeContainer);

    let tradingItems: { name: string; number: number; }[] = [];
    let localStorageKeys = Object.keys(localStorage);
    for (let i = 0; i < localStorageKeys.length; i++) {
      if (localStorageKeys[i].includes("Seeds")) {

        let panelTrade = new BABYLON.GUI.StackPanel();
        panelTrade.width = "500px";
        panelTrade.height = "100px";
        panelTrade.top = "100px";
        panelTrade.left = "75px";
        panelTrade.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panelTrade.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        panelTradeContainer.addControl(panelTrade);

        let statesBlock = new BABYLON.GUI.Rectangle();
        statesBlock.width = '150px';
        statesBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        statesBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        statesBlock.thickness = 1;
        statesBlock.color = 'grey';
        statesBlock.background = 'white';
        panelTrade.addControl(statesBlock);

        let statesText = new BABYLON.GUI.TextBlock();
        statesText.text = localStorageKeys[i];
        statesText.fontSize = '14px';
        statesText.width = '90%';
        statesText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        statesText.color = "black";
        statesBlock.addControl(statesText);

        let countBlock = new BABYLON.GUI.Rectangle();
        countBlock.width = '200px';
        countBlock.height = "100px";
        countBlock.thickness = 1;
        countBlock.color = 'grey';
        countBlock.background = 'white';
        panelTrade.addControl(countBlock);

        let countNumber = 0;
        let countText = new BABYLON.GUI.TextBlock();
        countText.text = countNumber + " / " +  localStorage.getItem(localStorageKeys[i]) ;
        countText.fontSize = '14px';
        countText.width = '80px'
        countText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        countText.color = "black";
        countBlock.addControl(countText);

        let countDown = BABYLON.GUI.Button.CreateSimpleButton("Substract", "-");
        countDown.width = '60px';
        countDown.color = "black";
        countDown.background = "grey";
        countDown.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        countBlock.addControl(countDown);

        countDown.onPointerUpObservable.add(() => {
          let number = countNumber;
          if (number <= 0) { return }
          number += -1;
          countNumber = number;
          countText.text = number  + " / " + localStorage.getItem(localStorageKeys[i]);

          const index = tradingItems.findIndex((el) => el.name === localStorageKeys[i])

          if(index === -1){
            tradingItems.push({name: localStorageKeys[i], number: number})
          } else {
            tradingItems[index] = {
              name: localStorageKeys[i],
              number: number,
            }
          }
        
        })

        let countUp = BABYLON.GUI.Button.CreateSimpleButton("Add", "+");
        countUp.width = '60px';
        countUp.color = "black";
        countUp.background = "grey";
        countUp.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        countBlock.addControl(countUp);

        countUp.onPointerUpObservable.add(() => {
          let number = countNumber;
          let maxNumber = Number(localStorage.getItem(localStorageKeys[i]))
          if (number >= maxNumber) { return }
          number += 1;
          countNumber = number;
          countText.text = number + " / " + localStorage.getItem(localStorageKeys[i]);

          const index = tradingItems.findIndex((el) => el.name === localStorageKeys[i])

          if(index === -1){
            tradingItems.push({name: localStorageKeys[i], number: number})
          } else {
            tradingItems[index] = {
              name: localStorageKeys[i],
              number: number,
            }
          }
        })
      }
    }

    let makeTradeButton = BABYLON.GUI.Button.CreateSimpleButton("Make Trade", "Create Offer");
    makeTradeButton.paddingTop = "20px";
    makeTradeButton.color = "black";
    makeTradeButton.background = "grey";
    makeTradeButton.height = "60px";
    makeTradeButton.width = "300px";
    panelTradeContainer.addControl(makeTradeButton);

    makeTradeButton.onPointerUpObservable.add(() => {
      this.currentRoom.send("isTrading", true );
      if(localStorage.getItem("isTrading") === "true"){
            //TODO Update Offer
            console.log("Not Allowed to Make Another Offer");
      } else {
        for(let i=0; i<tradingItems.length; i++){
          if(tradingItems[i].number === 0){
            return
          } else {
             //console.log(tradingItems);
              localStorage.setItem("isTrading", "true");
              this.currentRoom.send("sendTradingItems", {name: tradingItems[i].name, number: tradingItems[i].number} );     
          }       
        }  
      }
    })
  }
}