var ErrorMessage = cc.Node.extend({
    ctor: function(game) {
        this._super();
        this.game = game;

        this.sprite001 = cc.Sprite.create("res/label_no_bright_error.png");
        this.addChild(this.sprite001);

        this.sprite002 = cc.Sprite.create("res/label_no_ax_error.png");
        this.addChild(this.sprite002);

        this.setPosition(320,700);
        //this.sprite.setPosition(100, 100);

        this.visibleCnt = 0;
    },
    init: function() {},

    setType:function(typeNum){
    	this.visibleCnt = 1;
    	this.setVisible(true);
    	this.typeNum = typeNum;
    	if(typeNum == 1){
    		this.sprite001.setVisible(true);
    		this.sprite002.setVisible(false);
    	}
    	if(typeNum == 2){
    		this.sprite001.setVisible(false);
    		this.sprite002.setVisible(true);
    	}
    },

    update: function() {
    	if(this.visibleCnt >= 1){
    		this.visibleCnt++;
    	}
    	if(this.visibleCnt>=30){
    		this.visibleCnt = 0;
    		this.setVisible(false);
    	}
        return true;
    },
});