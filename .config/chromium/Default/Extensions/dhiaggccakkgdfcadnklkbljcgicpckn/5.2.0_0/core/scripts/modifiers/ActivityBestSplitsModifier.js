function BestSplitWorker() {
    var _this = this;
    var BestSplitComputer = (function () {
        function BestSplitComputer() {
        }
        BestSplitComputer.prototype.newSplitValue = function (value) {
            return {
                value: value || 0,
                begin: 0,
                end: -1,
                samples: 0,
                timeOrDistance: 0
            };
        };
        BestSplitComputer.prototype.newDropRiseValue = function () {
            return {
                value: {
                    value: 0,
                    beginValue: 0,
                    endValue: 0
                },
                begin: 0,
                end: -1,
                samples: 0,
                timeOrDistance: 0
            };
        };
        BestSplitComputer.prototype.countSamples = function (value) {
            value.samples = value.end - value.begin + 1;
        };
        BestSplitComputer.prototype.averageOfValues = function (activityJson, start, end, array) {
            var sumValues = 0;
            var sumTime = 0;
            var deltaTime;
            start++;
            for (; array && start <= end; start++) {
                deltaTime = activityJson.time[start] - activityJson.time[start - 1];
                sumValues += array[start] * deltaTime - ((array[start] - array[start - 1]) * deltaTime) / 2;
                sumTime += deltaTime;
            }
            if (sumTime === 0) {
                return 0;
            }
            return sumValues / sumTime;
        };
        BestSplitComputer.prototype.totalGainOfValues = function (start, end, array) {
            if (!array) {
                return 0;
            }
            var result = 0;
            var previous = array[start++];
            for (; start <= end; start++) {
                var value = array[start];
                if (previous < value) {
                    result += (value - previous);
                }
                previous = value;
            }
            return result;
        };
        BestSplitComputer.prototype.totalDropOfValues = function (start, end, array) {
            if (!array) {
                return 0;
            }
            var result = 0;
            var previous = array[start++];
            for (; start <= end; start++) {
                var value = array[start];
                if (previous > value) {
                    result += (previous - value);
                }
                previous = value;
            }
            return result;
        };
        BestSplitComputer.prototype.dropOfValues = function (start, end, array) {
            var dropHr = this.newSplitValue();
            var maxDrop = 0;
            var maxBegin = 0;
            var maxEnd = 0;
            var maxValueBegin = 0;
            var maxValueEnd = 0;
            if (array) {
                var previous = array[start++];
                var currentMax = previous;
                var begin = start;
                for (; start <= end; start++) {
                    if (array[start] > previous) {
                        if (maxValueEnd === 0 || array[start] - maxValueEnd > 5) {
                            currentMax = array[start];
                            begin = start;
                        }
                    }
                    else if (currentMax - array[start] > maxDrop) {
                        maxDrop = currentMax - array[start];
                        maxBegin = begin;
                        maxEnd = start;
                        maxValueBegin = currentMax;
                        maxValueEnd = array[start];
                    }
                    previous = array[start];
                }
            }
            dropHr.value = {
                value: maxDrop,
                beginValue: maxValueBegin,
                endValue: maxValueEnd
            };
            dropHr.begin = maxBegin;
            dropHr.end = maxEnd;
            return dropHr;
        };
        BestSplitComputer.prototype.riseOfValues = function (start, end, array) {
            var riseHr = this.newSplitValue();
            var maxRise = 0;
            var maxBegin = 0;
            var maxEnd = 0;
            var maxValueBegin = 0;
            var maxValueEnd = 0;
            if (array) {
                var previous = array[start++];
                var currentMin = previous;
                var begin = start;
                for (; start <= end; start++) {
                    if (array[start] < previous) {
                        if (maxValueEnd === 0 || maxValueEnd - array[start] > 5) {
                            currentMin = array[start];
                            begin = start;
                        }
                    }
                    else if (array[start] - currentMin > maxRise) {
                        maxRise = array[start] - currentMin;
                        maxBegin = begin;
                        maxEnd = start;
                        maxValueBegin = currentMin;
                        maxValueEnd = array[start];
                    }
                    previous = array[start];
                }
            }
            riseHr.value = {
                value: maxRise,
                beginValue: maxValueBegin,
                endValue: maxValueEnd
            };
            riseHr.begin = maxBegin;
            riseHr.end = maxEnd;
            return riseHr;
        };
        BestSplitComputer.prototype.coutOfNonZero = function (start, end, array) {
            var result = 0;
            for (; array && start <= end; start++) {
                if (array[start]) {
                    result += 1;
                }
            }
            return result;
        };
        BestSplitComputer.prototype.compute = function (split, activityJson, options) {
            var _this = this;
            var max, distance, hr, avgCadence, avgPower, avgSpeed, time, begin, end, values = {
                time: this.newSplitValue(999999999),
                distance: this.newSplitValue(),
                avgSpeed: this.newSplitValue(),
                avgHr: this.newSplitValue(),
                dropHr: this.newDropRiseValue(),
                riseHr: this.newDropRiseValue(),
                avgPower: this.newSplitValue(),
                avgCadence: this.newSplitValue(),
                elevationGain: this.newSplitValue(),
                elevationDrop: this.newSplitValue(),
                timeOrDistance: 0
            }, checkValues = function (timeOrDistance, ratio) {
                hr = _this.averageOfValues(activityJson, begin, end, activityJson.heartrate);
                if (hr > values.avgHr.value) {
                    values.avgHr.value = hr;
                    values.avgHr.begin = begin;
                    values.avgHr.end = end;
                    values.avgHr.timeOrDistance = timeOrDistance;
                }
                var dropHr = _this.dropOfValues(begin, end, activityJson.heartrate);
                dropHr.value.value = dropHr.value.value * ratio;
                if (dropHr.value.value > values.dropHr.value.value) {
                    values.dropHr = dropHr;
                }
                var riseHr = _this.riseOfValues(begin, end, activityJson.heartrate);
                riseHr.value.value = riseHr.value.value * ratio;
                if (riseHr.value.value > values.riseHr.value.value) {
                    values.riseHr = riseHr;
                }
                avgCadence = _this.averageOfValues(activityJson, begin, end, activityJson.cadence);
                if (avgCadence > values.avgCadence.value) {
                    values.avgCadence.value = avgCadence;
                    values.avgCadence.begin = begin;
                    values.avgCadence.end = end;
                    values.avgCadence.timeOrDistance = timeOrDistance;
                }
                avgPower = _this.averageOfValues(activityJson, begin, end, activityJson.watts);
                if (avgPower > values.avgPower.value) {
                    values.avgPower.value = avgPower;
                    values.avgPower.begin = begin;
                    values.avgPower.end = end;
                    values.avgPower.timeOrDistance = timeOrDistance;
                }
                var elevationGain = _this.totalGainOfValues(begin, end, activityJson.filteredAltitude) * ratio;
                var elevationDrop = _this.totalDropOfValues(begin, end, activityJson.filteredAltitude) * ratio;
                if (elevationGain > values.elevationGain.value) {
                    values.elevationGain.value = elevationGain;
                    values.elevationGain.begin = begin;
                    values.elevationGain.end = end;
                    values.elevationGain.timeOrDistance = timeOrDistance;
                }
                if (elevationDrop > values.elevationDrop.value) {
                    values.elevationDrop.value = elevationDrop;
                    values.elevationDrop.begin = begin;
                    values.elevationDrop.end = end;
                    values.elevationDrop.timeOrDistance = timeOrDistance;
                }
                avgSpeed = (distance / 1000) / (time / 60 / 60);
                if (avgSpeed > values.avgSpeed.value) {
                    values.avgSpeed.value = avgSpeed;
                    values.avgSpeed.begin = begin;
                    values.avgSpeed.end = end;
                    values.avgSpeed.timeOrDistance = timeOrDistance;
                }
            };
            if (split.unit === options.Minutes || split.unit === options.Seconds) {
                var splitInSeconds = void 0;
                if (split.unit === options.Minutes) {
                    splitInSeconds = split.length * 60;
                }
                else {
                    splitInSeconds = split.length;
                }
                for (var i = 0, max_1 = activityJson.time.length; i < max_1; i++) {
                    time = 0;
                    begin = i;
                    end = i + 1;
                    while (splitInSeconds > time && end < max_1) {
                        time = activityJson.time[end] - activityJson.time[begin];
                        end++;
                    }
                    end--;
                    if (time < splitInSeconds) {
                        break;
                    }
                    distance = (activityJson.distance[end] - activityJson.distance[begin]);
                    var ratio = splitInSeconds / time;
                    if (distance * ratio > values.distance.value) {
                        values.distance.value = distance * ratio;
                        values.distance.begin = begin;
                        values.distance.end = end;
                        values.distance.timeOrDistance = time;
                    }
                    checkValues(time, ratio);
                }
                time = activityJson.time[values.riseHr.end] - activityJson.time[values.riseHr.begin];
                values.riseHr.timeOrDistance = time;
                time = activityJson.time[values.dropHr.end] - activityJson.time[values.dropHr.begin];
                values.dropHr.timeOrDistance = time;
                if (options.distanceUnit === options.Miles) {
                    values.distance.value *= options.MetersTo0001hMileFactor;
                    values.avgSpeed.value *= options.KilometersToMilesFactor;
                }
            }
            if (split.unit === options.Kilometers || split.unit === options.Miles) {
                var distanceInMeters = split.length * (split.unit === options.Miles ? options.MilesToMetersFactor : options.KilometersToMetersFactor), distanceInUserUnits = void 0;
                for (var i = 0, max_2 = activityJson.distance.length; i < max_2; i++) {
                    distance = 0;
                    begin = i;
                    end = i + 1;
                    while (distanceInMeters > distance && end < max_2) {
                        distance = activityJson.distance[end] - activityJson.distance[begin];
                        end++;
                    }
                    end--;
                    if (distance < distanceInMeters) {
                        break;
                    }
                    var ratio = distanceInMeters / distance;
                    distanceInUserUnits = distance * (options.distanceUnit === options.Miles ? options.MetersTo0001hMileFactor : 1);
                    time = activityJson.time[end] - activityJson.time[begin];
                    if (time * ratio < values.time.value) {
                        values.time.value = time * ratio;
                        values.time.begin = begin;
                        values.time.end = end;
                        values.time.timeOrDistance = distanceInUserUnits;
                    }
                    checkValues(distanceInUserUnits, ratio);
                }
                distance = activityJson.distance[values.riseHr.end] - activityJson.distance[values.riseHr.begin];
                distanceInUserUnits = distance * (options.distanceUnit === options.Miles ? options.MetersTo0001hMileFactor : 1);
                values.riseHr.timeOrDistance = distanceInUserUnits;
                distance = activityJson.distance[values.dropHr.end] - activityJson.distance[values.dropHr.begin];
                distanceInUserUnits = distance * (options.distanceUnit === options.Miles ? options.MetersTo0001hMileFactor : 1);
                values.dropHr.timeOrDistance = distanceInUserUnits;
                if (options.distanceUnit === options.Miles) {
                    values.distance.value *= options.MetersTo0001hMileFactor;
                    values.avgSpeed.value *= options.KilometersToMilesFactor;
                }
            }
            this.countSamples(values.avgCadence);
            this.countSamples(values.avgHr);
            this.countSamples(values.dropHr);
            this.countSamples(values.riseHr);
            this.countSamples(values.avgPower);
            this.countSamples(values.elevationGain);
            this.countSamples(values.elevationDrop);
            this.countSamples(values.avgSpeed);
            this.countSamples(values.distance);
            this.countSamples(values.time);
            return values;
        };
        ;
        return BestSplitComputer;
    }());
    this.onmessage = function (message) {
        if (message.data && message.data.split && message.data.activity && message.data.options) {
            if (message.data.result) {
                message.data.result = JSON.parse(message.data.result);
                _this.postMessage(message.data);
            }
            else {
                var bestSplitComputer = new BestSplitComputer();
                message.data.result = bestSplitComputer.compute(message.data.split, message.data.activity, message.data.options);
                _this.postMessage(message.data);
            }
        }
    };
}
var ActivityBestSplitsModifier = (function () {
    function ActivityBestSplitsModifier(activityId, userSettings, activityJson, hasPowerMeter, splitsConfiguration, saveSplitsConfigrationMethod) {
        this.activityId = activityId;
        this.userSettings = userSettings;
        this.activityJson = activityJson;
        this.hasPowerMeter = hasPowerMeter;
        this.splitsConfiguration = splitsConfiguration;
        this.saveSplitsConfigrationMethod = saveSplitsConfigrationMethod || function () {
        };
        this.distanceUnit = ActivityBestSplitsModifier.Units.Kilometers;
        this.cacheKeyPrefix = 'stravistix_bestsplit_' + this.activityId + '_';
    }
    ActivityBestSplitsModifier.prototype.filterData = function (data, distance, smoothing) {
        var max;
        if (data && distance) {
            var smooth_factor = 0;
            var result = [];
            result[0] = data[0];
            for (var i = 1, max_3 = data.length; i < max_3; i++) {
                if (smoothing === 0) {
                    result[i] = data[i];
                }
                else {
                    smooth_factor = smoothing / (distance[i] - distance[i - 1]);
                    result[i] = result[i - 1] + (data[i] - result[i - 1]) / (smooth_factor > 1 ? smooth_factor : 1);
                }
            }
            return result;
        }
    };
    ActivityBestSplitsModifier.prototype.addSplitToTable = function (split, splitsTableBody, activityDistanceInMeters, activityDurationInSeconds) {
        if (split.unit === ActivityBestSplitsModifier.Units.Kilometers && (split.length * ActivityBestSplitsModifier.Units.KilometersToMetersFactor) > activityDistanceInMeters) {
            return;
        }
        if (split.unit === ActivityBestSplitsModifier.Units.Miles && (split.length * ActivityBestSplitsModifier.Units.MilesToMetersFactor) > activityDistanceInMeters) {
            return;
        }
        if (split.unit === ActivityBestSplitsModifier.Units.Minutes && (split.length * 60) > activityDurationInSeconds) {
            return;
        }
        if (split.unit === ActivityBestSplitsModifier.Units.Seconds && split.length > activityDurationInSeconds) {
            return;
        }
        split.id = split.id || Helper.guid();
        splitsTableBody.append("<tr id='split-" + split.id + "'>" +
            "<td style='white-space: nowrap;'>" + split.length + " " + ActivityBestSplitsModifier.Units.getLabel(split.unit) + "</td>" +
            "<td class='value'><div id='split-" + split.id + "-time'></div><div id='split-" + split.id + "-distance'></div></td>" +
            "<td class='value'><div id='split-" + split.id + "-avg-speed'></div></td>" +
            "<td class='value'><div id='split-" + split.id + "-avg-hr'></div></td>" +
            "<td class='value'><div id='split-" + split.id + "-drop-hr'></div></td>" +
            "<td class='value'><div id='split-" + split.id + "-rise-hr'></div></td>" +
            "<td class='value'><div id='split-" + split.id + "-avg-power'></div></td>" +
            "<td class='value'><div id='split-" + split.id + "-avg-cadence'></div></td>" +
            "<td class='value'><div id='split-" + split.id + "-elevation-gain'></div></td>" +
            "<td class='value'><div id='split-" + split.id + "-elevation-drop'></div></td>" +
            "<td><button class='compact minimal toggle-effort-visibility best-split-remove' data-split-id='" + split.id + "'>Del</button></td>" +
            "</tr>");
    };
    ActivityBestSplitsModifier.prototype.modify = function () {
        var _this = this;
        if ($("#segments").length === 0) {
            setTimeout(function () {
                _this.modify();
            }, 500);
            return;
        }
        $("#segments").addClass("best-splits-processed");
        var segments = $("#segments"), bestSplitsHeader = $('<h3 class="button bestsplits-header-title" style="width: 45%; padding-right:50px; padding-left:50px; margin-left:20px;">Best splits</h3>')
            .css("display", "inline")
            .css("margin-right", "5px"), bestSplitsSection = $("<section id='bestsplits' class='pinnable-anchor' style='display: none;'></section>"), map, splitPolyLine, splitAltitude, splitColor = "black", selectedSplitId, measurementPreference = window.currentAthlete ? window.currentAthlete.get('measurement_preference') : 'meters';
        this.activityJson.filteredAltitude = this.filterData(this.activityJson.altitude, this.activityJson.distance, 22);
        this.distanceUnit = (measurementPreference == 'meters') ? ActivityBestSplitsModifier.Units.Kilometers : ActivityBestSplitsModifier.Units.Miles;
        segments.find("h3.segments-header")
            .html("Segment efforts")
            .css("cursor", "pointer")
            .css("display", "inline")
            .css("padding-right", "50px")
            .css("padding-left", "50px")
            .css("color", "#FC4C02")
            .css("background", "white")
            .css("margin-right", "5px")
            .addClass("button")
            .addClass("btn-primary")
            .addClass("segments-header-title")
            .removeClass("inset")
            .before(bestSplitsHeader);
        if (window.pageView) {
            if (window.pageView.contexts) {
                if (window.pageView.contexts.contexts) {
                    if (window.pageView.contexts.contexts.map["converted-elapsed-time"]) {
                        if (window.pageView.contexts.contexts.map["converted-elapsed-time"]) {
                            if (window.pageView.contexts.contexts.map["converted-elapsed-time"]._map) {
                                map = window.pageView.contexts.contexts.map["converted-elapsed-time"]._map.instance;
                            }
                        }
                    }
                }
            }
        }
        if (segments.find("[data-segment-effort-id]").length) {
            bestSplitsSection.appendTo($("#segments section.segments-list"));
        }
        else {
            var container = segments.find(".no-segments");
            container.find(".icon-segment-marker-white").remove();
            container.append("<h3 class=\"inset segments-header\">Best Splits</h3>");
            container.append(bestSplitsSection);
            bestSplitsSection.show();
        }
        $(".bestsplits-header-title").click(function () {
            $(".bestsplits-header-title")
                .addClass("btn-primary")
                .css("color", "#FC4C02")
                .css("background", "white");
            $(".segments-header-title")
                .css("font-weight", "normal")
                .css("text-decoration", "none")
                .css("color", "black")
                .removeClass("btn-primary");
            $("#segment-filter").hide();
            segments.find("table.segments").hide();
            segments.find("div.show-hide-segments").hide();
            segments.find("div.hidden-segments-container").hide();
            bestSplitsSection.show();
        });
        var removeSplitSelection = function () {
            if (map && splitPolyLine) {
                map.removeLayer(splitPolyLine);
                splitPolyLine = null;
            }
            if (splitAltitude) {
                splitAltitude.attr("style", "fill: " + splitColor + "; opacity: 0");
            }
            $("[data-activity-points].selected").removeClass("selected").css({
                "background-color": "",
                "color": "black"
            });
            selectedSplitId = undefined;
        };
        $(".segments-header-title").click(function () {
            $(".segments-header-title")
                .css("color", "#FC4C02")
                .addClass("btn-primary");
            $(".bestsplits-header-title")
                .css("font-weight", "normal")
                .css("text-decoration", "none")
                .css("color", "black")
                .removeClass("btn-primary");
            $("#segment-filter").show();
            bestSplitsSection.hide();
            segments.find("table.segments").show();
            segments.find("div.show-hide-segments").show();
            if ($("#show-hidden-efforts").hasClass("hidden")) {
                segments.find("div.hidden-segments-container").show();
            }
            removeSplitSelection();
        });
        $(document).on("click", "[data-activity-points]", {}, function (eventObject) {
            if (map) {
                $("[data-activity-points].selected").removeClass("selected").css({
                    "background-color": "",
                    "color": "black"
                });
                $(eventObject.currentTarget).addClass("selected").css({
                    "background-color": splitColor,
                    "color": "white"
                });
                if (splitPolyLine) {
                    map.removeLayer(splitPolyLine);
                    splitPolyLine = null;
                }
                var range = $(eventObject.currentTarget).attr("data-activity-points").split("-"), start = parseInt(range[0]), stop = parseInt(range[1]);
                splitPolyLine = L.polyline([], {
                    color: splitColor
                });
                for (var i = start; i <= stop; i++) {
                    splitPolyLine.addLatLng(L.latLng(_this.activityJson.latlng[i][0], _this.activityJson.latlng[i][1]));
                }
                splitPolyLine.addTo(map);
                var chartRect = $("#grid rect:not([data-split])");
                if (chartRect.length === 0) {
                    return;
                }
                var width = parseInt(chartRect.attr("width")), height = parseInt(chartRect.attr("height"));
                var xScale = d3.scale.linear().domain([0, _this.activityJson.distance[_this.activityJson.distance.length - 1]]).range([0, width]);
                if (!splitAltitude) {
                    splitAltitude = d3.select("#grid").insert("rect", "rect").attr("y", "0").attr("style", "fill: " + splitColor + "; opacity: 0").attr("data-split", "true");
                }
                splitAltitude.attr("x", xScale(_this.activityJson.distance[start]));
                splitAltitude.attr("height", height);
                splitAltitude.attr("width", xScale(_this.activityJson.distance[stop] - _this.activityJson.distance[start]));
                splitAltitude.attr("style", "fill: " + splitColor + "; opacity: 0.3");
                selectedSplitId = $(eventObject.currentTarget).data("split-id");
            }
        });
        var splitsTable = $("<table class='dense marginless best-splits' style='text-align: center'>" +
            "<thead>" +
            "<tr>" +
            "<th style='text-align: center; vertical-align: top;'>Split</th>" +
            "<th style='text-align: center; vertical-align: top;'>Time Distance</th>" +
            "<th style='text-align: center; vertical-align: top;'>Avg Speed</th>" +
            "<th style='text-align: center; vertical-align: top;'>Avg HR</th>" +
            "<th style='text-align: center; vertical-align: top;'>Drop HR</th>" +
            "<th style='text-align: center; vertical-align: top;'>Rise HR</th>" +
            "<th style='text-align: center; vertical-align: top;'>Avg Power</th>" +
            "<th style='text-align: center; vertical-align: top;'>Avg Cadence</th>" +
            "<th style='text-align: center; vertical-align: top;'>Elevation gain</th>" +
            "<th style='text-align: center; vertical-align: top;'>Elevation drop</th>" +
            "<th style='text-align: center; vertical-align: top;'></th>" +
            "</tr>" +
            "</thead>" +
            "<tfoot>" +
            "<tr>" +
            "<td colspan='11'>Length:&nbsp;" +
            "<input type='number' min='1' max='9999' value='5' id='best-split-new-length' style='width: 100px' />&nbsp;" +
            "Type:&nbsp;<select id='best-split-new-unit'>" +
            "<option selected value='" + ActivityBestSplitsModifier.Units.Minutes + "'>" + ActivityBestSplitsModifier.Units.getLabel(ActivityBestSplitsModifier.Units.Minutes) + "</option>" +
            "<option value='" + ActivityBestSplitsModifier.Units.Seconds + "'>" + ActivityBestSplitsModifier.Units.getLabel(ActivityBestSplitsModifier.Units.Seconds) + "</option>" +
            "<option value='" + ActivityBestSplitsModifier.Units.Kilometers + "'>" + ActivityBestSplitsModifier.Units.getLabel(ActivityBestSplitsModifier.Units.Kilometers) + "</option>" +
            "<option value='" + ActivityBestSplitsModifier.Units.Miles + "'>" + ActivityBestSplitsModifier.Units.getLabel(ActivityBestSplitsModifier.Units.Miles) + "</option>" +
            "</select>&nbsp;" +
            "<a class='button' id='best-split-new-add'>Add new split</a>" +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td colspan='11' style='text-align: center'><em>Data accuracy depends on GPS logging interval used to record this activity. Move cursor over values to see exact distance/time at which the value was computed. Click on any value to see the split on map and altitude chart.</em></th>" +
            "</tr>" +
            "</tfoot>" +
            "<tbody class='splits-list'>" +
            "</tbody" +
            "</table>");
        bestSplitsSection.append(splitsTable);
        var splitsTableBody = splitsTable.find("tbody");
        var splitsArray = [{
                length: 1,
                unit: ActivityBestSplitsModifier.Units.Kilometers,
                id: Helper.guid()
            }, {
                length: 10,
                unit: ActivityBestSplitsModifier.Units.Kilometers,
                id: Helper.guid()
            }, {
                length: 30,
                unit: ActivityBestSplitsModifier.Units.Kilometers,
                id: Helper.guid()
            }, {
                length: 50,
                unit: ActivityBestSplitsModifier.Units.Kilometers,
                id: Helper.guid()
            }, {
                length: 1,
                unit: ActivityBestSplitsModifier.Units.Minutes,
                id: Helper.guid()
            }, {
                length: 10,
                unit: ActivityBestSplitsModifier.Units.Minutes,
                id: Helper.guid()
            }, {
                length: 20,
                unit: ActivityBestSplitsModifier.Units.Minutes,
                id: Helper.guid()
            }, {
                length: 60,
                unit: ActivityBestSplitsModifier.Units.Minutes,
                id: Helper.guid()
            }];
        if (this.splitsConfiguration) {
            splitsArray = this.splitsConfiguration.splits || splitsArray;
        }
        splitsArray.sort(function (left, right) {
            if (left.unit === right.unit) {
                return left.length - right.length;
            }
            else {
                return left.unit - right.unit;
            }
        });
        var activityDistanceInMeters = this.activityJson.distance[this.activityJson.distance.length - 1], activityDurationInSeconds = this.activityJson.time[this.activityJson.time.length - 1];
        splitsArray.forEach(function (split) {
            _this.addSplitToTable(split, splitsTableBody, activityDistanceInMeters, activityDurationInSeconds);
        });
        var saveSplitsConfiguration = function (splitsArray) {
            _this.saveSplitsConfigrationMethod({
                splits: splitsArray
            });
        };
        $(document).on("click", ".best-split-remove", function (event) {
            event.preventDefault();
            var splitId = $(event.currentTarget).data("split-id");
            if (splitId === selectedSplitId) {
                removeSplitSelection();
            }
            splitsTableBody.find("#split-" + splitId).fadeOut(function () {
                $(event.currentTarget).remove();
            });
            splitsArray = splitsArray.filter(function (split) {
                return split.id != splitId;
            });
            saveSplitsConfiguration(splitsArray);
        });
        $("#best-split-new-add").click(function (e) {
            e.preventDefault();
            var splitLength = parseInt($("#best-split-new-length").val());
            if (splitLength < 1) {
                $("#best-split-new-length").focus();
                return;
            }
            var splitType = parseInt($("#best-split-new-unit").val());
            var splitAlreadyExist = _.findWhere(splitsArray, {
                length: splitLength,
                unit: splitType
            });
            if (splitAlreadyExist) {
                alert('This split already exist.');
                return;
            }
            switch (splitType) {
                case ActivityBestSplitsModifier.Units.Minutes:
                    if ((splitLength * 60) > activityDurationInSeconds) {
                        $.fancybox({
                            'autoScale': true,
                            'transitionIn': 'fade',
                            'transitionOut': 'fade',
                            'type': 'iframe',
                            'content': '<div>The length of the split cannot be longer than the activity time.</div>',
                            'afterClose': function () {
                                $("#best-split-new-length").focus();
                            }
                        });
                        return;
                    }
                    break;
                case ActivityBestSplitsModifier.Units.Seconds:
                    if (splitLength > activityDurationInSeconds) {
                        $.fancybox({
                            'autoScale': true,
                            'transitionIn': 'fade',
                            'transitionOut': 'fade',
                            'type': 'iframe',
                            'content': '<div>The length of the split cannot be longer than the activity time.</div>',
                            'afterClose': function () {
                                $("#best-split-new-length").focus();
                            }
                        });
                        return;
                    }
                    break;
                case ActivityBestSplitsModifier.Units.Kilometers:
                case ActivityBestSplitsModifier.Units.Miles:
                    var valueToCheck = splitLength * (splitType === ActivityBestSplitsModifier.Units.Miles ? ActivityBestSplitsModifier.Units.MilesToMetersFactor : ActivityBestSplitsModifier.Units.KilometersToMetersFactor);
                    if (valueToCheck > activityDistanceInMeters) {
                        $.fancybox({
                            'autoScale': true,
                            'transitionIn': 'fade',
                            'transitionOut': 'fade',
                            'type': 'iframe',
                            'content': '<div>The length of the split cannot be longer than the activity distance.</div>',
                            'afterClose': function () {
                                $("#best-split-new-length").focus();
                            }
                        });
                        return;
                    }
                    break;
                default:
                    $("#best-split-new-unit").focus();
                    return;
            }
            var newSplit = {
                id: Helper.guid(),
                unit: splitType,
                length: splitLength
            };
            splitsArray.push(newSplit);
            saveSplitsConfiguration(splitsArray);
            _this.addSplitToTable(newSplit, splitsTableBody, activityDistanceInMeters, activityDurationInSeconds);
            processSplit(newSplit);
        });
        var worker, workerPromises = [];
        var computeSplit = function (split, activity) {
            if (!worker) {
                var blobURL = URL.createObjectURL(new Blob(['(',
                    BestSplitWorker.toString(),
                    ')()'
                ], {
                    type: 'application/javascript'
                }));
                worker = new Worker(blobURL);
                worker.onmessage = function (message) {
                    workerPromises[message.data.split.id].resolve(message.data.result);
                    delete workerPromises[message.data.split.id];
                };
                URL.revokeObjectURL(blobURL);
            }
            workerPromises[split.id] = $.Deferred();
            worker.postMessage({
                result: localStorage.getItem(_this.cacheKeyPrefix + split.id),
                split: split,
                activity: activity,
                options: {
                    distanceUnit: _this.distanceUnit,
                    Minutes: ActivityBestSplitsModifier.Units.Minutes,
                    Seconds: ActivityBestSplitsModifier.Units.Seconds,
                    Kilometers: ActivityBestSplitsModifier.Units.Kilometers,
                    Miles: ActivityBestSplitsModifier.Units.Miles,
                    MetersTo0001hMileFactor: ActivityBestSplitsModifier.Units.MetersTo0001hMileFactor,
                    KilometersToMilesFactor: ActivityBestSplitsModifier.Units.KilometersToMilesFactor,
                    MilesToMetersFactor: ActivityBestSplitsModifier.Units.MilesToMetersFactor,
                    KilometersToMetersFactor: ActivityBestSplitsModifier.Units.KilometersToMetersFactor
                }
            });
            return workerPromises[split.id].promise();
        };
        var processSplit = function (split) {
            var splitId = "#split-" + split.id, splitRow = splitsTableBody.find(splitId), setValue = function (elementId, value, formatFunction, defValue, tooltipFormatFunction) {
                var element = $(elementId);
                element.html("");
                if (value.samples) {
                    var text = formatFunction ? formatFunction(value.value) : value.value;
                    element.text(text);
                    element.attr("data-activity-points", value.begin + "-" + value.end);
                    element.data("split-id", split.id);
                    element.css({
                        "cursor": "pointer"
                    });
                    if (value.timeOrDistance && tooltipFormatFunction) {
                        element.attr("title", tooltipFormatFunction(value));
                    }
                }
                else {
                    if (defValue) {
                        element.text(defValue);
                    }
                }
            };
            splitRow.find("td.value").append("<span class='ajax-loading-image'></span>");
            var formatDistance = function (value) {
                return Helper.formatNumber(value.timeOrDistance / 1000) + ActivityBestSplitsModifier.Units.getLabel(_this.distanceUnit);
            }, formatTime = function (value) {
                return Helper.secondsToHHMMSS(value.timeOrDistance, true);
            }, formatTooltip = split.unit === ActivityBestSplitsModifier.Units.Minutes ? formatTime : formatDistance, formatTooltipDropRise = function (value) {
                var arrow = value.value.beginValue > value.value.endValue ? "\u2198" : "\u2197";
                return Helper.formatNumber(value.value.beginValue, 0) + arrow + Helper.formatNumber(value.value.endValue, 0) + " " + formatTooltip(value);
            }, speedLabel = _this.distanceUnit === ActivityBestSplitsModifier.Units.Miles ? "mph" : "km/h";
            computeSplit(split, _this.activityJson).done(function (value) {
                if (!localStorage.getItem(_this.cacheKeyPrefix + split.id)) {
                    try {
                        localStorage.setItem(_this.cacheKeyPrefix + split.id, JSON.stringify(value));
                    }
                    catch (err) {
                        console.warn(err);
                        localStorage.clear();
                    }
                }
                setValue(splitId + "-time", value.time, function (value) {
                    return Helper.secondsToHHMMSS(value, true);
                }, "", formatDistance);
                setValue(splitId + "-distance", value.distance, function (value) {
                    return Helper.formatNumber(value / 1000) + ActivityBestSplitsModifier.Units.getLabel(_this.distanceUnit);
                }, "", formatTime);
                setValue(splitId + "-avg-speed", value.avgSpeed, function (value) {
                    return Helper.formatNumber(value) + speedLabel;
                }, "n/a", formatTooltip);
                setValue(splitId + "-avg-hr", value.avgHr, function (value) {
                    return Helper.formatNumber(value, 0) + "bpm";
                }, "n/a", formatTooltip);
                setValue(splitId + "-drop-hr", value.dropHr, function (value) {
                    return "-" + Helper.formatNumber(value.value, 0) + "bpm";
                }, "n/a", formatTooltipDropRise);
                setValue(splitId + "-rise-hr", value.riseHr, function (value) {
                    return "+" + Helper.formatNumber(value.value, 0) + "bpm";
                }, "n/a", formatTooltipDropRise);
                setValue(splitId + "-avg-power", value.avgPower, function (value) {
                    return Helper.formatNumber(value, 0) + "W";
                }, "n/a", formatTooltip);
                setValue(splitId + "-elevation-gain", value.elevationGain, function (value) {
                    return Helper.formatNumber(value, 0) + "m";
                }, "n/a", formatTooltip);
                setValue(splitId + "-elevation-drop", value.elevationDrop, function (value) {
                    return Helper.formatNumber(value, 0) + "m";
                }, "n/a", formatTooltip);
                setValue(splitId + "-avg-cadence", value.avgCadence, function (value) {
                    return Helper.formatNumber(value, 0);
                }, "n/a", formatTooltip);
                splitRow.find("td.value span.ajax-loading-image").remove();
            });
        };
        splitsArray.forEach(function (split) {
            processSplit(split);
        });
        var waitForSegmentsSectionRemoved = function () {
            if ($("#segments.best-splits-processed").length !== 0) {
                setTimeout(function () {
                    waitForSegmentsSectionRemoved();
                }, 1000);
                return;
            }
            _this.modify();
        };
        waitForSegmentsSectionRemoved();
    };
    ActivityBestSplitsModifier.Units = {
        Seconds: -1,
        Minutes: 0,
        Kilometers: 1,
        Miles: 2,
        MetersToMilesFactor: 0.000621371192,
        MetersTo0001hMileFactor: 0.621371192,
        KilometersToMilesFactor: 0.621371192,
        MilesToMetersFactor: 1609.344,
        KilometersToMetersFactor: 1000,
        getLabel: function (unit) {
            switch (unit) {
                case ActivityBestSplitsModifier.Units.Kilometers:
                    return "km";
                case ActivityBestSplitsModifier.Units.Miles:
                    return "mi";
                case ActivityBestSplitsModifier.Units.Minutes:
                    return "min";
                case ActivityBestSplitsModifier.Units.Seconds:
                    return "sec";
                default:
                    return "";
            }
        }
    };
    return ActivityBestSplitsModifier;
}());
