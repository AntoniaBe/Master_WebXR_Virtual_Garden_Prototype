import React, { Component } from 'react';
import { Icon } from '@rmwc/icon';
import {
  TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle,
  TopAppBarFixedAdjust
} from '@rmwc/top-app-bar';
import { Grid, GridCell } from '@rmwc/grid';
import { Card, CardPrimaryAction } from '@rmwc/card';
import { Typography } from '@rmwc/typography';
import { RoomAvailable, Client } from 'colyseus.js';
import { TextField } from '@rmwc/textfield';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogButton,
  DialogOnClosedEventT
} from '@rmwc/dialog';

import '@rmwc/icon/styles';
import '@rmwc/top-app-bar/styles';
import '@rmwc/select/styles';
import '@rmwc/card/styles';
import '@rmwc/grid/styles';
import '@rmwc/typography/styles';
import '@rmwc/dialog/styles';
import '@material/textfield/dist/mdc.textfield.css';
import '@material/floating-label/dist/mdc.floating-label.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/line-ripple/dist/mdc.line-ripple.css';
import '@material/form-field/dist/mdc.form-field.css';
import '@material/dialog/dist/mdc.dialog.css';

import AppData from '../model/AppData';
import RoomMeta from '../model/RoomMeta';
import { RoomCard } from './RoomCard';

interface State {
  createRoomDialog: boolean;
  joinRoomDialog: boolean;
  createButtonDisabled: boolean;
  createUsernameButtonDisabled: boolean;
  joinButtonDisabled: boolean;
  chosenRoomState: any;
  errorDialog: boolean;
  usernameDialog: boolean;
}


class RoomList extends Component<{ appData: AppData }, State> {
  rooms: RoomAvailable<RoomMeta>[] = [];
  createRoomNameInput: any;
  createRoomNameSetPassword: any;
  joinRoomPasswordInput: any;
  usernameInput: any;


  constructor(props: { appData: AppData, match: any }) {
    super(props);
    this.state = { createRoomDialog: false, joinRoomDialog: false, createButtonDisabled: true, joinButtonDisabled: true, chosenRoomState: null, errorDialog:false, usernameDialog: false, createUsernameButtonDisabled: true }
  }

  componentDidMount() {
    //if no username is stored in local storage, show username dialog otherwise let user join room
    if (localStorage.getItem("username") === null || !localStorage.getItem("username") ) {
      this.setState({ usernameDialog: true })
    } else {
      this.setState({ usernameDialog: false })
    }

    let client: Client = this.props.appData.client;
    client.getAvailableRooms().then(serverRoom => {
      serverRoom.forEach((room: RoomAvailable<RoomMeta>) => {
        this.rooms.push(room);
        this.forceUpdate();
      })

    });
  }

  joinRoom(roomId: string) {
    let roomUrl = `/room/${roomId}`;
    this.props.appData.history.push(roomUrl);
  }


  handleJoinRoomWindowClose(evt: DialogOnClosedEventT) {
    if (evt.detail.action === "accept") {

      if (this.joinRoomPasswordInput.value === this.state.chosenRoomState.room.metadata.password) {
        this.joinRoom(this.state.chosenRoomState.room.roomId)
      } else {
        this.setState({ errorDialog: true })
      }

    } else {
      this.joinRoomPasswordInput.value = '';
    }
  }

  handleCreateRoomWindowOpen(evt: DialogOnClosedEventT) {
    let inputs = [this.createRoomNameInput, this.createRoomNameSetPassword]
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('input', () => {
        let values = []
        inputs.forEach(v => values.push(v.value))
        this.setState({ createButtonDisabled: values.includes('') })
      })
    }
  }

  handleCreateRoomWindowClose(evt: DialogOnClosedEventT) {
    if (evt.detail.action === "accept") {
      this.props.appData.client.create("game_room", { password: String(this.createRoomNameSetPassword.value), name: this.createRoomNameInput.value, maxClients: 5 }).then(room => {
        console.log("joined successfully", room);
        this.props.appData.currentRoom = room;
        this.joinRoom(room.id);

     //Create ChatRoom for private room
      this.props.appData.client.create("chat_room", { roomId: room.id + "_Chat", name: room.id + "_Chat", maxClients: 5 })
      
      }).catch(e => {
        console.error("join error", e);
      });
    }
  }

  isJoinRoomInputAvailable(evt) {
    this.joinRoomPasswordInput = document.querySelector(".mdc-dialog--open #input_joinRoom_password");

    if (!this.joinRoomPasswordInput) {
      setTimeout(() => this.isJoinRoomInputAvailable(evt), 100)
      return
    }
  }


  handleUsernameOpenWindow(evt: DialogOnClosedEventT) {
    let inputs = [this.usernameInput];

    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('input', () => {
        let values = []
        inputs.forEach(v => values.push(v.value))
        this.setState({ createButtonDisabled: values.includes('') })
        this.setState({ createUsernameButtonDisabled: values.includes('') })
      })
      }
    }

    handleUsernameCloseWindow(evt: DialogOnClosedEventT) {
      localStorage.setItem("username", this.usernameInput.value);
      localStorage.setItem("Sunflower Seeds", "5");
      localStorage.setItem("Rose Seeds", "3");
      }
  

  render() {
    let rows: any[] = [];
    this.rooms.forEach((room: RoomAvailable<RoomMeta>) => {
      rows.push((<RoomCard
        onClick={() => {
          if (room.roomId === "Marketplace") {
            this.joinRoom(room.roomId)
          } else {
            this.setState({ joinRoomDialog: true, chosenRoomState: { client: this.props.appData.client, room: room, history: this.props.appData.history, key: room.roomId } })
          }
        }}
        key={room.roomId}
        client={this.props.appData.client}
        room={room}
        history={this.props.appData.history} />));

    });
    return (
      <>
        <TopAppBar>
          <TopAppBarRow>
            <TopAppBarSection>
              <TopAppBarTitle>Welcome {localStorage.getItem("username")}!</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
            </TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        <TopAppBarFixedAdjust />

        <Grid>
          <GridCell span={12}>
          </GridCell>
        </Grid>

        <Grid>
          <GridCell span={2}>
            <Card onClick={() => {
              this.setState({ createRoomDialog: true })
            }}>
              <CardPrimaryAction>
                <div style={{ padding: '0 1rem 1rem 1rem' }}>
                  <Typography use="headline6" tag="h2">
                    <Icon icon={{
                      icon: 'add_circle',
                      strategy: 'ligature'
                    }}></Icon> New Room
                  </Typography>
                  <Typography
                    use="body1"
                    tag="div"
                    theme="textSecondaryOnBackground"
                  >
                    Click here to create a new Room.
                  </Typography>
                </div>
              </CardPrimaryAction>
            </Card>
          </GridCell>
          {rows}
        </Grid>


        <Dialog
          open={this.state.createRoomDialog}
          onOpen={evt => {
            this.createRoomNameInput = document.getElementById("input_createRoom_name");
            this.createRoomNameSetPassword = document.getElementById("input_createRoom_password");
            this.handleCreateRoomWindowOpen(evt)
          }}
          onClose={evt => {
            this.handleCreateRoomWindowClose(evt)
            this.setState({ createRoomDialog: false })
          }}
        >
          <DialogTitle>Create a Room!</DialogTitle>
          <DialogContent>
            <div>
              <form>
                <TextField label="Room Name" type="text" id="input_createRoom_name" />
                <br></br>
                <br></br>
                <TextField label="Password" type="text" id="input_createRoom_password" />
              </form>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogButton action="close">Cancel</DialogButton>
            <DialogButton action="accept" disabled={this.state.createButtonDisabled} isDefaultAction>Create</DialogButton>
          </DialogActions>
        </Dialog>


        <Dialog
          open={this.state.joinRoomDialog}
          onOpen={evt => {
            this.isJoinRoomInputAvailable(evt)
          }}
          onClose={evt => {
            this.handleJoinRoomWindowClose(evt)
            this.setState({ joinRoomDialog: false })
          }}
        >
          <DialogTitle>Type in Room Password</DialogTitle>
          <DialogContent>
            <div>
              <form>
                <TextField label="Password" type="text" id="input_joinRoom_password" />
              </form>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogButton action="close">Cancel</DialogButton>
            <DialogButton action="accept" isDefaultAction>Join Room</DialogButton>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.errorDialog}
          onOpen={evt => {

          }}
          onClose={evt => {
            this.setState({ errorDialog: false })
          }}
        >
          <DialogTitle>Wrong Password!</DialogTitle>
          <DialogContent>
          </DialogContent>
          <DialogActions>
            <DialogButton action="close">Try again</DialogButton>
          </DialogActions>
        </Dialog>


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
            <DialogButton  disabled={this.state.createUsernameButtonDisabled} action="close">Ok!</DialogButton>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

export { RoomList };
