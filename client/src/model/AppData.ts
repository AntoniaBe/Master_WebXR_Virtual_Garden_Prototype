import { createHashHistory, History } from "history";

import { Room, Client } from 'colyseus.js';


class AppData {
  history: History<unknown>;
  client: Client;
  // currently joined room
  currentRoom?: Room;

  constructor() {
    this.history = createHashHistory();
    const prot = window.location.protocol.replace("http", "ws")
   /* const endpoint = `${prot}//${window.location.hostname}:3001`;*/
   const endpoint = (window.location.hostname.indexOf("heroku") >= 0 || window.location.hostname.indexOf("now.sh") >= 0 )
    ? `${ prot }//${ window.location.hostname }` // port 80 on heroku or now
    : `${ prot }//${ window.location.hostname }:3001` // port 2657 on localhost
    this.client = new Client(endpoint);
  }
}




export default AppData;