var TopLayer = cc.Layer.extend({
    sprite: null,
    ctor: function() {
        //cc.sys.localStorage.clear();
        //////////////////////////////
        // 1. super init first
        this._super();

        var _language = cc.sys.language;
        var _platform = cc.sys.os;
        //cc.log(_language);
        //cc.log(_platform);
        this.viewSize = cc.director.getVisibleSize();

        //this.sdkboxPlayInit();
        this.logo = cc.Sprite.create("res/label_top.png");
        this.addChild(this.logo);
        this.logo.setPosition(320,this.viewSize.height/2 + 100);
        this.logo.setVisible(false);

        this.baseNode = cc.Node.create();
        this.addChild(this.baseNode);
        this.baseNode.setPosition(0, 500);
        this.baseNode.setAnchorPoint(0, 0);

        this.topImage = "res/back_top.png";
        if(_language == "ja"){
            this.topImage = "res/back_top.png";
        }

        this.back = cc.Sprite.create(this.topImage);
        this.back.setPosition(320,this.viewSize.height/2);

        this.storage = new Storage();
        try 
        {
            var _data = cc.sys.localStorage.getItem("ohedoStorage");
            if (_data == null) 
            {
                cc.log("dataはnullなので新たに作成します.");
                var _getData = this.storage.getDataFromStorage();
                cc.sys.localStorage.setItem("ohedoStorage", _getData);
                var _acceptData = cc.sys.localStorage.getItem("ohedoStorage");
                this.storage.setDataToStorage(JSON.parse(_acceptData));
            }
            if (_data != null) 
            {
                var storageData = JSON.parse(cc.sys.localStorage.getItem("ohedoStorage"));
                if (storageData["saveData"] == true) 
                {
                    cc.log("保存されたデータがあります");
                    var _acceptData = cc.sys.localStorage.getItem("ohedoStorage");
                    cc.log(_acceptData);
                    this.storage.setDataToStorage(JSON.parse(_acceptData));
                    if(this.storage.maxGameScore != 0){
                        this.sendScoreToGameCenter(this.storage.maxGameScore);
                    }
                }
                else 
                {
                    cc.log("保存されたデータはありません");
                    var _getData = this.storage.getDataFromStorage();
                    cc.sys.localStorage.setItem("ohedoStorage", _getData);
                    var _acceptData = cc.sys.localStorage.getItem("ohedoStorage");
                    this.storage.setDataToStorage(JSON.parse(_acceptData));
                }
            }
        }
        catch (e) {
            cc.log("例外..");
            cc.sys.localStorage.clear();
        }

        this.scheduleUpdate();

        this.blocks = [];

        this.addStage(1);
        this.addStage(11);
        this.addStage(21);

        this.target2 = cc.Sprite.create("res/target.png");
        this.baseNode.addChild(this.target2,99999999);
        this.target2.setPosition(100, 100);
        this.target2.setVisible(false);

        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan: function(touches, event) {
                var location = touches[0].getLocation();
                event.getCurrentTarget().touchStart(touches[0].getLocation());
            },
            onTouchesMoved: function(touches, event) {
                var location = touches[0].getLocation();
                event.getCurrentTarget().touchMove(touches[0].getLocation());
            },
            onTouchesEnded: function(touches, event) {
                event.getCurrentTarget().touchFinish(touches[0].getLocation());
            }
        }), this);

        this.debris_array = [];
        return true;
    },

    getRandNumberFromRange: function(min, max) {
        var rand = min + Math.floor(Math.random() * (max - min));
        return rand;
    },

    addDeburis: function(x,y,typeNum){
        this.debris = new Debris(this,typeNum);
        this.debris_array.push(this.debris);
        this.debris.setPosition(x,y);
        this.baseNode.addChild(this.debris);
    },

    update: function(dt) {

        //デブリをupdate
        for (var i = 0; i < this.debris_array.length; i++) {
            if(this.debris_array[i].update() == false){
                this.baseNode.removeChild(this.debris_array[i]);
                this.debris_array.splice(i,1);
            }
        }        
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].update();

            if(this.blocks[i].isTouchBlock==true){
                this.blocks[i].scaleNum += 0.1;
                //this.blocks[i].setScale(this.blocks[i].scaleNum,this.blocks[i].scaleNum);
            }
        }
        if(this.touchStartCnt >= 1){
            this.touchStartCnt++;
            //少しずつcloseしていく
            for (var i = 0; i < this.blocks.length; i++) {
                if(this.blocks[i].isClose == false && this.blocks[i].isTouchBlock == false){
                    var _rand = this.getRandNumberFromRange(1,3);
                    if(_rand == 2){
                        this.blocks[i].isClose = true;
                    }
                }
            }
            if(this.touchStartCnt == 30 * 2){
                this.goToStageLayer();
            }
        }

    },

    getBaseNodePosition: function(col, row) {
        var _x = (col - 1) * 52 + 52 / 2;
        var _y = 640 - (row) * 52 + 52 / 2
        return [_x, _y];
    },

    addStage:function(stageNum){
        var _roopCnt = 0;
        //横幅はブロック12個
        for (var col = 1; col <= 12; col++) {
            //縦幅は1ステージにつき10個
            for (var row = stageNum; row < stageNum + 10; row++) {

                var _blockNum = null;
                var forceType = null;
                
                //block
                this.block = new Block2(this,_blockNum,forceType);
                this.block.col = col;
                this.block.row = row;
                this.block.stageNum = stageNum;

                this.baseNode.addChild(this.block);
                this.blocks.push(this.block);

                var _pos = this.getBaseNodePosition(col, row);
                this.block.setPosition(_pos[0], _pos[1]);
            }
        }
    },

    //シーンの切り替え----->
    goToStageLayer : function (pSender) 
    {
        var scene = cc.Scene.create();
        //次のステージへいくためにstorageは必ず受けた渡す
        scene.addChild(GameLayer.create(this.storage));
        cc.director.runScene(cc.TransitionFade.create(1.5, scene));
    },

    showInfo: function(text) {
        console.log(text);
        if (this.infoLabel) {
            var lines = this.infoLabel.string.split('\n');
            var t = '';
            if (lines.length > 0) {
                t = lines[lines.length - 1] + '\n';
            }
            t += text;
            this.infoLabel.string = t;
        }
    },
/*
    admobInit: function() {
        if ('undefined' == typeof(sdkbox)) {
            this.showInfo('sdkbox is undefined')
            return;
        }
        if ('undefined' == typeof(sdkbox.PluginAdMob)) {
            this.showInfo('sdkbox.PluginAdMob is undefined')
            return;
        }

        var self = this
        sdkbox.PluginAdMob.setListener({
            adViewDidReceiveAd: function(name) {
                self.showInfo('adViewDidReceiveAd name=' + name);
            },
            adViewDidFailToReceiveAdWithError: function(name, msg) {
                self.showInfo('adViewDidFailToReceiveAdWithError name=' + name + ' msg=' + msg);
            },
            adViewWillPresentScreen: function(name) {
                self.showInfo('adViewWillPresentScreen name=' + name);
            },
            adViewDidDismissScreen: function(name) {
                self.showInfo('adViewDidDismissScreen name=' + name);
            },
            adViewWillDismissScreen: function(name) {
                self.showInfo('adViewWillDismissScreen=' + name);
            },
            adViewWillLeaveApplication: function(name) {
                self.showInfo('adViewWillLeaveApplication=' + name);
            }
        });
        sdkbox.PluginAdMob.init();

        // just for test
        var plugin = sdkbox.PluginAdMob
        if ("undefined" != typeof(plugin.deviceid) && plugin.deviceid.length > 0) {
            this.showInfo('deviceid=' + plugin.deviceid);
            // plugin.setTestDevices(plugin.deviceid);
        }
    },
*/
/*
    //GameCenter
    sdkboxPlayInit: function() {
        if ('undefined' == typeof(sdkbox)) {
            this.showInfo('sdkbox is undefined')
            return;
        }
        if ('undefined' == typeof(sdkbox.PluginSdkboxPlay)) {
            this.showInfo('sdkbox.PluginSdkboxPlay is undefined')
            return;
        }
        if ("undefined" != typeof(sdkbox.PluginSdkboxPlay)) {
            var plugin = sdkbox.PluginSdkboxPlay
            plugin.setListener({
                onScoreSubmitted: function(leaderboard_name, score, maxScoreAllTime, maxScoreWeek, maxScoreToday) {
                    cc.log("on score " + score + " submitted to leaderboard: " + leaderboard_name);
                    cc.log("all time hi " + maxScoreAllTime ? 1 : 0);
                    cc.log("weekly hi " + maxScoreWeek ? 1 : 0);
                    cc.log("daily hi " + maxScoreToday ? 1 : 0);
                },
                onIncrementalAchievementUnlocked: function(achievement_name) {
                    cc.log("incremental achievement " + achievement_name + " unlocked.");
                },
                onIncrementalAchievementStep: function(achievement_name, step) {
                    cc.log("incremental achievent " + achievement_name + " step: " + step);
                },
                onAchievementUnlocked: function(achievement_name, newlyUnlocked) {
                    cc.log("achievement " + achievement_name + " unlocked (new " + newlyUnlocked ? 1 : 0 + ")");
                },
                onConnectionStatusChanged: function(connection_status) {
                    cc.log("connection status change: " + connection_status + " connection_status");
                }
            });
            plugin.init();

        } else {
            printf("no plugin init")
        }
    },

    showGameCenterLeaderboard: function() {
        cc.log("call showGameCenterLeaderboard");
        if ('undefined' == typeof(sdkbox)) {
            this.showInfo('sdkbox is undefined')
            return;
        }
        if ('undefined' == typeof(sdkbox.PluginSdkboxPlay)) {
            this.showInfo('sdkbox.PluginSdkboxPlay is undefined')
            return;
        }
        sdkbox.PluginSdkboxPlay.signin();

        if(this.storage.maxGameScore != 0){
            this.sendScoreToGameCenter(this.storage.maxGameScore);
        }

        sdkbox.PluginSdkboxPlay.showLeaderboard("ohedo_score_ranking");
        sdkbox.PluginSdkboxPlay.showAchievements();
    },

    sendScoreToGameCenter: function(score) {
        if ('undefined' == typeof(sdkbox)) {
            this.showInfo('sdkbox is undefined')
            return;
        }
        if ('undefined' == typeof(sdkbox.PluginSdkboxPlay)) {
            this.showInfo('sdkbox.PluginSdkboxPlay is undefined')
            return;
        }
        sdkbox.PluginSdkboxPlay.submitScore("ohedo_score_ranking", score);
    },
*/
    touchStart: function(location) {
        this.touchStartCnt = 1;
        //this.logo.setVisible(true);

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
            cc.log("aaaa");
            minDistBlock.isTouchBlock = true;
        }

    },

    touchMove: function(location) {

    },

    touchFinish: function(location) {

    },
});

TopLayer.create = function () 
{
    return new TopLayer();
};

var TopLayerScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        var layer = new TopLayer();
        this.addChild(layer);
    }
});