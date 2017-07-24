var GameLayer = cc.Layer.extend({
    sprite: null,
    ctor: function (storage) {
        //////////////////////////////
        // 1. super init first
        this._super();
        this.storage = storage;
        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;
        this.blocks = [];
        this.debris_array = [];
        this.enemies = [];
        this.cards = [];
        this.coins = [];
        this.backNode = cc.LayerColor.create(new cc.Color(0, 0, 0, 255), 640, 1136);
        this.addChild(this.backNode);
        this.baseNode = cc.Node.create();
        this.addChild(this.baseNode);
        this.baseNode.setPosition(0, 300);
        this.baseNode.setAnchorPoint(0, 0);
        this.player = new Player(this);
        this.baseNode.addChild(this.player, 999999999);
        this.addStage(1);
        this.addStage(11);
        this.addStage(21);
        this.player.setPosition(this.player.targetBlock.getPosition().x, this.player.targetBlock.getPosition().y);
        this.player.currentBlock = this.player.targetBlock;
        this.player.nextBlock = this.getBlock(this.player.currentBlock.col, this.player.currentBlock.row);
        this.target = cc.Sprite.create("res/target.png");
        this.target.setPosition(-1000,-1000);
        this.baseNode.addChild(this.target, 99999999);
        this.target2 = cc.Sprite.create("res/target.png");
        this.baseNode.addChild(this.target2, 99999999);
        this.target2.setPosition(100, 100);
        this.target2.setVisible(false);
        this.target3 = cc.Sprite.create("res/target3.png");
        this.baseNode.addChild(this.target3, 99999999);
        this.target3.setPosition(100, 100);
        this.target3.setVisible(false);
        //次のステージを作成するための基準になる(1行目がこのターゲットに近くなった時に発動される)   
        this.targetBar001 = cc.Sprite.create("res/target_bar_1.png");
        this.addChild(this.targetBar001);
        this.targetBar001.setAnchorPoint(0,0);
        this.targetBar001.setPosition(0, 200);
        this.targetBar001.setVisible(false);

        //スクロールスピードを更新させるための基準
        this.targetBar002 = cc.Sprite.create("res/target_bar_2.png");
        this.addChild(this.targetBar002);
        this.targetBar002.setAnchorPoint(0,0);
        this.targetBar002.setPosition(0, 1136/2 - 80);
        this.targetBar002.setVisible(false);

        //プレイヤーが死亡する最低値ライン
        this.targetBar003 = cc.Sprite.create("res/target_bar_3.png");
        this.addChild(this.targetBar003);
        this.targetBar003.setAnchorPoint(0,0);
        this.targetBar003.setPosition(0, 80);
        this.targetBar003.setVisible(false);
        //this.targetBar001.setVisible(false);
        /*
        //スピードアップのために使用する
        this.target5 = cc.Sprite.create("res/target5.png");
        this.addChild(this.target5);
        this.target5.setPosition(0, 270);
        //this.target5.setVisible(false);
        */
        this.playerMessage = cc.Sprite.create("res/player_message.png");
        this.addChild(this.playerMessage, 9999999);
        this.playerMessage.setPosition(320, 690);
        this.playerMessage.setVisible(false);
        //画面サイズの取得
        this.viewSize = cc.director.getVisibleSize();
        var size = cc.winSize;
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan: function (touches, event) {
                var location = touches[0].getLocation();
                event.getCurrentTarget().touchStart(touches[0].getLocation());
            },
            onTouchesMoved: function (touches, event) {
                var location = touches[0].getLocation();
                event.getCurrentTarget().touchMove(touches[0].getLocation());
            },
            onTouchesEnded: function (touches, event) {
                event.getCurrentTarget().touchFinish(touches[0].getLocation());
            }
        }), this);

        this.stageNum = 1;
        this.debrisCnt = 0;
        this.scrollSpeed = 0.5;
        //ルートナンバーを設定する
        this.setRouteNumber(this.player.currentBlock.col, this.player.currentBlock.row);
        //this.gameStatus = "start";
        this.gameStatus = "gaming";
        //this.gameStatus = "gameover";
        this.header = new Header(this);
        this.addChild(this.header);
        //1行目を全て照らす
        for (var i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].row == 1 || this.blocks[i].row == 2) {
                this.blocks[i].hidden.setVisible(false);
            }
        }
        this.setGameOver();
        this.brightenCnt = 0;
        this.errorMessage = new ErrorMessage(this);
        this.addChild(this.errorMessage);
        this.errorMessage.setVisible(false);
        this.score = 0;
        this.visibleScore = 0;
        this.gameOverCnt = 0;
        this.blockWidth = 53.3333;
//this.addCard();
        this.updateCnt = 0;

        this.scheduleUpdate();
        return true;
    },
    addCard: function () {
        var _itemTypeNum = this.getRandNumberFromRange(2, 9);
        var _material001 = this.getRandNumberFromRange(2, 9);
        var _material002 = this.getRandNumberFromRange(2, 9);
        var _material003 = this.getRandNumberFromRange(2, 9);
        var _material004 = this.getRandNumberFromRange(2, 9);

        _material002 = null;
        _material003 = null;
        _material004 = null;

        this.card = new Card(this, _itemTypeNum, _material001, _material002, _material003, _material004);
        this.cards.push(this.card);
        this.header.back2.addChild(this.card);
        this.card.setPosition(320, 0);
    },
    getBaseNodePosition: function (col, row) {
        var _x = (col - 1) * 53.333 + 53.333 / 2;
        var _y = (row) * 53.333 + 53.333 / 2
        return [_x, _y];
    },
    update: function (dt) {
        for (var i = 0; i < this.debris_array.length; i++) {
            var _debriX = this.debris_array[i].getPosition().x + this.debris_array[i].sprite.getPosition().x;
            var _debriY = this.debris_array[i].getPosition().y + this.debris_array[i].sprite.getPosition().y;
            var _distance = Math.sqrt(
                (_debriX - this.player.getPosition().x) * (_debriX - this.player.getPosition().x) + (_debriY - this.player.getPosition()
                    .y) * (_debriY - this.player.getPosition().y));
            if (30 > _distance) {
                if (this.debris_array[i].effectTime >= 30) {
                    this.debris_array[i].isTouchedPlayer = true;
                }
            }
        }
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i].update() == false) {
                this.header.back2.removeChild(this.cards[i]);
                this.cards.splice(i, 1);
                this.addCard();
            }
        }
        //スコア表示
        if (this.visibleScore < this.score) {
            this.visibleScore += 1;
        }
        this.header.scoreLabel.setString("SCORE:" + this.visibleScore);
        //this.bestScoreLabel.setString(this.storage.maxGameScore);
        this.header.depthLabel.setString("DEPTH:" + Math.ceil(this.player.currentBlock.row * 10 - 10) + "M");
        //最初のメッセージ
        if (this.player.route.length == 0 && this.gameStatus == "start") {
            this.playerMessage.setVisible(true);
        } else {
            this.playerMessage.setVisible(false);
        }
        var distance = Math.abs(this.player.getPosition().y - this.viewSize.height + this.baseNode.getPosition().y);
        if (distance <= 10) {
            this.gameStatus = "gameover";
        }
        if (this.player.deadCnt >= 30 * 3) {
            this.gameStatus = "gameover";
        }
        if (this.gameStatus == "gameover") {
            if (this.gameOverCnt == 0) {
                this.scoreLabel.setString("SCORE:" + this.score);
                this.depthLabel.setString("DEPTH:" + Math.ceil(this.player.currentBlock.row * 10 - 10) + "m");
                /*
                                this.storage.totalGameScore += this.score;
                                this.storage.totalCoinAmount += this.score;
                                if (this.storage.maxGameScore <= this.score) {
                                    this.storage.maxGameScore = this.score;
                                }
                                this.storage.saveCurrentData();
                */
            }
            this.gameover.setVisible(true);
            this.errorMessage.setVisible(false);
            this.gameOverCnt += 1;
        }
        //スクロール制御
        if (this.gameStatus == "gaming") {
this.setScroll();
        }
        //プレイヤーをupdate
        this.player.update();
        this.header.update();
        this.errorMessage.update();
        if (this.player.deadCnt >= 1) {
            this.player.deadCnt += 1;
        }
        //コインをupdate
        for (var i = 0; i < this.coins.length; i++) {
            if (this.coins[i].update() == false) {
                this.baseNode.removeChild(this.coins[i]);
                this.coins.splice(i, 1);
            } else {
                if (this.coins[i].col == this.player.currentBlock.col && this.coins[i].row == this.player.currentBlock.row) {
                    //console.log("xxx");
                    if (this.coins[i].isGotCnt == 0) {
                        this.coins[i].isGotCnt = 1;
                        //reorder
                        this.baseNode.reorderChild(this.coins[i], 99999);
                    }
                }
            }
        }
        //デブリをupdate
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].update() == false) {
                this.baseNode.removeChild(this.enemies[i]);
                this.enemies.splice(i, 1);
            } else {
                if (this.enemies[i].currentBlock.col == this.player.currentBlock.col && this.enemies[i].currentBlock.row == this
                    .player.currentBlock.row) {
                    this.player.hp = 0;
                    if (this.player.deadCnt == 0) {
                        this.player.deadCnt = 1;
                        this.gameStatus = "player_dead";
                    }
                }
                if (this.enemies[i].route.length == 0) {
                    this.enemies[i].brainTimeCnt++;
                    if (this.enemies[i].brainTimeCnt >= 30) {
                        this.enemies[i].brainTimeCnt = 0;
                        //上下左右で空いているブロックを探す
                        var _blocks = this.getBlocks(this.enemies[i].currentBlock.col, this.enemies[i].currentBlock.row);
                        var shuffle = function () {
                            return Math.random() - .5
                        };
                        _blocks.sort(shuffle);
                        if (_blocks[0]) {
                            if (this.gameStatus == "gaming") {
                                this.enemies[i].route.push(_blocks[0]);
                            }
                        }
                    }
                }
            }
        }
        //デブリをupdate
        for (var i = 0; i < this.debris_array.length; i++) {
            if (this.debris_array[i].update() == false) {
                this.baseNode.removeChild(this.debris_array[i]);
                this.debris_array.splice(i, 1);
            }
        }
        //全てのblocksの1行目
        var minDist = 99999;
        var minDistBlock = null;
        for (var i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].hidden.isVisible() == false) {
                this.baseNode.reorderChild(this.blocks[i], 99);
            } else {
                this.baseNode.reorderChild(this.blocks[i], 999);
            }
            //1行目の場合
            if (this.blocks[i].row % 10 == 1 && this.blocks[i].col == 1) {
                var distance = Math.abs(this.blocks[i].getPosition().y - this.targetBar001.getPosition().y + this.baseNode.getPosition()
                    .y);
                if (minDist > distance) {
                    minDist = distance;
                    minDistBlock = this.blocks[i];
                }
            }
        }
        if (minDistBlock) {
            if (this.stageNum != minDistBlock.row) {
                //ステージが変化した時に前のステージの削除+新しいステージの作成
                var _currentStageNum = minDistBlock.row;
                this.stageNum = _currentStageNum;
                //this.scoreLabel.setString(this.stageNum);
                var _addStageNum = minDistBlock.row + 20;
                this.addStage(_addStageNum);
                var _removeStageNum = minDistBlock.row - 20;
                this.removeStageFromBaseNode(_removeStageNum);
            }
        }
        this.setBrighten(this.player.currentBlock.col, this.player.currentBlock.row);
        this.brightenCnt++;
        if (this.brightenCnt >= 10) {
            this.brightenCnt = 0;
            //
            //プレイヤーの周囲を照らす
            this.setBrighten(this.player.currentBlock.col, this.player.currentBlock.row);
            //プレイヤーから繋がっている道路を照らす
            this.checkIsCToPlayerRoad(this.player.currentBlock.col, this.player.currentBlock.row);
            //プレイヤーから繋がっている道路に繋がっている道路を照らすx1
            for (var i = 0; i < this.blocks.length; i++) {
                if (this.blocks[i].isCToPlayerRoad == true) {
                    this.checkIsCToPlayerRoad(this.blocks[i].col, this.blocks[i].row);
                }
            }
            //ブロックの目隠しを設定
            for (var i = 0; i < this.blocks.length; i++) {
                if (this.blocks[i].isCToPlayerRoad == true) {
                    this.blocks[i].hidden.setVisible(false);
                }
            }
        }
    },
    setGameOver: function () {
        this.gameover = cc.Sprite.create("res/gameover.png");
        this.addChild(this.gameover, 99999999);
        this.gameover.setAnchorPoint(0.5, 0);
        this.gameover.setPosition(320, 400);
        this.gameover.setVisible(false);
        this.scoreLabel = new cc.LabelTTF("coin:000.0", "Arial", 32);
        this.scoreLabel.setFontFillColor(new cc.Color(255, 255, 255, 255));
        this.scoreLabel.setAnchorPoint(0, 0);
        this.gameover.addChild(this.scoreLabel);
        this.scoreLabel.setPosition(220, 140);
        this.depthLabel = new cc.LabelTTF("depth:000.0", "Arial", 32);
        this.depthLabel.setFontFillColor(new cc.Color(255, 255, 255, 255));
        this.depthLabel.setAnchorPoint(0, 0);
        this.gameover.addChild(this.depthLabel);
        this.depthLabel.setPosition(220, 110);
        var retryButton = new cc.MenuItemImage("res/button_retry.png", "res/button_retry_on.png", function () {
            this.goToStageLayer();
        }, this);
        retryButton.setPosition(320 - 237 / 2 - 80 + 100, 50);
        var homeButton = new cc.MenuItemImage("res/button_home.png", "res/button_home_on.png", function () {
            this.goToTopLayer();
        }, this);
        homeButton.setPosition(320 - 237 / 2 - 80 + 290, 50);
        var menu001 = new cc.Menu(retryButton, homeButton);
        menu001.setPosition(0, 0);
        this.gameover.addChild(menu001);
    },
    addStage: function (stageNum) {
        var _blockCnt = 0;
        var _roopCnt = 0;
        //横幅はブロック12個
        for (var col = 1; col <= 12; col++) {
            //縦幅は1ステージにつき10個
            for (var row = stageNum; row < stageNum + 10; row++) {
                _blockCnt++;
                var _blockNum = null;
                var forceType = null;
                //1行目と2行目はステージの開始ポイントなので強制的にブロックを指定する
                if (row == 1) {
                    _blockNum = 0;
                    forceType = 1;
                }
                if (row == 2) {
                    _blockNum = 1;
                    forceType = 2;
                }
                //block
                this.block = new Block(this, _blockNum, forceType, col, row);
                this.block.stageNum = stageNum;
                //初期化時にプレイヤーが動くrouteを入れておく
                if (row == 1 && col <= 6) {
                    this.player.route.push(this.block);
                }
                this.baseNode.addChild(this.block, 99999);
                this.blocks.push(this.block);
                var _pos = this.getBaseNodePosition(col, row);
                this.block.setPosition(_pos[0], _pos[1]);
                if (col == 1 && row == 1) {
                    this.player.targetBlock = this.block;
                }
                if (_roopCnt == 0) {
                    //背景を作成する
                    if (stageNum == 1 || stageNum == 2) {
                        this.backImage = "res/back000.png";
                    } else {
                        this.backImage = "res/back001.png";
                    }
                    this.back = cc.Sprite.create(this.backImage);
                    this.baseNode.addChild(this.back, -99999);
                    this.back.setAnchorPoint(0, 1);
                    this.back.setPosition(0, _pos[1]);
                    _roopCnt++;
                }
            }
        }
        //cc.log("===============addStage" + stageNum + "/cnt:"+ _blockCnt + "=====================");
        var testCnt = 0;
        for (var i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].stageNum == 1) {
                //this.baseNode.removeChild(this.blocks[i]);
                //this.blocks.splice(i, 1);
                testCnt++;
            }
        }
        //cc.log("stage1のcnt:" + testCnt);
        this.addEnemies(stageNum);
        this.addCoins(stageNum);
    },
    addCoins: function (stageNum) {
        //コインを入れる
        for (var i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].stageNum == stageNum && this.blocks[i].isRoad == true) {
                if (this.blocks[i].row != 1) {
                    this.coin = new Coin(this, this.blocks[i].col, this.blocks[i].row);
                    this.coins.push(this.coin);
                    this.baseNode.addChild(this.coin);
                    this.coin.targetBlock = this.blocks[i];
                    this.coin.stageNum = stageNum;
                    this.coin.setPosition(this.coin.targetBlock.getPosition().x, this.coin.targetBlock.getPosition().y);
                }
            }
        }
    },
    addEnemies: function (stageNum) {
        //敵を入れる
        for (var i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].stageNum == stageNum && this.blocks[i].isRoad == true) {
                var _rand = this.getRandNumberFromRange(1, 8);
                if (this.blocks[i].row != 1 && _rand == 5) {
                    this.enemy = new Enemy(this);
                    this.enemy.stageNum = stageNum;
                    this.enemies.push(this.enemy);
                    this.baseNode.addChild(this.enemy, 999999999);
                    this.enemy.targetBlock = this.blocks[i];
                    this.enemy.setPosition(this.enemy.targetBlock.getPosition().x, this.enemy.targetBlock.getPosition().y);
                    this.enemy.currentBlock = this.enemy.targetBlock;
                    this.enemy.nextBlock = this.getBlock(this.enemy.currentBlock.col, this.enemy.currentBlock.row);
                }
            }
        }
    },
    removeStageFromBaseNode: function (stageNum) {
        var _removeCnt = 0;
        for (var r = 0; r < 10; r++) {
            //cc.log("1のlengthは"　+ this.blocks.length + "あります");
            for (var i = 0; i < this.blocks.length; i++) {
                if (this.blocks[i].stageNum == stageNum) {
                    this.baseNode.removeChild(this.blocks[i]);
                    this.blocks.splice(i, 1);
                    _removeCnt++;
                }
            }
        }
        for (var r = 0; r < 10; r++) {
            for (var i = 0; i < this.coins.length; i++) {
                if (this.coins[i].stageNum == stageNum) {
                    this.baseNode.removeChild(this.coins[i]);
                    this.coins.splice(i, 1);
                }
            }
        }
        for (var r = 0; r < 10; r++) {
            for (var i = 0; i < this.enemies.length; i++) {
                if (this.enemies[i].stageNum == stageNum) {
                    this.baseNode.removeChild(this.enemies[i]);
                    this.enemies.splice(i, 1);
                }
            }
        }
        cc.log("===========remove stage:" + stageNum + "/cnt:" + _removeCnt);
    },
    getBlock: function (col, row) {
        for (var i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].col == col && this.blocks[i].row == row) {
                return this.blocks[i];
            }
        }
        return null;
    },
    getBlocks: function (col, row) {
        var _blocks = [];
        var _targetCol = 1;
        var _targetRow = 1;
        for (var i = 0; i < this.blocks.length; i++) {
            //上
            _targetCol = col;
            _targetRow = row - 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == true) {
                _blocks.push(this.blocks[i]);
            }
            //左
            _targetCol = col - 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == true) {
                _blocks.push(this.blocks[i]);
            }
            //右
            _targetCol = col + 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == true) {
                _blocks.push(this.blocks[i]);
            }
            //下
            _targetCol = col;
            _targetRow = row + 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == true) {
                _blocks.push(this.blocks[i]);
            }
        }
        return _blocks;
    },
    getBlocks2: function (col, row) {
        var _blocks = [];
        var _targetCol = 1;
        var _targetRow = 1;
        for (var i = 0; i < this.blocks.length; i++) {
            //上
            _targetCol = col;
            _targetRow = row - 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == false) {
                _blocks.push(this.blocks[i]);
            }
            //左
            _targetCol = col - 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == false) {
                _blocks.push(this.blocks[i]);
            }
            //右
            _targetCol = col + 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == false) {
                _blocks.push(this.blocks[i]);
            }
            //下
            _targetCol = col;
            _targetRow = row + 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == false) {
                _blocks.push(this.blocks[i]);
            }
        }
        return _blocks;
    },
    getRandNumberFromRange: function (min, max) {
        var rand = min + Math.floor(Math.random() * (max - min));
        return rand;
    },
    getBlockFromRouteNum: function (col, row, routeNum) {
        var _blocks = [];
        var _targetCol = 1;
        var _targetRow = 1;
        for (var i = 0; i < this.blocks.length; i++) {
            //上
            _targetCol = col;
            _targetRow = row - 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].routeNum == routeNum) {
                _blocks.push(this.blocks[i]);
            }
            //左
            _targetCol = col - 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].routeNum == routeNum) {
                _blocks.push(this.blocks[i]);
            }
            //右
            _targetCol = col + 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].routeNum == routeNum) {
                _blocks.push(this.blocks[i]);
            }
            //下
            _targetCol = col;
            _targetRow = row + 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].routeNum == routeNum) {
                _blocks.push(this.blocks[i]);
            }
        }
        return _blocks;
    },
    checkIsCToPlayerRoad: function (col, row) {
        var _targetCol = 1;
        var _targetRow = 1;
        for (var i = 0; i < this.blocks.length; i++) {
            //上
            _targetCol = col;
            _targetRow = row - 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == true) {
                this.blocks[i].isCToPlayerRoad = true;
            }
            //左
            _targetCol = col - 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == true) {
                this.blocks[i].isCToPlayerRoad = true;
            }
            //右
            _targetCol = col + 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == true) {
                this.blocks[i].isCToPlayerRoad = true;
            }
            //下
            _targetCol = col;
            _targetRow = row + 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow && this.blocks[i].isRoad == true) {
                this.blocks[i].isCToPlayerRoad = true;
            }
        }
    },
    setDistanceBetweenTargetPosition: function (col, row, routeNum) {
        var _targetCol = 1;
        var _targetRow = 1;
        for (var i = 0; i < this.blocks.length; i++) {
            //H
            _targetCol = col;
            _targetRow = row - 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow) {
                if (this.blocks[i].routeNum == 0 && this.blocks[i].isRoad == true) {
                    this.blocks[i].routeNum = routeNum;
                }
            }
            //L
            _targetCol = col - 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow) {
                if (this.blocks[i].routeNum == 0 && this.blocks[i].isRoad == true) {
                    this.blocks[i].routeNum = routeNum;
                }
            }
            //N
            _targetCol = col + 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow) {
                if (this.blocks[i].routeNum == 0 && this.blocks[i].isRoad == true) {
                    this.blocks[i].routeNum = routeNum;
                }
            }
            //R
            _targetCol = col;
            _targetRow = row + 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow) {
                if (this.blocks[i].routeNum == 0 && this.blocks[i].isRoad == true) {
                    this.blocks[i].routeNum = routeNum;
                }
            }
        }
    },
    setBrighten: function (col, row) {
        var _targetCol = 1;
        var _targetRow = 1;
        for (var i = 0; i < this.blocks.length; i++) {
            //上
            _targetCol = col;
            _targetRow = row - 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow) {
                this.blocks[i].hidden.setVisible(false);
            }
            //左
            _targetCol = col - 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow) {
                this.blocks[i].hidden.setVisible(false);
            }
            //右
            _targetCol = col + 1;
            _targetRow = row;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow) {
                this.blocks[i].hidden.setVisible(false);
            }
            //下
            _targetCol = col;
            _targetRow = row + 1;
            if (this.blocks[i].col == _targetCol && this.blocks[i].row == _targetRow) {
                this.blocks[i].hidden.setVisible(false);
            }
        }
    },
    setRouteNumber: function (col, row) {
        //ルート番号を初期化する
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].routeNum = 0;
            //this.blocks[i].routeLabel.setString(this.blocks[i].routeNum);
        }
        //まずプレイヤーの位置から1個の位置
        var routeNum = 1;
        this.setDistanceBetweenTargetPosition(col, row, routeNum);
        //プレイヤー位置1個の場所から最大30個までの位置を計算する
        for (var routeNum = 1; routeNum < 30; routeNum++) {
            for (var i = 0; i < this.blocks.length; i++) {
                //距離が1~30のものを随時取得していく。
                //例えば、1回目は距離が1のものから上下左右のものに2を書き込む
                //次に2回目は距離が2のものから上下左右のものに3を書き込んでいく
                if (this.blocks[i].routeNum == routeNum) {
                    //setDistanceBetweenTargetPositionでは、通路であること、またrouteNumが記載されていないものだけをターゲットにする
                    this.setDistanceBetweenTargetPosition(this.blocks[i].col, this.blocks[i].row, routeNum + 1);
                    this.blocks[i].routeLabel.setString(this.blocks[i].routeNum);
                }
            }
        }
    },
    addDeburis: function (x, y, typeNum) {
        this.debris = new Debris(this, typeNum);
        this.debris_array.push(this.debris);
        this.debris.setPosition(x, y);
        this.baseNode.addChild(this.debris, 999999);
    },
    setScroll: function () {
        var distance = Math.ceil(this.player.getPosition().y - this.targetBar002.getPosition().y + this.baseNode.getPosition().y);
        //cc.log(distance);
        if(distance > 200){
            this.scrollSpeed = 3;
        }else if(distance > 100){
            this.scrollSpeed = 2;
        }else if(distance > 0){
            this.scrollSpeed = 1;
        }else{
            this.scrollSpeed = 0;
        }
        if(this.player.axHp <= 0){
            //this.player.hp = 0;
            this.scrollSpeed = 5;
        }
        //ステージをスクロールする
        this.baseNode.setPosition(this.baseNode.getPosition().x, this.baseNode.getPosition().y - this.scrollSpeed);

        //死亡判定
        var distance = Math.ceil(this.player.getPosition().y - this.targetBar003.getPosition().y + this.baseNode.getPosition().y);
        if(distance < 0){
            this.player.hp = 0;
        }
    },
    touchStart: function (location) {
        if (this.gameStatus == "gameover") return;
        if (this.gameStatus == "player_dead") return;
        this.target2.setPosition(location.x - this.baseNode.getPosition().x, location.y - this.baseNode.getPosition().y);
        var minDist = 99999;
        var minDistBlock = null;
        for (var i = 0; i < this.blocks.length; i++) {
            var distance = cc.pDistance(this.blocks[i].getPosition(), this.target2.getPosition());
            if (minDist > distance) {
                minDist = distance;
                minDistBlock = this.blocks[i];
            }
        }
        if (minDistBlock != null) {
            if (minDistBlock.hidden.isVisible() == true) {
                //cc.log("押したブロックはhiddenです");
                //エラーを出力させる
                this.errorMessage.setType(1);
            } else {
                this.target.setPosition(minDistBlock.getPosition().x, minDistBlock.getPosition().y);
                this.player.targetBlock = minDistBlock;
                if (this.player.targetBlock.isRoad == true) {
                    //cc.log("ターゲットは道路です.");
                    this.setPlayerRoute();
                    //cc.log("setPlayerRoute");
                } else {
                    //cc.log("ターゲットはブロックです.");
                    this.setPlayerRouteByTouchedBlock();
                    //cc.log("setPlayerRouteByTouchedBlock");
                }
            }
        }
    },
    touchMove: function (location) {},
    touchFinish: function (location) {},
    setPlayerRoute: function () {
        //ルートを初期化する
        this.player.route = [];

        //タッチしたブロックをセットする
        var _targetBlock = this.player.targetBlock;
        this.player.route.push(_targetBlock);
        //cc.log("routeNumは" + this.player.targetBlock.routeNum + "です.");
        //タッチしたブロックのルート距離をセットする
        var _targetRouteNum = this.player.targetBlock.routeNum;
        for (var i = 0; i < 20; i++) {
            //ルート距離を1個引く。最初がルート距離5の場合は、次に配列に入れるのはルート距離が4のもの
            _targetRouteNum -= 1;
            if (_targetBlock) {
                var _targetBlocks = this.getBlockFromRouteNum(_targetBlock.col, _targetBlock.row, _targetRouteNum);
                _targetBlock = _targetBlocks[0];
                if (_targetBlock) {
                    if (_targetBlock.routeNum >= 1) {
                        this.player.route.push(_targetBlock);
                    }
                }
            }
        }
        this.player.route.reverse();
    },
    setPlayerRouteByTouchedBlock: function () {
        this.player.route = [];
        //タッチしたターゲットがブロックだった場合
        //ターゲットしたブロックを道路として再度計算する
        this.player.targetBlock.isRoad = true;
        //再度routenumberを設定する
        this.setRouteNumber(this.player.currentBlock.col, this.player.currentBlock.row);
        //このブロックに隣うブロックの中で(routeNum-1)を探す
        this.player.route = [];
        var _targetBlock = this.player.targetBlock;
        this.player.route.push(_targetBlock);
        var _targetRouteNum = this.player.targetBlock.routeNum;
        for (var i = 0; i < 20; i++) {
            _targetRouteNum -= 1;
            if (_targetBlock) {
                var _targetBlocks = this.getBlockFromRouteNum(_targetBlock.col, _targetBlock.row, _targetRouteNum);
                _targetBlock = _targetBlocks[0];
                if (_targetBlock) {
                    if (_targetBlock.routeNum >= 1) {
                        this.player.route.push(_targetBlock);
                    }
                }
            }
        }
        this.player.route.reverse();
        //戻す
        this.player.targetBlock.isRoad = false;
    },
    //シーンの切り替え----->
    goToTopLayer: function (pSender) {
        var scene = cc.Scene.create();
        //次のステージへいくためにstorageは必ず受けた渡す
        scene.addChild(TopLayer.create(this.storage));
        cc.director.runScene(cc.TransitionFade.create(1.5, scene));
    },
    //シーンの切り替え----->
    goToStageLayer: function (pSender) {
        var scene = cc.Scene.create();
        //次のステージへいくためにstorageは必ず受けた渡す
        scene.addChild(GameLayer.create(this.storage, [], 0));
        cc.director.runScene(cc.TransitionFade.create(1.5, scene));
    },
});
GameLayer.create = function (storage) {
    return new GameLayer(storage);
};
var GameLayerScene = cc.Scene.extend({
    onEnter: function (storage) {
        this._super();
        var layer = new GameLayer(storage);
        this.addChild(layer);
    }
});
var Header = cc.Node.extend({
    ctor: function (game) {
        this._super();
        this.game = game;
        this.back2 = cc.Sprite.create("res/header.png");
        this.back2.setAnchorPoint(0, 0);
        this.back2.setPosition(0, this.game.viewSize.height - 120);
        this.addChild(this.back2);
        this.scoreLabel = new cc.LabelTTF("SCORE:10000", "Arial", 26);
        this.scoreLabel.setFontFillColor(new cc.Color(255, 255, 255, 255));
        this.scoreLabel.setAnchorPoint(0, 0);
        this.back2.addChild(this.scoreLabel);
        this.scoreLabel.setPosition(20, 78);
        //this.scoreLabel.setVisible(false);
        this.maxScoreLabel = new cc.LabelTTF("000.0", "Arial", 24);
        this.maxScoreLabel.setFontFillColor(new cc.Color(255, 255, 255, 255));
        this.maxScoreLabel.setAnchorPoint(1, 0);
        this.back2.addChild(this.maxScoreLabel);
        this.maxScoreLabel.setPosition(100, 20);
        this.maxScoreLabel.setVisible(false);
        this.depthLabel = new cc.LabelTTF("DEPTH:000m", "Arial", 26);
        this.depthLabel.setFontFillColor(new cc.Color(255, 255, 255, 255));
        this.depthLabel.setAnchorPoint(0, 0);
        this.back2.addChild(this.depthLabel);
        this.depthLabel.setPosition(20, 47);
        //this.depthLabel.setVisible(false);
        this.gauge = new Gauge(240, 20, "red");
        this.gauge.setPosition(20, 20);
        this.back2.addChild(this.gauge);
        //this.gauge.setVisible(false);
    },
    init: function () {},
    update: function () {
        this.gauge.update(this.game.player.axHp / this.game.player.axMaxHp);
        return true;
    },
});
var Gauge = cc.Node.extend({
    ctor: function (width, height, color) {
        this._super();
        this.width = width;
        this.height = height;
        this.rectBase = cc.LayerColor.create(new cc.Color(0, 0, 0, 255), this.width, this.height);
        this.rectBase.setPosition(0, 0);
        this.addChild(this.rectBase, 1);
        this.rectBack = cc.LayerColor.create(new cc.Color(105, 105, 105, 255), this.width - 1, this.height - 1);
        this.rectBack.setPosition(1, 1);
        this.addChild(this.rectBack, 2);
        var colorCode = new cc.Color(255, 255, 255, 255);
        if (color == "red") {
            colorCode = new cc.Color(178, 34, 34, 255);
        }
        if (color == "blue") {
            colorCode = new cc.Color(255, 255, 255, 255);
        }
        if (color == "lime") {
            colorCode = new cc.Color(128, 128, 0, 255);
        }
        if (color == "white") {
            colorCode = new cc.Color(255, 255, 255, 255);
        }
        this.rectBar = cc.LayerColor.create(colorCode, this.width - 2, this.height - 2);
        this.rectBar.setPosition(2, 2);
        this.addChild(this.rectBar, 3);
        this.rectBar.setAnchorPoint(0, 0);
    },
    init: function () {},
    update: function (scaleNum) {
        this.rectBar.setScale(scaleNum, 1);
    },
    setVisible: function (isVisible) {
        this.rectBase.setVisible(isVisible);
        this.rectBack.setVisible(isVisible);
        this.rectBar.setVisible(isVisible);
    }
});