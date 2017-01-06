var WindyTyModifier = (function () {
    function WindyTyModifier(activityId, appResources, userSettings) {
        this.activityId = activityId;
        this.appResources = appResources;
        this.userSettings = userSettings;
    }
    WindyTyModifier.prototype.modify = function () {
        var _this = this;
        if (_.isUndefined(window.pageView)) {
            return;
        }
        this.getActivityBaryCenter(function (baryCenterPosition) {
            if (!baryCenterPosition) {
                console.log('Skipping WindyTyModifier execution, no baryCenterPosition available');
                return;
            }
            _this.baryCenterPosition = baryCenterPosition;
            _this.modifyPage();
        });
    };
    WindyTyModifier.prototype.getActivityBaryCenter = function (callback) {
        var url = "/activities/" + this.activityId + "/streams?stream_types[]=latlng";
        $.ajax({
            url: url,
            dataType: 'json'
        }).done(function (jsonResponse) {
            if (_.isEmpty(jsonResponse.latlng)) {
                callback(null);
                return;
            }
            var firstMiddleLastPosition = [];
            firstMiddleLastPosition.push(jsonResponse.latlng[0]);
            firstMiddleLastPosition.push(jsonResponse.latlng[Math.round((jsonResponse.latlng.length - 1) / 2)]);
            firstMiddleLastPosition.push(jsonResponse.latlng[jsonResponse.latlng.length - 1]);
            var startPoint = jsonResponse.latlng[0];
            var midPoint = jsonResponse.latlng[Math.round((jsonResponse.latlng.length - 1) / 2)];
            var endPoint = jsonResponse.latlng[jsonResponse.latlng.length - 1];
            var baryCenterPoint = [];
            baryCenterPoint[0] = (startPoint[0] + endPoint[0]) / 2;
            baryCenterPoint[1] = (startPoint[1] + endPoint[1]) / 2;
            baryCenterPoint[0] = (baryCenterPoint[0] + midPoint[0]) / 2;
            baryCenterPoint[1] = (baryCenterPoint[1] + midPoint[1]) / 2;
            callback(new LatLon(baryCenterPoint[0], baryCenterPoint[1]));
        });
    };
    WindyTyModifier.prototype.modifyPage = function () {
        var _this = this;
        var remoteViewActivityLinksArray = [
            ['Wind', 'wind'],
            ['Temp', 'temp'],
            ['Clouds', 'clouds'],
            ['Humidity', 'rh'],
        ];
        var html = "<li class='group'>";
        html += "<div class='title' style='font-size: 14px; cursor: pointer;' id='stravistix_weather_title'>Weather</div>";
        html += "<ul style='display: none;' id='stravistix_weatherList'>";
        $.each(remoteViewActivityLinksArray, function () {
            html += "<li>";
            html += "<a data-wheater-windyty='" + this[1] + "' href='#'>" + this[0] + "</a>";
            html += "</li>";
        });
        html += "</ul>";
        $("#pagenav").append($(html)).each(function () {
            $('[data-wheater-windyty]').click(function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                _this.showWeather($(evt.target).attr('data-wheater-windyty'));
            });
            $('#stravistix_weather_title').click(function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if ($('#stravistix_weatherList').is(':visible')) {
                    $('#stravistix_weatherList').slideUp();
                }
                else {
                    $('#stravistix_weatherList').slideDown();
                }
            });
        });
    };
    WindyTyModifier.prototype.showWeather = function (type) {
        var date = new Date(window.pageView.activity().get('startDateLocal') * 1000);
        var defaultZoomLevel = 11;
        var windyTyHour = Math.round(date.getUTCHours() / 6) * 6;
        var windUnitConfig = 'metric.wind.' + this.userSettings.windUnit;
        var temperatureUnitConfig = 'metric.temp.' + this.userSettings.temperatureUnit;
        var url = 'https://embed.windyty.com/?' +
            this.baryCenterPosition.lat + ',' +
            this.baryCenterPosition.lon + ',' +
            defaultZoomLevel + ',' +
            date.toISOString().split('T')[0] + '-' + this.pad(windyTyHour, 2) + ',' +
            type + ',' +
            windUnitConfig + ',' +
            temperatureUnitConfig;
        console.debug('Load wheather url: ' + url);
        $.fancybox({
            'width': '100%',
            'height': '100%',
            'autoScale': true,
            'transitionIn': 'fade',
            'transitionOut': 'fade',
            'type': 'iframe',
            'content': '<iframe src="' + url + '" width="' + window.innerWidth * 0.950 + '" height="' + window.innerHeight * 0.875 + '" frameborder="0"></iframe>'
        });
    };
    WindyTyModifier.prototype.pad = function (number, width, z) {
        z = z || '0';
        var n = number + '';
        return (n.length >= width) ? n : new Array(width - n.length + 1).join(z) + n;
    };
    return WindyTyModifier;
}());
