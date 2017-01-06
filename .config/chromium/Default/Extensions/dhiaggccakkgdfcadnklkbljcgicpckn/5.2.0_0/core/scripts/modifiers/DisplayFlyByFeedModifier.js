var DisplayFlyByFeedModifier = (function () {
    function DisplayFlyByFeedModifier() {
    }
    DisplayFlyByFeedModifier.prototype.modify = function () {
        setInterval(function () {
            $('.entry-container>h3>a[href*=activities]').each(function (index, element) {
                if (!$(element).parent().parent().find('.sx-flyby').length) {
                    var activityId_1 = parseInt($(element).attr('href').split('/')[2]);
                    var html = '<a href="#" title="FlyBy" class="sx-flyby">Go to FlyBy</a>';
                    $(element).parent().parent().find('.btn-group').after('</br></br>' + html + '</br></br>').each(function () {
                        $(element).parent().parent().find('.sx-flyby').click(function () {
                            window.open('http://labs.strava.com/flyby/viewer/?utm_source=strava_activity_header#' + activityId_1);
                        });
                    });
                }
            });
        }, 750);
    };
    return DisplayFlyByFeedModifier;
}());
