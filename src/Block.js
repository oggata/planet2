var Block = cc.Node.extend({
    ctor: function(game, blockNum, forceType,col,row) {
        this._super();
        this.game = game;
        this.hp = 20;

        this.col = col;
        this.row = row;

        this.coinAmount = 0;
        /*
            forceType : 1 => 強制的に道路になる
            forceType : 2 => 強制的にブロックになる
        */
        if (forceType == 1) {
            this.isRoad = true;
        } else if (forceType == 2) {
            this.isRoad = false;
        } else {
            var _rand = this.game.getRandNumberFromRange(1, 5);
            if (_rand == 1 || _rand == 2) {
                //道路
                this.isRoad = true;
            } else {
                //ブロック
                this.isRoad = false;
            }
        }

        if (this.isRoad == false) {
            if (blockNum) {
                this.blockNum = blockNum;
            } else {
                this.blockNum = this.getBlockNum();
            }
        }

        this.sprite = cc.Sprite.create("res/block.png");
        switch (this.blockNum) {
            case 1:
                this.hp = 5;
                this.sprite = cc.Sprite.create("res/block001.png");
                break;
            case 2:
                this.hp = 20;
                this.sprite = cc.Sprite.create("res/block002.png");
                break;
            case 3:
                this.hp = 20;
                this.sprite = cc.Sprite.create("res/block003.png");
                break;
            case 4:
                this.hp = 20;
                this.sprite = cc.Sprite.create("res/block004.png");
                break;
            case 5:
                this.hp = 20;
                this.sprite = cc.Sprite.create("res/block005.png");
                break;
            case 6:
                this.hp = 20;
                this.sprite = cc.Sprite.create("res/block006.png");
                break;
            case 7:
                this.hp = 20;
                this.sprite = cc.Sprite.create("res/block007.png");
                break;
            case 8:
                this.hp = 20;
                this.sprite = cc.Sprite.create("res/block008.png");
                break;
            case 9:
                this.hp = 20;
                this.sprite = cc.Sprite.create("res/block009.png");
                break;
            case 10:
                this.hp = 20;
                this.sprite = cc.Sprite.create("res/block010.png");
                break;
            case 11:
                this.hp = 20;
                this.sprite = cc.Sprite.create("res/block011.png");
                break;
            case 99:
                this.hp = 999;
                this.sprite = cc.Sprite.create("res/block099.png");
                break;
        }
        this.addChild(this.sprite);

        this.isCToPlayerRoad = false;

        this.ludder = cc.Sprite.create("res/ludder.png");
        this.addChild(this.ludder,999999999);
        this.ludder.setVisible(false);
        this.hidden = cc.Sprite.create("res/hidden.png");
        this.addChild(this.hidden,999999999);
        this.hidden2 = cc.Sprite.create("res/hidden2.png");
        this.addChild(this.hidden2,999999999);
        this.hidden2.setVisible(false);

        this.routeLabel = new cc.LabelTTF("x", "Arial", 36);
        this.routeLabel.setFontFillColor(new cc.Color(0, 0, 0, 255));
        this.routeLabel.setAnchorPoint(0, 0);
        this.routeLabel.setPosition(-10, -20);
        this.addChild(this.routeLabel);
        this.routeLabel.setVisible(false);

        this.debrisCnt = 0;
        this.fireCnt = 0;
        this.bombCnt = 0;
        this.flushCnt = 0;

        this.localY = 0;
        this.dropTime = this.game.getRandNumberFromRange(1,10);
    },
    init: function() {},

    getBlockNum:function(){
        var _blockNum = 1;
        var _rand = this.game.getRandNumberFromRange(1,3);
        if(_rand == 1){
            _blockNum = 1;
        }else{
            var _rand = this.game.getRandNumberFromRange(1,5);
            if(_rand == 1){
                _blockNum = 1;
            }else{
                _blockNum = this.game.getRandNumberFromRange(1,10);
            }
        }

        var _rand2 = this.game.getRandNumberFromRange(1,5);
        if(_rand2 == 1){
            _blockNum = 99;
        }


        return _blockNum;
    },

    dig: function(point) {

        //block
        this.debrisMaxCnt = 5;


        this.debrisCnt++;
        if (this.debrisCnt >= this.debrisMaxCnt) {
            this.debrisCnt = 0;

            var _rand = this.game.getRandNumberFromRange(1, 4);
            if(_rand == 1){
                this.debrisMaxCnt = 10;
            }else if(_rand == 2){
                this.debrisMaxCnt = 20;
            }else{

            }

            this.game.addDeburis(this.getPosition().x, this.getPosition().y, this.blockNum);
        }

        this.hp -= point;
        if (this.hp <= 0) {
            if(this.game.cards[0]){
                this.game.cards[0].dig(this.blockNum);
            }
            if(this.game.player.currentBlockNum != this.blockNum){
                this.game.player.currentBlockNum = this.blockNum;
                this.game.player.currentBlockCnt = 1;
            }else{
                this.game.player.currentBlockCnt += 1;
            }

            //掘り終わった時の挙動。ブロックごとに定義する
            this.hp = 0;
            this.isRoad = true;
            if (this.game.gameStatus == "start") {
                this.game.gameStatus = "gaming";
            }

            //アイテム
            if (this.blockNum == 10) {
                this.game.player.axHp += 30;
            }
            /*
            //coinAmountが0以上の場合はお金をばらまく
            if (this.coinAmount > 0) {
                this.game.addDeburis(this.getPosition().x, this.getPosition().y, 51);
            }
            */
        }
    },

    update: function() {

        if(this.game.gameStatus == "gameover"){
            this.localY-=this.dropTime * 0.01575;
            this.setPosition(
                this.getPosition().x,this.getPosition().y + this.localY
            );
        }

        if(this.bombCnt >= 1){
            this.hidden.setVisible(false);
            this.bombCnt++;
            this.flushCnt++;
            if(this.flushCnt>=15){
                this.flushCnt=0;
                if(this.hidden2.isVisible() == true){
                    this.hidden2.setVisible(false);
                }else{
                    this.hidden2.setVisible(true);
                }
            }
            if(this.bombCnt>=30*3){
                this.hp = 0;
                this.isRoad = true;
                this.hidden2.setVisible(false);
            }
        }
        if (this.isRoad == true) {
            this.sprite.setVisible(false);
        } else {
            this.sprite.setVisible(true);
        }
        if (this.hp <= 0) {
            if (this.fireCnt == 0) {
                this.game.player.lastDigBlock = this;
                this.fireCnt++;
                this.game.addDeburis(this.getPosition().x, this.getPosition().y, this.blockNum);
                this.game.addDeburis(this.getPosition().x, this.getPosition().y, this.blockNum);
                this.game.addDeburis(this.getPosition().x, this.getPosition().y, this.blockNum);
            }
        }
        return true;
    }
});