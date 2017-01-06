var ActivityStravaMapTypeModifier = (function () {
    function ActivityStravaMapTypeModifier(mapType) {
        this.mapType = mapType;
    }
    ActivityStravaMapTypeModifier.prototype.modify = function () {
        if (this.mapType === 'terrain') {
            return;
        }
        var mapGoal = this.mapType;
        setInterval(function () {
            $('a.map-type-selector[data-map-type-id=' + mapGoal + ']')
                .not('.once-only')
                .addClass('once-only')
                .click()
                .parents('.drop-down-menu')
                .click();
        }, 750);
    };
    return ActivityStravaMapTypeModifier;
}());
