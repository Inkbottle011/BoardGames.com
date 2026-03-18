import { GameAPI } from "../game";
import echo from "../echo";

// get the game ID from your blade template
const gameId = document.querySelector("[data-game-id]").dataset.gameId;

// 1. join the websocket channel
echo.join(`game.${gameId}`)
    .here((players) => {
        console.log("Players in room:", players);
    })
    .joining((player) => {
        console.log(`${player.name} joined`);
    })
    .leaving((player) => {
        console.log(`${player.name} left`);
    })
    .listen("PlayerMoved", (e) => {
        console.log("Player moved:", e);
        // update your game UI here
    });

// 2. wire up your game actions
document.querySelector("#move-btn").addEventListener("click", async () => {
    const position = { x: 1, y: 2 }; // whatever your game uses

    try {
        await GameAPI.move(gameId, position);
    } catch (error) {
        console.error("Move failed:", error);
    }
});
