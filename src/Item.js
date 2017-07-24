var Item = cc.Node.extend({
    ctor: function(game) {
        this._super();
        this.game = game;
    },
    init: function() {},

    update: function() {
        return true;
    },
});