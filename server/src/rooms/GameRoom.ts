import { Room, Client } from "colyseus";

import { StateHandler } from "../entities/StateHandler";
import { Player, ItemSeeds } from "../entities/Player";
import { Interactable } from "../entities/Interactable";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export class GameRoom extends Room<StateHandler> {
    maxClients: null;
    autoDispose = false;

    // The channel where we register the room IDs.
    // This can be anything you want, it doesn't have to be `$mylobby`.
    LOBBY_CHANNEL = "gardening"
    password: string;
    description: string;

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

    async onCreate(options) {
        this.setState(new StateHandler());
        this.setSimulationInterval(() => this.onUpdate());
        this.setMetadata(options);
        this.roomId = options.roomId || await this.generateRoomId();
        this.password = options.password;
        this.maxClients = options.maxClients;
        this.description = options.description;

        console.log("Room created!", options);

        this.onMessage("key", (client, message) => {
            this.state.players.get(client.sessionId).pressedKeys = message;
        });

        this.onMessage("xr", (client, message) => {
            this.state.players.get(client.sessionId).isXR = message;
        });

        this.onMessage("xrCameraPosition", (client, message) => {
            this.state.players.get(client.sessionId).xrCameraPosition = message;
        });

        this.onMessage("xrCameraRotation", (client, message) => {
            this.state.players.get(client.sessionId).xrCameraRotation = message;
        });

        this.onMessage("isTrading", (client, message) => {
            this.state.players.get(client.sessionId).trading.isTrading = message;
        });

        this.onMessage("playerPosition", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.playerPosition.x = message.x;
            player.playerPosition.y = message.y;
            player.playerPosition.z = message.z;
        });

        this.onMessage("username", (client, message) => {
            this.state.players.get(client.sessionId).name = message;
        });

        this.onMessage("addNewItem", (client, message) => {
            this.state.players.get(client.sessionId).itemSeeds.push(new ItemSeeds(message.name, message.number));
        });

        this.onMessage("sendTradingItems", (client, message) => {
            this.state.players.get(client.sessionId).tradingItems.push(new ItemSeeds(message.name, message.number));
        });


        this.onMessage("updateItems", (client, message) => {
            let itemSeeds = this.state.players.get(client.sessionId).itemSeeds;
            for (let i = 0; i < itemSeeds.length; i++) {
                if (message.name === itemSeeds[i].plantName) {
                    itemSeeds[i].seedCount = message.number;
                }
            }
        });

        this.onMessage("xrLeftHandPos", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.xrLeftHandMovement.x = message.x;
            player.xrLeftHandMovement.y = message.y;
            player.xrLeftHandMovement.z = message.z;
        });

        this.onMessage("xrRightHandPos", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.xrRightHandMovement.x = message.x;
            player.xrRightHandMovement.y = message.y;
            player.xrRightHandMovement.z = message.z;
        });
        

        this.onMessage("plantSatus", (client, message) => {
            const interactablePlant = this.state.interactableItems.get("plantID");
      
            interactablePlant.plantStatus.lastWateredBy = message;
            interactablePlant.plantStatus.currentWateringCount += 1;
        });
    }


    onJoin(client, options, isNew) {
        console.log('onJoin(', client.id, ')', options);
        const player = new Player();
        this.onMessage("username", (client, message) => {
            this.state.players.get(client.sessionId).name = message;
        });

        this.onMessage("xr", (client, message) => {
            this.state.players.get(client.sessionId).isXR = message;
        });

        player.id = client.sessionId;
        player.playerPosition.x = -6;
        player.playerPosition.y = 0;
        player.playerPosition.z = -4;

        this.state.players.set(client.sessionId, player);


        const interactable = new Interactable();
        interactable.interactableType = "plant";
        interactable.plantStatus.plantName = "Flower xy";
        interactable.plantStatus.currentWateringCount = 0;
        interactable.plantStatus.maxWateringCount = 2;
        interactable.plantStatus.lastWateredBy = null;

        this.state.interactableItems.set("plantID", interactable);


    }

    onUpdate() {
        this.state.players.forEach((player, sessionId) => {
            if (player.isXR == true) {
                player.playerPosition.x = player.xrCameraPosition.x;
                player.playerPosition.y = player.xrCameraPosition.y;
                player.playerPosition.z = player.xrCameraPosition.z;
                player.rotation.y = player.xrCameraRotation.y;

                player.xrLeftHandPosition.x = player.xrLeftHandMovement.x;
                player.xrLeftHandPosition.y = player.xrLeftHandMovement.y;
                player.xrLeftHandPosition.z = player.xrLeftHandMovement.z;

                player.xrRightHandPosition.x = player.xrRightHandMovement.x;
                player.xrRightHandPosition.y = player.xrRightHandMovement.y;
                player.xrRightHandPosition.z = player.xrRightHandMovement.z;

            } else {
                player.playerPosition.x += player.pressedKeys.x * 0.1;
                player.playerPosition.z -= player.pressedKeys.y * 0.1
            }
        });
    }

    onLeave(client: Client, consented: boolean) {
        console.log('onLeave(', client.id, ')');
        this.state.players.delete(client.sessionId);
        this.state.interactableItems.delete("plantID");
    }


    async onDispose() {
        console.log("Dispose Room");
        this.presence.srem(this.LOBBY_CHANNEL, this.roomId);

    }

}