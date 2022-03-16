const express = require("express");
const app = express();
const http = require('http');
const port = process.env.PORT || 3000;
const socketio = require('socket.io');
const pairing = require('./pairing');
let total_players = 0;

app.use(express.static(`${__dirname}/public`, {
    extensions:['html']
}));

app.get('/', (req, res) => {
    res.sendFile("splash.html", {root: "./public"})
})
  
app.get('/play', (req, res) => {
    res.sendFile("game.html", {root: "./public"})
})

const server = http.createServer(app);
const io = socketio(server);

const games ={};
//guid function for clientId, gameId
const guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

//each time somebody connects, we get a new instance of this; create client ID and
//send to that specific socket connection
io.on('connection', (sock)=>{
    total_players++;
    const clientId = guid();
    const payload = {
        'total-players': total_players,
        'clientId': clientId
    }
    sock.emit('connected', JSON.stringify(payload));

    sock.on('start', message =>{
        const clientId = message;
        let gameId = null;
        let gameFound = false;
        let game = null;
        for (const [key, value] of (Object.entries(games))) {
            if (value.gameState === 1){
                gameFound = true;
                gameId = key;
                game = value;
                break;
            }
        }
        const payload = {
            "state": null,
            "message": null,
            'gameId': null,
            "color": 'blue',
            'player1Score': 0,
            'player2Score': 0
        }
        if(!gameFound){
            //no available games found so create one
            const gameId = guid();
            const pair = new pairing(gameId);
            pair.addPlayerAndConnection(clientId, sock.id);
            games[gameId] = pair;
            payload.state = 1;
            payload.message = "Waiting for another player to join"
            sock.emit('start', JSON.stringify(payload));
        }
        else{
            //found available game;
            //but check if same client
            if(game.player1 === clientId){
                payload.state = 1;
                payload.message = "You already created a game\nWait for another player"
                sock.emit("start", JSON.stringify(payload));
            }
            else{
                game.addPlayerAndConnection(clientId, sock.id);
                payload.state = 2;
                payload.message = "Game will soon begin"
                payload.gameId = gameId;
                //player1 is blue which is already set up
                io.to(game.player1Connection).emit('start', JSON.stringify(payload));
                //player2 is brown
                payload.color = 'brown';
                sock.emit('start', JSON.stringify(payload));
            }
        }
    });

    let gameId = null;
    sock.on('game-start', payload =>{
        const response = JSON.parse(payload);
        gameId = response.gameId;
        // total_games++;
        sock.join(gameId);
        // console.log('connections: ' + sock.id);
        // console.log(io.in(gameId))
        io.to(gameId).emit('game-start');
    });

    sock.on('game-move', payload =>{
        io.to(gameId).emit('game-move', payload);
    });
    sock.on('disconnect', ()=>{
        total_players--;
    });
    sock.on('leaving', () =>{
        //leaving is not disconnecing;
        io.to(gameId).emit('leaving');
    })
    sock.on('rematch-request', payload =>{
        io.to(gameId).emit('rematch-request', payload);
    })
    sock.on('rematch-accept', gameId =>{
        // total_games++;
        io.to(gameId).emit('rematch-accept');
    })
    sock.on('rematch-decline', gameId =>{
        io.to(gameId).emit('rematch-decline');
    })
});


server.on('error', (err)=>{
    console.error(err);
})

server.listen(port, ()=>{
    console.log(`Server conected to port ${port}`);
});