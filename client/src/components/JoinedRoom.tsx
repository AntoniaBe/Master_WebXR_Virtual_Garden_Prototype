import React, { Component } from 'react';
import { Client, Room } from 'colyseus.js';
import AppData from '../model/AppData';
import { Player } from "../../../server/src/entities/Player";
import { Interactable } from "../../../server/src/entities/Interactable";
import RoomMeta from '../model/RoomMeta';
import { PrivateRoom } from '../babylon/PrivateRoom'
import { MarketplaceRoom } from '../babylon/MarketplaceRoom'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogButton,
  DialogOnClosedEventT
} from '@rmwc/dialog';
import { TextField } from '@rmwc/textfield';

import '@rmwc/dialog/styles';
import '@material/textfield/dist/mdc.textfield.css';
import '@material/floating-label/dist/mdc.floating-label.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/line-ripple/dist/mdc.line-ripple.css';
import '@material/form-field/dist/mdc.form-field.css';
import '@material/dialog/dist/mdc.dialog.css';
import { TopAppBarFixedAdjust } from '@rmwc/top-app-bar';

interface State {
  newUser: boolean;
  usernameDialog: boolean;
  createUsernameButtonDisabled: boolean;
  roomMeta: RoomMeta;
}

class JoinedRoom extends Component<{ appData: AppData, match: any }, State> {
  players: { [id: string]: Player; } = {};
  usernameInput: any;
  game: any;
  private chatRoom: Room;

  constructor(props: { appData: AppData, match: any }) {
    super(props);
    this.state = { usernameDialog: false, createUsernameButtonDisabled: true, roomMeta: new RoomMeta(), newUser: true }
  }

  processCurrentRoom(client) {
    const appData: AppData = this.props.appData;
    const room = appData.currentRoom;
    if (!room) {
      return;
    }

    //Loads level depending on roomId  in URL
    if (this.props.match.params.roomId === "Marketplace") {
      this.game = new MarketplaceRoom(room, this.props.appData, this.chatRoom)
    }
    else {
      this.game = new PrivateRoom(room, this.props.appData, this.chatRoom)
    }


    //Callback methods for updating interactable state
    room.state.interactableItems.onAdd = (interactableItem: Interactable) => {

      interactableItem.plantStatus.onChange = (changes) => {
  
      }
    }

    //Callback methods for updating player state
    room.state.players.onAdd = (player: Player) => {
      this.players[player.id] = player;
      if (room.sessionId === player.id) {
        this.game.setPlayerId(player.id);
      }
      this.game.addPlayer(player)
      this.forceUpdate();

      player.playerPosition.onChange = (changes) => {
        this.game.updatePlayer(player);
        this.forceUpdate();
      }

      player.trading.onChange = (changes) => {
        this.game.updatePlayer(player);
        this.forceUpdate();
      }

      player.xrLeftHandPosition.onChange = (changes) => {
        this.game.updatePlayer(player);
        this.forceUpdate();
      }

      player.xrRightHandPosition.onChange = (changes) => {
        this.game.updatePlayer(player);
        this.forceUpdate();
      }

      player.rotation.onChange = (changes) => {
        this.game.updatePlayer(player);
        this.forceUpdate();
      }
    }

    room.state.players.onRemove = (player: Player) => {
      this.game.removePlayer(player);
      delete this.players[player.id];
      this.forceUpdate();
    }

    room.onStateChange((state) => {
      console.log("New room state:", state.toJSON());
    });
  }

  async createClientAndjoinRoom() {
    console.log("Joined Room")
    let client: Client = this.props.appData.client;
    let appData: AppData = this.props.appData;

    //Gets all available rooms
    client.getAvailableRooms().then(rooms => {
      rooms.forEach((room) => {
        if (room.roomId === this.props.match.params.roomId) {
          this.setState({ usernameDialog: false, createUsernameButtonDisabled: true, roomMeta: new RoomMeta() });
        }
      });
    });

    //let client join chat room based on roomID in URL
    this.chatRoom = await client.joinById(this.props.match.params.roomId + "_Chat");

    if (appData.currentRoom) {
      this.processCurrentRoom(client)
      return;
    }

    //let client join room based on roomID in URL
    client.joinById(this.props.match.params.roomId).then(room => {
      console.log("joined", this.props.match.params.roomId);
      this.forceUpdate();
      appData.currentRoom = room;
      room.send("username", localStorage.getItem("username"))
      let localStorageKeys = Object.keys(localStorage);
      for (let i = 0; i < localStorageKeys.length; i++) {
        if (localStorageKeys[i].includes("Seeds")) {
          room.send("addNewItem", { name: localStorageKeys[i], number: parseInt(localStorage.getItem(localStorageKeys[i])) });
        }
      }

      this.processCurrentRoom(client)
      return true;
    }).catch((msg: string) => {
      this.props.appData.history.push('/');
    })
  }

  componentDidMount() {
    localStorage.setItem("isTrading", "false");
    //if no username is stored in local storage, show username dialog otherwise let user join room
    if (localStorage.getItem("username") === null || !localStorage.getItem("username")) {
      this.setState({ usernameDialog: true, newUser: true })
    } else {
      this.setState({ usernameDialog: false, newUser: false })
      this.createClientAndjoinRoom();
    }
  }

  handleUsernameOpenWindow(evt: DialogOnClosedEventT) {
    let inputs = [this.usernameInput];

    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('input', () => {
        let values = []
        inputs.forEach(v => values.push(v.value))
        this.setState({ createUsernameButtonDisabled: values.includes('') })
      })
    }
  }

  handleUsernameCloseWindow(evt: DialogOnClosedEventT) {
    localStorage.setItem("username", this.usernameInput.value);
    localStorage.setItem("Sunflower Seeds", "5");
    localStorage.setItem("Rose Seeds", "3");
    this.setState({ usernameDialog: false })
    this.createClientAndjoinRoom();
  }

  render() {
    if (localStorage.getItem("username") === null || !localStorage.getItem("username")) {
      return (
        <Dialog
          id="userNameDialog"
          open={this.state.usernameDialog}
          onOpen={evt => {
            this.usernameInput = document.getElementById("input_username");
            this.handleUsernameOpenWindow(evt)

          }}
          onClose={evt => {
            this.handleUsernameCloseWindow(evt)
            this.setState({ usernameDialog: false })

          }}
        >
          <DialogTitle>Type in a username!</DialogTitle>
          <DialogContent>
            <div>
              <form>
                <TextField label="Username" type="text" id="input_username" />
              </form>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogButton disabled={this.state.createUsernameButtonDisabled} action="close">Ok!</DialogButton>
          </DialogActions>
        </Dialog>
      )

    } else {
      return (
        <>
          <canvas id="renderCanvas"></canvas>
        </>
      );
    }
  }
}

export { JoinedRoom };