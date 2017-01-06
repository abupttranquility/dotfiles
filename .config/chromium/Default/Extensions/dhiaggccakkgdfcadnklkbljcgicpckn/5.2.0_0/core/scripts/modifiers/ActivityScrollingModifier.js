var ActivityScrollingModifier = (function () {
    function ActivityScrollingModifier() {
    }
    ActivityScrollingModifier.prototype.modify = function () {
        if (window.location.pathname.indexOf('/dashboard') === -1) {
            return;
        }
        var w = $(window);
        var container = $('.feed-container');
        w.scroll(function () {
            var elem = container.find('a.load-feed');
            if (_.isEqual(elem.length, 0)) {
                return;
            }
            var offset = 50;
            var elem_top = elem.offset().top;
            var window_top = w.scrollTop();
            var window_bottom = w.height() + window_top;
            if ((elem_top >= window_top + offset) && (elem_top < window_bottom)) {
                elem.click().remove();
            }
        });
    };
    return ActivityScrollingModifier;
}());
