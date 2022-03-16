const pairing = function() {
    this.player1 = null;
    this.player2 = null;
    this.player1Connection = null;
    this.player2Connection = null;
    this.gameState = 0; 
    //"0" means 0 players,  "1" means 1 player, "2" means 2 players
};

pairing.prototype.addPlayerAndConnection = function(p, c) {
    if (this.gameState == 2) {
        return new Error(
        `Invalid call. This pairing is full`
        );
    }
    if (this.player1 == null) {
        this.player1 = p;
        this.player1Connection = c;
        this.gameState = 1;
        return "1";
    } 
    else {
        this.player2 = p;
        this.player2Connection = c;
        this.gameState = 2;
        return "2";
    }
};

module.exports = pairing;