var Player = cc.Node.extend({
    ctor: function (game) {
        this._super();
        this.game = game;
        this.sprite = cc.Sprite.create("res/player.png");
        this.addChild(this.sprite);
        this.spriteDead = cc.Sprite.create("res/player_dead.png");
        this.addChild(this.spriteDead);
        this.spriteDead.setVisible(false);
        this.targetBlock = null;
        this.nextBlock = null;
        this.currentBlockNum = 0;
        this.currentBlockCnt = 1;
        this.speed = 25;
        this.axMaxHp = 100;
        this.axHp = 100;
        this.route = [];
        this.deadCnt = 0;
        this.debrisCnt = 0;
        this.hp = 100;
        this.lastDigBlock = null;
        this.standingCnt = 0;
    },
    init: function () {},
    useAx: function (point) {
        this.axHp -= point;
        if (this.axHp <= 0) {
            this.axHp = 0;
        }
        if (this.axMaxHp <= this.axHp) {
            this.axHp = this.axMaxHp;
        }
    },
    update: function () {
        //dead
        if (this.hp <= 0) {
            this.debrisCnt++;
            if (this.debrisCnt >= 3) {
                this.debrisCnt = 0;
                this.game.addDeburis(this.getPosition().x, this.getPosition().y, 21);
            }
            this.sprite.setVisible(false);
            this.spriteDead.setVisible(true);
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
        //this.currentBlock.ludder.setVisible(true);
        //次の進むべきターゲットになるブロックを求める
        if (this.nextBlock) {
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
        //ルートが決まっていたら、その通りに進む
        if (this.targetBlock != null) {
            if (this.route.length > 0) {
                //cc.log(this.route);
                //行動する予定の0番目が、直近のブロックであるかどうか
                if (this.currentBlock == this.route[0]) {
                    //ルートを1つ削る
                    this.route.splice(0, 1);
                    //Playerが移動を全て終えたとき
                    if (this.route.length == 0) {
                        //ルートナンバーを設定する
                        //cc.log("移動を終えた.");
                        //this.currentBlock.ludder.setVisible(true);
                        this.game.setRouteNumber(this.currentBlock.col, this.currentBlock.row);
                    }
                } else {
                    //掘る
                    var _tmpNextBlock = this.route[0];
                    if (_tmpNextBlock.isRoad == true) {
                        //比較して前後のrowが増えているか、減っているか
                        if (_tmpNextBlock.row > this.currentBlock.row) {
                            this.currentBlock.ludder.setVisible(true);
                        }
                        this.nextBlock = _tmpNextBlock;
                    } else {
                        //ブロックの時だけdigする
                        var _point = 1;
                        //AXが0以上の時のみ掘ることができる
                        if (this.axHp > 0) {
                            _tmpNextBlock.dig(_point);
                            this.useAx(_point);
                        } else {
                            //AXが無いエラー
                            //エラーを出力させる
                            this.game.errorMessage.setType(2);
                        }
                    }
                }
            } else {
                //足元がブロックではない場合、落下する
                var _block = this.game.getBlock(this.currentBlock.col, Math.ceil(this.currentBlock.row - 1));
                if (_block) {
                    //足元のブロックが通路である場合は落ちる(nextブロックが-1される)
                    if (_block.isRoad == true) {
                        this.route.push(_block);
                    }
                }
            }
        }
        return true;
    },
});