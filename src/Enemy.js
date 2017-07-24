var Enemy = cc.Node.extend({
    ctor: function (game) {
        this._super();
        this.game = game;
        this.sprite = cc.Sprite.create("res/enemy.png");
        this.addChild(this.sprite);
        this.targetBlock = null;
        this.nextBlock = null;
        this.speed = 25;
        this.route = [];
        this.hp = 100;
        this.brainTimeCnt = 0;
    },
    init: function () {},
    update: function () {
        if (this.hp <= 0) {
            return false;
        }
        if (this.game.gameStatus == "gameover") {
            return false;
        }
        //自分から最も近いブロックを求める
        var minDist = 99999;
        for (var i = 0; i < this.game.blocks.length; i++) {
            this.game.blocks[i].update();
            var distance = cc.pDistance(this.game.blocks[i].getPosition(), this.getPosition());
            if (minDist > distance) {
                minDist = distance;
                this.currentBlock = this.game.blocks[i];
            }
        }
        //次の進むべきターゲットになるブロックを求める
        if (this.nextBlock) {
            if (this.nextBlock.getPosition()) {
                this.game.target3.setPosition(this.nextBlock.getPosition().x, this.nextBlock.getPosition().y);
                if (Math.abs(this.getPosition().x - this.nextBlock.getPosition().x) <= this.speed) {
                    this.setPosition(this.nextBlock.getPosition().x, this.getPosition().y);
                }
                if (Math.abs(this.getPosition().y - this.nextBlock.getPosition().y) <= this.speed) {
                    this.setPosition(this.getPosition().x, this.nextBlock.getPosition().y);
                }
                if (this.getPosition().x < this.nextBlock.getPosition().x) {
                    this.setPosition(this.getPosition().x + this.speed, this.getPosition().y);
                }
                if (this.getPosition().x > this.nextBlock.getPosition().x) {
                    this.setPosition(this.getPosition().x - this.speed, this.getPosition().y);
                }
                if (this.getPosition().y < this.nextBlock.getPosition().y) {
                    this.setPosition(this.getPosition().x + 0, this.getPosition().y + this.speed);
                }
                if (this.getPosition().y > this.nextBlock.getPosition().y) {
                    this.setPosition(this.getPosition().x - 0, this.getPosition().y - this.speed);
                }
            }
        }
        //ルートが決まっていたら、その通りに進む
        if (this.targetBlock != null) {
            if (this.route.length > 0) {
                //行動する予定の0番目が、直近のブロックであるかどうか
                if (this.currentBlock == this.route[0]) {
                    //ルートを1つ削る
                    this.route.splice(0, 1);
                    //Playerが移動を全て終えたとき
                    if (this.route.length == 0) {
                        //ルートナンバーを設定する
                        //this.game.setRouteNumber(this.currentBlock.col,this.currentBlock.row);
                    }
                } else {
                    //掘る
                    var _tmpNextBlock = this.route[0];
                    if (_tmpNextBlock.isRoad == true) {
                        this.nextBlock = _tmpNextBlock;
                    } else {
                        //ブロックの時だけdigする
                        var _point = 1;
                        _tmpNextBlock.dig(_point);
                        this.useAx(_point);
                    }
                }
            } else {
                //足元がブロックではない場合、落下する
                this.route = [];
                var _block = this.game.getBlock(this.currentBlock.col, Math.ceil(this.currentBlock.row - 1));
                if (_block) {
                    if (_block.isRoad == true) {
                        this.nextBlock = _block;
                    }
                }
            }
        }
        return true;
    },
});