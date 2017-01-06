var HideFeedModifier = (function () {
    function HideFeedModifier(userSettings) {
        this.userSettings = userSettings;
    }
    HideFeedModifier.prototype.modify = function () {
        var _this = this;
        var timeout = 250;
        setInterval(function () {
            if (_this.userSettings.feedHideChallenges) {
                $('.feed-container').find('.challenge').remove();
            }
            if (_this.userSettings.feedHideCreatedRoutes) {
                $('div.feed>.min-view').each(function (index, element) {
                    if ($('div.feed').find('div.entry-container').has('a[href*=\'/routes\']').length > 0)
                        $(element).remove();
                });
            }
            if (_this.userSettings.feedHideRideActivitiesUnderDistance > 0 || _this.userSettings.feedHideRunActivitiesUnderDistance > 0) {
                var minRideDistanceToHide_1 = _this.userSettings.feedHideRideActivitiesUnderDistance;
                var minRunDistanceToHide_1 = _this.userSettings.feedHideRunActivitiesUnderDistance;
                $('div.feed>.activity').each(function (index, element) {
                    var type = $(element).find('div').first().attr('class').replace('icon-sm', '').replace('  ', ' ').split(' ')[1].replace('icon-sm', '').replace('icon-', '');
                    var distanceEl = _.filter($(element).find('ul.inline-stats').find('[class=unit]'), function (item) {
                        return ($(item).html() == 'km' || $(item).html() == 'mi');
                    });
                    var distance = parseFloat($(distanceEl).parent().text().replace(',', '.'));
                    if ((minRideDistanceToHide_1 > 0) && distance && (distance < minRideDistanceToHide_1) && (type === "ride" || type === "virtualride")) {
                        $(element).remove();
                    }
                    if ((minRunDistanceToHide_1 > 0) && distance && (distance < minRunDistanceToHide_1) && type === "run") {
                        $(element).remove();
                    }
                });
            }
            $('div.feed>.time-header').each(function (index, element) {
                var timeHeaderElement = $(element);
                if (timeHeaderElement.nextUntil('.time-header').not('script').length === 0) {
                    timeHeaderElement.remove();
                }
            });
        }, timeout);
    };
    return HideFeedModifier;
}());
