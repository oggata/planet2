var Coin = cc.Node.extend({
    ctor: function (game, col, row) {
        this._super();
        this.game = game;
        this.col = col;
        this.row = row;

        var _rand = this.game.getRandNumberFromRange(1, 10);
        if(_rand == 1){
            this.itemType = 2;
        }else{
            this.itemType = 1;
        }

        if(this.itemType == 1){
            this.sprite = cc.Sprite.create("res/bit_coin.png");
        }else if(this.itemType == 2){
            this.sprite = cc.Sprite.create("res/bit_bomb.png");
        }else{
            this.sprite = cc.Sprite.create("res/bit_bomb.png");
        }
        this.addChild(this.sprite);
        this.isGotCnt = 0;
        this.debriScale = 1;
    },
    init: function () {},

    update: function () {
        if (this.isGotCnt >= 1) {
            this.isGotCnt++;
            switch (this.itemType){
              case 1:
                this.setPosition(this.getPosition().x, this.getPosition().y + this.isGotCnt * 1.3);
                this.debriScale += 0.04;
                this.sprite.setScale(this.debriScale, this.debriScale);
                if (this.isGotCnt >= 30 * 1) {
                    this.game.score += 1;
                    return false;
                }
                break;
              case 2:
                if (this.isGotCnt >= 30 * 1) {
                    this.useBomb();
                    return false;
                }
                break;
              case 3:
                break;
            }
        }
        if (this.game.gameStatus == "gameover") {
            return false;
        }
        return true;
    },

    useBomb: function () {
        cc.log(this.game.player.lastDigBlock.col);
        var _blocks = this.game.getBlocks2(this.col, this.row);
        for (var i = 0; i < _blocks.length; i++) {
            //爆発させる
            if (_blocks[i].bombCnt == 0) {
                _blocks[i].bombCnt = 1;
            }
            //このブロックに存在してるenemyもhpは0になる
            for (var j = 0; j < this.game.enemies.length; j++) {
                if (this.game.enemies[j].currentBlock.col == _blocks[i].col && this.game.enemies[j].currentBlock.row == _blocks[
                        i].row) {
                    this.game.enemies[i].hp = 0;
                }
            }
        }
    },
});