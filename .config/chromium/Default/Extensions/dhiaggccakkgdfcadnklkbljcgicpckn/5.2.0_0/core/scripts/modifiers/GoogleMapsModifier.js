var GoogleMapsModifier = (function () {
    function GoogleMapsModifier(activityId, appResources, userSettings) {
        this.activityId = activityId;
        this.appResources = appResources;
        this.userSettings = userSettings;
    }
    GoogleMapsModifier.prototype.modify = function () {
        if (this.isAnalysisSection()) {
            console.log('[GoogleMapsModifier] Skipping Analysis Section');
            return;
        }
        this.getGoogleMapsApi();
        this.googleMapsApiLoaded(this.activityId);
    };
    GoogleMapsModifier.prototype.googleMapsApiLoaded = function (activityId) {
        var _this = this;
        this.placeGoogleMapsButtons(activityId);
        $('[data-menu="overview"]').click(function () {
            setTimeout(function () {
                _this.placeGoogleMapsButtons(activityId);
            });
        });
        $('[data-menu="segments"]').click(function () {
            setTimeout(function () {
                _this.placeGoogleMapsButtons(activityId);
            });
        });
        return true;
    };
    GoogleMapsModifier.prototype.showWaitLoadingMessage = function () {
        $.fancybox('<div style="text-align: center; padding-top: 15px;"><img src="' + this.appResources.loadingIcon + '"/></div>', {
            autoScale: true,
            closeBtn: false
        });
    };
    GoogleMapsModifier.prototype.placeGoogleMapsButtons = function (activityId) {
        this.placeMainGoogleMapButton(activityId);
        this.placeSegmentAreaGoogleMapButton(activityId);
    };
    GoogleMapsModifier.prototype.placeMainGoogleMapButton = function (activityId) {
        var _this = this;
        if (!$('#map-canvas') || $('#map-canvas').is(':hidden') || $('#showInGoogleMap').length) {
            return;
        }
        $('#map-canvas').before('<a class="button btn-block btn-primary" id="showInGoogleMap">View in Google Maps</a>').each(function () {
            $('#showInGoogleMap').on('click', function () {
                _this.showWaitLoadingMessage();
                _this.fetchPathFromStream(activityId, function (pathArray) {
                    _this.pathArray = pathArray;
                    var effortId = _this.getEffortId();
                    if (effortId) {
                        _this.fetchSegmentInfoAndDisplayWithGoogleMap(_this.pathArray, effortId);
                    }
                    else {
                        _this.displayGoogleMapWithPath(_this.pathArray);
                    }
                });
            });
        });
    };
    GoogleMapsModifier.prototype.placeSegmentAreaGoogleMapButton = function (activityId) {
        if (!Strava.Labs)
            return;
        var view = Strava.Labs.Activities.SegmentLeaderboardView;
        if (!view)
            return;
        var functionRender = view.prototype.render;
        var that = this;
        view.prototype.render = function () {
            var r = functionRender.apply(this, Array.prototype.slice.call(arguments));
            if ($('#showSegInGoogleMap').length) {
                return;
            }
            var anchor;
            if ($('.effort-map')) {
                anchor = $('.effort-map');
            }
            else if ($('#map-canvas')) {
                anchor = $('#map-canvas');
            }
            else {
                anchor = null;
            }
            if (!anchor) {
                console.error('No anchor found to attach segment google map button');
            }
            anchor.before('<a class="button btn-block btn-primary" id="showSegInGoogleMap">View in Google Maps</a>').each(function () {
                $('#showSegInGoogleMap').on('click', function () {
                    that.showWaitLoadingMessage();
                    that.fetchPathFromStream(activityId, function (pathArray) {
                        that.pathArray = pathArray;
                        var effortId = that.getEffortId();
                        if (effortId) {
                            that.fetchSegmentInfoAndDisplayWithGoogleMap(that.pathArray, effortId);
                        }
                        else {
                            console.error('Cannot display map: effortId not given');
                        }
                    });
                });
            });
            return r;
        };
    };
    GoogleMapsModifier.prototype.getEffortId = function () {
        return parseInt(window.location.pathname.split('/')[4] || window.location.hash.replace('#', '')) || null;
    };
    GoogleMapsModifier.prototype.isAnalysisSection = function () {
        return !_.isEmpty(window.location.pathname.match('analysis'));
    };
    GoogleMapsModifier.prototype.fetchPathFromStream = function (activityId, callback) {
        var streamPathUrl = "/activities/" + activityId + "/streams?stream_types[]=latlng";
        $.ajax({
            url: streamPathUrl,
            dataType: "json"
        }).done(function (jsonResponse) {
            callback(jsonResponse.latlng);
        });
    };
    GoogleMapsModifier.prototype.fetchSegmentInfoFromEffortId = function (effortId, callback) {
        var segmentInfoResponse;
        $.ajax({
            url: '/segment_efforts/' + effortId,
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            },
            dataType: 'json',
            success: function (xhrResponseText) {
                segmentInfoResponse = xhrResponseText;
            },
            error: function (err) {
                console.error(err);
            }
        }).then(function () {
            if (!segmentInfoResponse.start_index && segmentInfoResponse.end_index) {
                console.error('No start_index end_index found for');
            }
            callback(segmentInfoResponse);
        });
    };
    GoogleMapsModifier.prototype.fetchSegmentInfoAndDisplayWithGoogleMap = function (pathArray, effortId) {
        var _this = this;
        this.fetchSegmentInfoFromEffortId(effortId, function (segmentInfoResponse) {
            _this.displayGoogleMapWithPath(pathArray, [segmentInfoResponse.start_index, segmentInfoResponse.end_index]);
        });
    };
    GoogleMapsModifier.prototype.displayGoogleMapWithPath = function (mainPathArray, highlightFromTo) {
        var _this = this;
        var mapSize = [
            window.innerWidth * 0.950,
            window.innerHeight * 0.875
        ];
        var html = '<div style="padding-bottom:10px; text-align:center;"><div style="height:' + mapSize[1] + 'px;width:' + mapSize[0] + 'px;" id="gmaps_canvas"></div><a target="_blank" href="' + this.appResources.settingsLink + '#/commonSettings?searchText=Google%20Maps">Go to extension settings if you want to set specific layer OR disable google maps buttons</a></div>';
        $.fancybox(html, {
            'autoScale': true,
            'transitionIn': 'fade',
            'transitionOut': 'fade'
        });
        if (!$('#gmaps_canvas').length) {
            $('#map-canvas').before(html).each(function () {
                _this.applyToMap(mainPathArray, highlightFromTo);
            });
        }
        else {
            this.applyToMap(mainPathArray, highlightFromTo);
        }
    };
    GoogleMapsModifier.prototype.applyToMap = function (mainPathArray, highlightFromTo) {
        var layerType;
        switch (this.userSettings.reviveGoogleMapsLayerType.toUpperCase()) {
            case "HYBRID":
                layerType = google.maps.MapTypeId.HYBRID;
                break;
            case "ROADMAP":
                layerType = google.maps.MapTypeId.ROADMAP;
                break;
            case "SATELLITE":
                layerType = google.maps.MapTypeId.SATELLITE;
                break;
            case "TERRAIN":
                layerType = google.maps.MapTypeId.TERRAIN;
                break;
            default:
                layerType = google.maps.MapTypeId.TERRAIN;
                break;
        }
        this.map = new google.maps.Map(document.getElementById("gmaps_canvas"), {
            mapTypeId: layerType,
            overviewMapControl: true
        });
        var points = [];
        var bounds = new google.maps.LatLngBounds();
        _.each(mainPathArray, function (position) {
            var point = new google.maps.LatLng(position[0], position[1]);
            points.push(point);
            bounds.extend(point);
        });
        var mainPathPoly = new google.maps.Polyline({
            path: points,
            strokeColor: "#FF0000",
            strokeOpacity: .7,
            strokeWeight: 4
        });
        mainPathPoly.setMap(this.map);
        this.map.fitBounds(bounds);
        if (highlightFromTo) {
            var secondPathPoly = new google.maps.Polyline({
                path: points.slice(highlightFromTo[0], highlightFromTo[1]),
                strokeColor: "#105cb6",
                strokeOpacity: 1,
                strokeWeight: 4
            });
            bounds = new google.maps.LatLngBounds();
            _.each(mainPathArray.slice(highlightFromTo[0], highlightFromTo[1]), function (position) {
                var p = new google.maps.LatLng(position[0], position[1]);
                bounds.extend(p);
            });
            this.map.fitBounds(bounds);
            secondPathPoly.setMap(this.map);
        }
    };
    GoogleMapsModifier.prototype.getGoogleMapsApi = function () {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://maps.google.com/maps/api/js?sensor=false");
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    };
    return GoogleMapsModifier;
}());
