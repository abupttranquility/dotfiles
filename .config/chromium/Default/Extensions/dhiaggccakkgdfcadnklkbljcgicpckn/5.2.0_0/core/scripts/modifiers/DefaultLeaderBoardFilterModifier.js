var DefaultLeaderBoardFilterModifier = (function () {
    function DefaultLeaderBoardFilterModifier(defaultLeaderBoardFilter) {
        this.defaultLeaderBoardFilter = defaultLeaderBoardFilter;
    }
    DefaultLeaderBoardFilterModifier.prototype.modify = function () {
        if (this.defaultLeaderBoardFilter === 'overall') {
            return;
        }
        var view = Strava.Labs.Activities.SegmentLeaderboardView;
        if (!view) {
            return;
        }
        var functionRender = view.prototype.render;
        var that = this;
        view.prototype.render = function () {
            var r = functionRender.apply(this, Array.prototype.slice.call(arguments));
            $(this.el).not('.once-only').addClass('once-only').find('.clickable[data-filter=' + that.defaultLeaderBoardFilter + ']').click();
            return r;
        };
    };
    return DefaultLeaderBoardFilterModifier;
}());
