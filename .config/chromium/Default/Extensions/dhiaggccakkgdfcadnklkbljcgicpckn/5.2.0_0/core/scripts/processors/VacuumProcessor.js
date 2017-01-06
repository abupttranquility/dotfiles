var VacuumProcessor = (function () {
    function VacuumProcessor() {
    }
    VacuumProcessor.prototype.getAthleteId = function () {
        var athleteId = null;
        try {
            if (!_.isUndefined(window.currentAthlete) && !_.isUndefined(window.currentAthlete.id)) {
                athleteId = window.currentAthlete.id;
            }
        }
        catch (err) {
            if (env.debugMode)
                console.warn(err);
        }
        return athleteId;
    };
    VacuumProcessor.prototype.getAthleteName = function () {
        var athleteName = null;
        try {
            if (!_.isUndefined(window.currentAthlete) && !_.isUndefined(window.currentAthlete.get('display_name'))) {
                athleteName = window.currentAthlete.get('display_name');
            }
        }
        catch (err) {
            if (env.debugMode)
                console.warn(err);
        }
        return athleteName;
    };
    VacuumProcessor.prototype.getAthleteIdAuthorOfActivity = function () {
        if (_.isUndefined(window.pageView)) {
            return null;
        }
        if (!window.pageView.activityAthlete()) {
            return null;
        }
        if (_.isUndefined(window.pageView.activityAthlete().get('id'))) {
            return null;
        }
        return window.pageView.activityAthlete().get('id');
    };
    VacuumProcessor.prototype.getPremiumStatus = function () {
        var premiumStatus = null;
        try {
            if (!_.isUndefined(window.currentAthlete)) {
                premiumStatus = window.currentAthlete.attributes.premium;
            }
        }
        catch (err) {
            if (env.debugMode)
                console.warn(err);
        }
        return premiumStatus;
    };
    VacuumProcessor.prototype.getCurrentAthlete = function () {
        return window.currentAthlete;
    };
    VacuumProcessor.prototype.getProStatus = function () {
        var proStatus = false;
        var currentAthlete = this.getCurrentAthlete();
        try {
            if (currentAthlete && currentAthlete.attributes && currentAthlete.attributes.pro) {
                proStatus = currentAthlete.attributes.pro;
            }
        }
        catch (err) {
            if (env.debugMode)
                console.warn(err);
        }
        return proStatus;
    };
    VacuumProcessor.prototype.getActivityId = function () {
        return (_.isUndefined(window.pageView)) ? null : window.pageView.activity().id;
    };
    VacuumProcessor.prototype.getAthleteWeight = function () {
        return (_.isUndefined(window.pageView)) ? null : window.pageView.activityAthleteWeight();
    };
    VacuumProcessor.prototype.getActivityStatsMap = function () {
        var actStatsContainer = $(".activity-summary-container");
        var distance = this.formatActivityDataValue(actStatsContainer.find('.inline-stats.section').children().first().text(), false, false, true, false);
        var movingTime = this.formatActivityDataValue(actStatsContainer.find('.inline-stats.section').children().first().next().text(), true, false, false, false);
        var elevation = this.formatActivityDataValue(actStatsContainer.find('.inline-stats.section').children().first().next().next().text(), false, true, false, false);
        var avgPower = this.formatActivityDataValue($('[data-glossary-term*=definition-average-power]').parent().parent().children().first().text(), false, false, false, false);
        var weightedPower = this.formatActivityDataValue($('[data-glossary-term*=definition-weighted-average-power]').parent().parent().children().first().text(), false, false, false, false);
        var energyOutput = this.formatActivityDataValue(actStatsContainer.find('.inline-stats.section.secondary-stats').children().first().next().children().first().text(), false, false, false, true);
        var elapsedTime = this.formatActivityDataValue($('[data-glossary-term*=definition-elapsed-time]').parent().parent().children().last().text(), true, false, false, false);
        if (!elapsedTime) {
            elapsedTime = this.formatActivityDataValue($('.section.more-stats').children().last().text(), true, false, false, false);
        }
        if (elapsedTime - movingTime < 0) {
            var elapsedTimeCopy = elapsedTime;
            elapsedTime = movingTime;
            movingTime = elapsedTimeCopy;
        }
        var averageSpeed = this.formatActivityDataValue(actStatsContainer.find('.section.more-stats').find('.unstyled').children().first().next().children().first().children().first().next().text(), false, false, false, false);
        if (!averageSpeed) {
            averageSpeed = this.formatActivityDataValue($('[data-glossary-term*=definition-moving-time]').parent().parent().first().next().children().first().text(), true, false, false, false);
            averageSpeed = 1 / averageSpeed;
            averageSpeed = averageSpeed * 60 * 60;
            var measurementPreference = window.currentAthlete.get('measurement_preference');
            var speedFactor = (measurementPreference == 'meters') ? 1 : 0.62137;
            averageSpeed = averageSpeed / speedFactor;
        }
        var averageHeartRate = this.formatActivityDataValue(actStatsContainer.find('.section.more-stats').find('.unstyled').children().first().next().next().children().first().children().first().next().has('abbr').text(), false, false, false, false);
        var maxHeartRate = this.formatActivityDataValue(actStatsContainer.find('.section.more-stats').find('.unstyled').children().first().next().next().children().first().children().first().next().next().text(), false, false, false, false);
        var activityCommonStats = {
            distance: distance,
            elevation: elevation,
            avgPower: avgPower,
            averageSpeed: averageSpeed
        };
        return activityCommonStats;
    };
    VacuumProcessor.prototype.formatActivityDataValue = function (dataIn, parsingTime, parsingElevation, parsingDistance, parsingEnergy) {
        if (dataIn === "") {
            return null;
        }
        var cleanData = dataIn.toLowerCase();
        cleanData = cleanData.replace(new RegExp(/\s/g), '');
        cleanData = cleanData.replace(new RegExp(/[àáâãäå]/g), '');
        cleanData = cleanData.replace(new RegExp(/æ/g), '');
        cleanData = cleanData.replace(new RegExp(/ç/g), '');
        cleanData = cleanData.replace(new RegExp(/[èéêë]/g), '');
        cleanData = cleanData.replace(new RegExp(/[ìíîï]/g), '');
        cleanData = cleanData.replace(new RegExp(/ñ/g), '');
        cleanData = cleanData.replace(new RegExp(/[òóôõö]/g), '');
        cleanData = cleanData.replace(new RegExp(/œ/g), "o");
        cleanData = cleanData.replace(new RegExp(/[ùúûü]/g), '');
        cleanData = cleanData.replace(new RegExp(/[ýÿ]/g), '');
        cleanData = cleanData.replace(/\s/g, '').trim();
        cleanData = cleanData.replace(/[\n\r]/g, '');
        cleanData = cleanData.replace(/([a-z]|[A-Z])+/g, '').trim();
        if (parsingTime) {
            cleanData = Helper.HHMMSStoSeconds(cleanData);
            if (_.isNaN(cleanData)) {
                return null;
            }
        }
        else if (parsingElevation) {
            cleanData = cleanData.replace(' ', '').replace(',', '');
        }
        else if (parsingDistance) {
            cleanData = cleanData.replace(',', '.');
        }
        else if (parsingEnergy) {
            cleanData = cleanData.replace(',', '.').replace('.', '');
        }
        else {
            cleanData = cleanData.replace(',', '.');
        }
        return parseFloat(cleanData);
    };
    VacuumProcessor.prototype.getActivityStream = function (callback) {
        var _this = this;
        var cache = localStorage.getItem(VacuumProcessor.cachePrefix + this.getActivityId());
        if (cache) {
            cache = JSON.parse(cache);
            callback(cache.activityCommonStats, cache.stream, cache.athleteWeight, cache.hasPowerMeter);
            return;
        }
        var url = "/activities/" + this.getActivityId() + "/streams?stream_types[]=watts_calc&stream_types[]=watts&stream_types[]=velocity_smooth&stream_types[]=time&stream_types[]=distance&stream_types[]=cadence&stream_types[]=heartrate&stream_types[]=grade_smooth&stream_types[]=altitude&stream_types[]=latlng";
        $.ajax(url).done(function (activityStream) {
            var hasPowerMeter = true;
            if (_.isEmpty(activityStream.watts)) {
                activityStream.watts = activityStream.watts_calc;
                hasPowerMeter = false;
            }
            try {
                localStorage.setItem(VacuumProcessor.cachePrefix + _this.getActivityId(), JSON.stringify({
                    activityCommonStats: _this.getActivityStatsMap(),
                    stream: activityStream,
                    athleteWeight: _this.getAthleteWeight(),
                    hasPowerMeter: hasPowerMeter
                }));
            }
            catch (err) {
                console.warn(err);
                localStorage.clear();
            }
            callback(_this.getActivityStatsMap(), activityStream, _this.getAthleteWeight(), hasPowerMeter);
        });
    };
    VacuumProcessor.prototype.getSegmentsFromBounds = function (vectorA, vectorB, callback) {
        var segmentsUnify = {
            cycling: null,
            running: null
        };
        $.when($.ajax({
            url: '/api/v3/segments/search',
            data: {
                bounds: vectorA + ',' + vectorB,
                min_cat: '0',
                max_cat: '5',
                activity_type: 'cycling'
            },
            type: 'GET',
            crossDomain: true,
            dataType: 'jsonp',
            success: function (xhrResponseText) {
                segmentsUnify.cycling = xhrResponseText;
            },
            error: function (err) {
                console.error(err);
            }
        }), $.ajax({
            url: '/api/v3/segments/search',
            data: {
                bounds: vectorA + ',' + vectorB,
                min_cat: '0',
                max_cat: '5',
                activity_type: 'running'
            },
            type: 'GET',
            crossDomain: true,
            dataType: 'jsonp',
            success: function (xhrResponseText) {
                segmentsUnify.running = xhrResponseText;
            },
            error: function (err) {
                console.error(err);
            }
        })).then(function () {
            callback(segmentsUnify);
        });
    };
    VacuumProcessor.prototype.getSegmentStream = function (segmentId, callback) {
        $.ajax({
            url: '/stream/segments/' + segmentId,
            dataType: 'json',
            type: 'GET',
            success: function (xhrResponseText) {
                callback(xhrResponseText);
            },
            error: function (err) {
                console.error(err);
            }
        });
    };
    VacuumProcessor.prototype.getBikeOdoOfAthlete = function (athleteId, callback) {
        if (_.isUndefined(window.pageView)) {
            callback(null);
            return;
        }
        if (window.pageView.activity().attributes.type != "Ride") {
            callback(null);
            return;
        }
        var url = location.protocol + "//www.strava.com/athletes/" + athleteId;
        $.ajax({
            url: url,
            dataType: 'json'
        }).always(function (data) {
            var bikeOdoArray = {};
            _.each($(data.responseText).find('div.gear>table>tbody>tr'), function (element) {
                var bikeName = $(element).find('td').first().text().trim();
                var bikeOdo = $(element).find('td').last().text().trim();
                bikeOdoArray[btoa(window.unescape(encodeURIComponent(bikeName)))] = bikeOdo;
            });
            callback(bikeOdoArray);
        });
    };
    VacuumProcessor.prototype.getActivityTime = function () {
        var activityTime = $(".activity-summary-container").find('time').text().trim();
        return (activityTime) ? activityTime : null;
    };
    VacuumProcessor.prototype.getActivityName = function () {
        var activityName = $(".activity-summary-container").find('.marginless.activity-name').text().trim();
        return (activityName) ? activityName : null;
    };
    VacuumProcessor.cachePrefix = 'stravistix_activityStream_';
    return VacuumProcessor;
}());
