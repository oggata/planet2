var Block2 = cc.Node.extend({
    ctor: function(game, blockNum, forceType) {
        this._super();
        this.game = game;
        this.hp = 20;
        this.sprite001 = cc.Sprite.create("res/block001.png");
        this.addChild(this.sprite001);

        this.sprite002 = cc.Sprite.create("res/block002.png");
        this.addChild(this.sprite002);

        this.sprite003 = cc.Sprite.create("res/block003.png");
        this.addChild(this.sprite003);

        this.sprite004 = cc.Sprite.create("res/block004.png");
        this.addChild(this.sprite004);

        this.sprite005 = cc.Sprite.create("res/block001.png");
        this.addChild(this.sprite005);

        this.sprite001.setVisible(false);
        this.sprite002.setVisible(false);
        this.sprite003.setVisible(false);
        this.sprite004.setVisible(false);
        this.sprite005.setVisible(false);

        this.testCnt = 0;
        this.maxTextCnt = 0;

        this.isClose = false;

        this.fireCnt = 0;
        this.scaleNum = 1;

        this.isTouchBlock = false;
    },
    init: function() {},




    getRandNumberFromRange: function(min, max) {
        var rand = min + Math.floor(Math.random() * (max - min));
        return rand;
    },

    update: function() {

        if (this.isClose == true) {
            if (this.fireCnt == 0) {
                this.fireCnt++;
                //this.game.addDeburis(this.getPosition().x,this.getPosition().y,null);
            }
        }

        this.testCnt++;
        if (this.testCnt >= this.maxTextCnt) {
            this.testCnt = 0;
            this.maxTextCnt = this.getRandNumberFromRange(10, 60);

            this.sprite001.setVisible(false);
            this.sprite002.setVisible(false);
            this.sprite003.setVisible(false);
            this.sprite004.setVisible(false);
            this.sprite005.setVisible(false);

            var _rand = this.getRandNumberFromRange(1, 3);
            if(_rand == 1){
                this.blockNum = 1;
            }else{
                var _rand = this.getRandNumberFromRange(1, 5);
                if(_rand == 1){
                    this.blockNum = 1;
                }else{
                    this.blockNum = this.getRandNumberFromRange(1, 6);
                }
            }

            switch (this.blockNum) {
                case 1:
                    this.sprite001.setVisible(true);
                    break;
                case 2:
                    this.sprite002.setVisible(true);
                    break;
                case 3:
                    this.sprite003.setVisible(true);
                    break;
                case 4:
                    this.sprite004.setVisible(true);
                    break;
                case 5:
                    this.sprite005.setVisible(true);
                    break;
            }

            if (this.isClose == true) {
                this.sprite001.setVisible(false);
                this.sprite002.setVisible(false);
                this.sprite003.setVisible(false);
                this.sprite004.setVisible(false);
                this.sprite005.setVisible(false);
            }

        }


        return true;
    },
});