import React, { Component } from 'react';
import { GridCell } from '@rmwc/grid';
import { Card, CardMedia, CardPrimaryAction } from '@rmwc/card';
import { Typography } from '@rmwc/typography';
import { History } from "history";
import { Client, RoomAvailable } from 'colyseus.js';
import RoomMeta from '../model/RoomMeta';

import '@rmwc/grid/styles';
import '@rmwc/typography/styles';
import '@rmwc/card/styles';
import '@rmwc/chip/styles';
import '@rmwc/dialog/styles';
import '@material/textfield/dist/mdc.textfield.css';
import '@material/floating-label/dist/mdc.floating-label.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/line-ripple/dist/mdc.line-ripple.css';
import '@material/form-field/dist/mdc.form-field.css';
import '@material/dialog/dist/mdc.dialog.css';


class RoomCard extends Component<{ room: RoomAvailable<RoomMeta>, client: Client, history: History<any>, onClick: any }>{

  constructor(props) {
    super(props);
    this.state = { standardDialogOpen: false }
  }

  //render room cards
  render() {
    let room: RoomAvailable<RoomMeta> = this.props.room;
    let roomMeta: RoomMeta | undefined = room.metadata;

    let backgroundImg;

    if( room.metadata.name === "Marketplace"){
      backgroundImg = 'url(/assets/images/marketplace.png'
    } else {
      backgroundImg = 'url(/assets/images/garden.png)'
    }
    return (
      <>
        <GridCell span={2} key={room.roomId}>
          <Card onClick={() => { this.props.onClick() }}>
            <CardPrimaryAction>
              <CardMedia
                sixteenByNine
                style={{
                  backgroundImage: backgroundImg
                }}
              />
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <Typography use="headline6" tag="h2" style={{ textAlign: "center"  }}>
                  {roomMeta?.name}
                </Typography>
                <Typography use="body2" tag="div"
                    theme="textSecondaryOnBackground"  style={{ textAlign: "center"  }}>
                  {roomMeta?.description}
                </Typography>
                <Typography
                  use="subtitle2"
                  tag="h3"
                  theme="textSecondaryOnBackground"
                  style={{ textAlign: "center"  }}
                >
                  {room.clients}/{room.maxClients || '∞'} player
                </Typography>
              </div>
            </CardPrimaryAction>
          </Card>
        </GridCell>

      </>
    );
  }
}

export { RoomCard };
