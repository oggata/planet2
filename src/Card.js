var Card = cc.Node.extend({
    ctor: function (game, itemType, m001Num, m002Num, m003Num, m004Num) {
        this._super();
        this.game = game;
        this.itemType = itemType;
        this.m001Num = m001Num;
        this.m002Num = m002Num;
        this.m003Num = m003Num;
        this.m004Num = m004Num;
        this.sprite = cc.Node.create();;
        this.addChild(this.sprite);
        if (this.itemType == 1) {
            //ax 斧が回復する
            this.item = cc.Sprite.create("res/item_001.png");
        } else if (this.itemType == 2) {
            //bomb 周囲が爆発する
            this.item = cc.Sprite.create("res/item_002.png");
        } else if (this.itemType == 3) {
            //powerup 
            this.item = cc.Sprite.create("res/item_003.png");
        } else if (this.itemType == 4) {
            //right
            this.item = cc.Sprite.create("res/item_004.png");
        } else if (this.itemType == 5) {
            //toumei
            this.item = cc.Sprite.create("res/item_005.png");
        }
        this.sprite.addChild(this.item);
        this.item.setPosition(270, 72);
        this.b001 = cc.Sprite.create("res/material_998.png");
        this.sprite.addChild(this.b001);
        this.b001.setPosition(32, 72);
        if (m001Num) {
            this.setMaterialSprite(m001Num, this.b001);
        }
        this.c001 = cc.Sprite.create("res/material_998.png");
        this.c001.setVisible(false);
        this.c001.setAnchorPoint(0, 0);
        this.b001.addChild(this.c001);
        this.b002 = cc.Sprite.create("res/material_998.png");
        this.sprite.addChild(this.b002);
        this.b002.setPosition(32 + 56 * 1, 72);
        if (m002Num) {
            this.setMaterialSprite(m002Num, this.b002);
        }
        this.c002 = cc.Sprite.create("res/material_998.png");
        this.c002.setVisible(false);
        this.c002.setAnchorPoint(0, 0);
        this.b002.addChild(this.c002);
        this.b003 = cc.Sprite.create("res/material_998.png");
        this.sprite.addChild(this.b003);
        this.b003.setPosition(32 + 56 * 2, 72);
        if (m003Num) {
            this.setMaterialSprite(m003Num, this.b003);
        }
        this.c003 = cc.Sprite.create("res/material_998.png");
        this.c003.setVisible(false);
        this.c003.setAnchorPoint(0, 0);
        this.b003.addChild(this.c003);
        this.b004 = cc.Sprite.create("res/material_998.png");
        this.sprite.addChild(this.b004);
        this.b004.setPosition(32 + 56 * 3, 72);
        if (m004Num) {
            this.setMaterialSprite(m004Num, this.b004);
        }
        this.c004 = cc.Sprite.create("res/material_998.png");
        this.c004.setVisible(false);
        this.c004.setAnchorPoint(0, 0);
        this.b004.addChild(this.c004);
        this.usedCnt = 0;
    },
    dig: function (mNum) {
        if (this.m001Num == mNum) {
            this.m001Num = null;
            this.c001.setVisible(true);
        } else if (this.m002Num == mNum) {
            this.m002Num = null;
            this.c002.setVisible(true);
        } else if (this.m003Num == mNum) {
            this.m003Num = null;
            this.c003.setVisible(true);
        } else if (this.m004Num == mNum) {
            this.m004Num = null;
            this.c004.setVisible(true);
        }
    },
    setMaterialSprite: function (materialNum, baseSprite) {
        this.material = null;
        switch (materialNum) {
        case 1:
            this.material = cc.Sprite.create("res/block001.png");
            break;
        case 2:
            this.material = cc.Sprite.create("res/block002.png");
            break;
        case 3:
            this.material = cc.Sprite.create("res/block003.png");
            break;
        case 4:
            this.material = cc.Sprite.create("res/block004.png");
            break;
        case 5:
            this.material = cc.Sprite.create("res/block005.png");
            break;
        case 6:
            this.material = cc.Sprite.create("res/block006.png");
            break;
        case 7:
            this.material = cc.Sprite.create("res/block007.png");
            break;
        case 8:
            this.material = cc.Sprite.create("res/block008.png");
            break;
        }
        this.material.setAnchorPoint(0, 0);
        baseSprite.addChild(this.material);
        return this.material;
    },
    init: function () {},
    useCard: function () {
        if (this.itemType == 1) {
            this.useCardAx();
        } else if (this.itemType == 2) {
            this.useCardBomb();
        } else if (this.itemType == 3) {}
    },
    useCardAx: function () {
        this.game.player.axHp += this.game.player.axMaxHp / 4;
        if (this.game.player.axHp >= this.game.player.axMaxHp) {
            this.game.player.axHp = this.game.player.axMaxHp;
        }
    },
    useCardBomb: function () {
        var _blocks = this.game.getBlocks2(this.game.player.lastDigBlock.col, this.game.player.lastDigBlock.row);
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
    update: function () {
        if (this.m001Num == null && this.m002Num == null && this.m003Num == null && this.m004Num == null && this.m005Num ==
            null && this.m006Num == null && this.m007Num == null && this.m008Num == null) {
            this.usedCnt++;
            this.setPosition(this.getPosition().x + this.usedCnt * 2, this.getPosition().y);
            /*ここで発動*/
            if (this.usedCnt == 5) {
                this.useCard();
            }
            if (this.usedCnt >= 30) {
                return false;
            }
        }
        return true;
    },
});