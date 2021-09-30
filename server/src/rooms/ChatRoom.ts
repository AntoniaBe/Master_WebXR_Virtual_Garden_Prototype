import { Room } from 'colyseus';


const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


export class ChatRoom extends Room {

    // The channel where we register the room IDs.
    // This can be anything you want, it doesn't have to be `$mylobby`.
    LOBBY_CHANNEL = "gardening"
    maxClients: null;
    autoDispose = false;

    // Generate a single 4 capital letter room ID.
    generateRoomIdSingle(): string {
        let result = '';
        for (var i = 0; i < 4; i++) {
            result += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
        }
        return result;
    }


    // 1. Get room IDs already registered with the Presence API.
    // 2. Generate room IDs until you generate one that is not already used.
    // 3. Register the new room ID with the Presence API.
    async generateRoomId(): Promise<string> {
        const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
        let id;
        do {
            id = this.generateRoomIdSingle();
        } while (currentIds.includes(id));

        await this.presence.sadd(this.LOBBY_CHANNEL, this.roomId);
        return id;
    }


    // When room is initialized
   async onCreate(options: any) {
        console.log("ChatRoom created!", options);
        this.setPrivate();

        this.roomId = options.roomId || await this.generateRoomId();
        this.maxClients = options.maxClients;

        //callback method, gets username and message from client and broadcasts it to all clients back
        this.onMessage("username", (clientUsername, messageUsername) => {

            this.onMessage("message", (client, message) => {

                let now = new Date();
                let hours = now.getHours();
                let mins = now.getMinutes();
                let timeFull = hours + ":" + mins;

            
            console.log("ChatRoom received message from: ", client.sessionId, ":", message);
            this.broadcast("messages", `${messageUsername} (${timeFull}): ${message}`);

        });
        });
    }

    // When client successfully join the room
    onJoin() { }

    // When a client leaves the room
    onLeave() { }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() { }
}