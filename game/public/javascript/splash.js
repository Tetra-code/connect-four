const sock = io();
let clientId = null;
let gameId = null;
const btnStart = document.getElementById("btnStart");
const btnhowtoPlay = document.getElementById("btnhowtoPlay");
const btnClose = document.getElementById("btnClose");
const overlay = document.getElementById("overlay");
const statusSpan = document.getElementById('status');
const totalUsers = document.getElementById('user-online');
const totalGames = document.getElementById('total-games');
const shortestWin = document.getElementById('fast-win');


sock.on('connected', payload=>{
    const response = JSON.parse(payload);
    clientId = response.clientId;
    //client knows the client id
    console.log("client id set successfully: " + clientId)
    totalUsers.innerText = response['total-players'];
});

sock.on('start', (message)=>{
    const response = JSON.parse(message);
    statusSpan.innerText = response.message;
    if (response.state !== 1){
        sessionStorage.setItem('color', response.color);
        sessionStorage.setItem('gameId', response.gameId);
        sessionStorage.setItem('player1Score', response.player1Score);
        sessionStorage.setItem('player2Score', response.player2Score);
        setTimeout(()=>{
            window.location.href = "/play"
        }, 2000);
    }
});


//utility methods
function openHowToPlay(data){
    if(data == null) return;
    data.classList.add('active');
    overlay.classList.add('active');
}
function closeHowToPlay(data){
    if(data == null) return;
    data.classList.remove('active');
    overlay.classList.remove('active');
}

 //event listeners
btnStart.addEventListener('click', ()=>{
    sock.emit('start', clientId);
})

btnhowtoPlay.addEventListener('click', ()=>{
    //#howtoPlay
    const data = document.querySelector(btnhowtoPlay.dataset.target);
    openHowToPlay(data);
})

btnClose.addEventListener('click', ()=>{
    const data = btnClose.closest('.howtoPlay');
    closeHowToPlay(data);
})

overlay.addEventListener('click', ()=>{
    const data = document.querySelectorAll('.howtoPlay.active')
    closeHowToPlay(data);
})