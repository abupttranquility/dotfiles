var currentDate = new Date();
(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * currentDate;
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'follow');
follow('create', env.analyticsTrackingID, 'auto');
follow('send', 'pageview');
var AthleteUpdate = (function () {
    function AthleteUpdate() {
    }
    AthleteUpdate.create = function (stravaId, name, version, isPremium, isPro, country, hrMin, hrMax) {
        if (stravaId < 1 || _.isEmpty(name) || _.isEmpty(version) || !_.isBoolean(isPremium) || !_.isBoolean(isPro)) {
            return null;
        }
        var status = 0;
        if (isPremium) {
            status = 1;
        }
        if (isPro) {
            status = 2;
        }
        var athleteUpdate = {
            stravaId: stravaId,
            name: _.isEmpty(name) ? null : name,
            version: version,
            status: status,
            hrMin: hrMin,
            hrMax: hrMax
        };
        if (!_.isEmpty(country)) {
            athleteUpdate.country = country;
        }
        return athleteUpdate;
    };
    AthleteUpdate.commit = function (athleteUpdate) {
        $.post({
            url: env.endPoint + '/api/athlete/update',
            data: JSON.stringify(athleteUpdate),
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                console.log('Updated: ', response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.warn('Endpoint <' + env.endPoint + '> not reachable', jqXHR);
            }
        });
    };
    return AthleteUpdate;
}());
