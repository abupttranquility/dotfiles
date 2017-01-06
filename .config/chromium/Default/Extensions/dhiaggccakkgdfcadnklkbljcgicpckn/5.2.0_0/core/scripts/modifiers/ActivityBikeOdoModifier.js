var ActivityBikeOdoModifier = (function () {
    function ActivityBikeOdoModifier(bikeOdoArray, cacheKey) {
        this.bikeOdoArray = bikeOdoArray;
        this.cacheKey = cacheKey;
    }
    ActivityBikeOdoModifier.prototype.modify = function () {
        var _this = this;
        var bikeDisplayedOnActivityPage = $('.gear-name').text().trim();
        var activityBikeOdo = 'No bike declared';
        try {
            activityBikeOdo = this.bikeOdoArray[btoa(bikeDisplayedOnActivityPage)];
        }
        catch (err) {
            console.warn('Unable to find bike odo for this Activity');
        }
        var newBikeDisplayHTML = bikeDisplayedOnActivityPage + '<strong> / ' + activityBikeOdo + '</strong>';
        var forceRefreshActionHTML = '<a href="#" style="cursor: pointer;" title="Force odo refresh for this athlete\'s bike. Usually it refresh every 2 hours..." id="bikeOdoForceRefresh">Force refresh odo</a>';
        $('.gear-name').html(newBikeDisplayHTML + '<br />' + forceRefreshActionHTML).each(function () {
            $('#bikeOdoForceRefresh').on('click', function () {
                _this.handleUserBikeOdoForceRefresh();
            });
        });
    };
    ActivityBikeOdoModifier.prototype.handleUserBikeOdoForceRefresh = function () {
        localStorage.removeItem(this.cacheKey);
        window.location.reload();
    };
    return ActivityBikeOdoModifier;
}());
