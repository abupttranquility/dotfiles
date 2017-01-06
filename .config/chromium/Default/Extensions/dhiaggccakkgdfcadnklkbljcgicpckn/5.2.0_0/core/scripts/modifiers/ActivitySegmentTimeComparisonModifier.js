var ActivitySegmentTimeComparisonModifier = (function () {
    function ActivitySegmentTimeComparisonModifier(userSettings, appResources, activityType, isMyOwn) {
        this.showDifferenceToKOM = userSettings.displaySegmentTimeComparisonToKOM;
        this.showDifferenceToPR = isMyOwn && userSettings.displaySegmentTimeComparisonToPR;
        this.showDifferenceToCurrentYearPR = isMyOwn && userSettings.displaySegmentTimeComparisonToCurrentYearPR;
        this.displaySegmentTimeComparisonPosition = userSettings.displaySegmentTimeComparisonPosition;
        this.appResources = appResources;
        this.isBike = (activityType === "Ride");
    }
    ActivitySegmentTimeComparisonModifier.prototype.crTitle = function () {
        return this.isBike ? this.isFemale ? "QOM" : "KOM" : "CR";
    };
    ActivitySegmentTimeComparisonModifier.prototype.modify = function () {
        var _this = this;
        if (!this.showDifferenceToKOM && !this.showDifferenceToPR && !this.showDifferenceToCurrentYearPR && !this.displaySegmentTimeComparisonPosition) {
            return;
        }
        var segments = $("#segments");
        if (segments.length === 0) {
            setTimeout(function () {
                _this.modify();
            }, 500);
            return;
        }
        segments.find("#segment-filter").show();
        segments.addClass("time-comparison-enabled");
        this.findOutGender();
        this.setNewLabelsValues();
        this.firstAppearDone = false;
        $("tr[data-segment-effort-id]").appear().on("appear", function (event, $items) {
            if (!_this.firstAppearDone) {
                var timeColumnHeader = segments.find("table.segments th.time-col");
                if (timeColumnHeader.length == 0) {
                    timeColumnHeader = segments.find("table.segments th:contains('Time')");
                }
                if (_this.showDifferenceToPR && _this.showDifferenceToCurrentYearPR) {
                    timeColumnHeader.after("<th style='font-size:11px;' title='Column shows the difference between the activity segment time and your current year PR on that segment.'>" + _this.deltaYearPRLabel + "</th>");
                }
                if (_this.showDifferenceToPR) {
                    timeColumnHeader.after("<th style='font-size:11px;' title='Column shows the difference between the activity segment time and your previous PR on that segment.'>" + _this.deltaPRLabel + "</th>");
                }
                if (_this.showDifferenceToKOM) {
                    timeColumnHeader.after("<th style='font-size:11px;' title='Column shows the difference between the current " + _this.crTitle() + " time and the activity segment time.'>" + _this.deltaKomLabel + "</th>");
                }
                if (_this.displaySegmentTimeComparisonPosition) {
                    timeColumnHeader.after("<th title='Column shows your current position on that segment.'>Rank</th>");
                }
                _this.firstAppearDone = true;
            }
            $items.each(function () {
                var $row = $(event.currentTarget), $timeCell = $row.find("td.time-col"), segmentEffortId = $row.data("segment-effort-id"), segmentEffortInfoUrl = "/segment_efforts/" + segmentEffortId, positionCell, deltaKomCell, deltaPRCell, deltaYearPRCell;
                if ($row.hasClass("selected") || $row.data("segment-time-comparison")) {
                    return;
                }
                $row.data("segment-time-comparison", true);
                if (_this.showDifferenceToPR && _this.showDifferenceToCurrentYearPR) {
                    deltaYearPRCell = $("<td><span class='ajax-loading-image'></span></td>");
                    $timeCell.after(deltaYearPRCell);
                }
                if (_this.showDifferenceToPR) {
                    deltaPRCell = $("<td><span class='ajax-loading-image'></span></td>");
                    $timeCell.after(deltaPRCell);
                }
                if (_this.showDifferenceToKOM) {
                    deltaKomCell = $("<td><span class='ajax-loading-image'></span></td>");
                    $timeCell.after(deltaKomCell);
                }
                if (_this.displaySegmentTimeComparisonPosition) {
                    positionCell = $("<td><span class='ajax-loading-image'></span></td>");
                    $timeCell.after(positionCell);
                }
                $.getJSON(segmentEffortInfoUrl, function (segmentEffortInfo) {
                    if (!segmentEffortInfo) {
                        return;
                    }
                    if (segmentEffortInfo.hazard_segment) {
                        positionCell.html("-");
                        deltaKomCell.html("-");
                        deltaPRCell.html("-");
                        deltaYearPRCell.html("-");
                        return;
                    }
                    if (_this.displaySegmentTimeComparisonPosition) {
                        var percentRank = parseInt(segmentEffortInfo.overall_rank) / parseInt(segmentEffortInfo.overall_count);
                        positionCell.html("<div title=\"Your position\" style=\"text-align: center; font-size:11px; padding: 1px 1px; background-color: #565656; color:" + _this.getColorForPercentage(percentRank) + "\">" + segmentEffortInfo.overall_rank + "&nbsp;/&nbsp;" + segmentEffortInfo.overall_count + "<br/>" + (percentRank * 100).toFixed(1) + "%</div>");
                    }
                    var komSeconds = Helper.HHMMSStoSeconds((_this.isFemale ? segmentEffortInfo.qom_time : segmentEffortInfo.kom_time).replace(/[^0-9:]/gi, "")), elapsedTime = segmentEffortInfo.elapsed_time_raw, komDiffTime = (elapsedTime - parseInt(komSeconds));
                    if (_this.showDifferenceToKOM) {
                        deltaKomCell.html("<span title=\"Time difference with current " + _this.crTitle() + " (" + Helper.secondsToHHMMSS(Math.abs(parseInt(komSeconds)), true) + ")\" style='font-size:11px; color:" + (komDiffTime > 0 ? "#FF5555" : "#2EB92E") + ";'>" + ((Math.sign(komDiffTime) == 1) ? "+" : "-") + Helper.secondsToHHMMSS(Math.abs(komDiffTime), true) + "</span>");
                    }
                    if (!_this.showDifferenceToPR && !_this.showDifferenceToCurrentYearPR) {
                        return;
                    }
                    _this.findCurrentSegmentEffortDate(segmentEffortInfo.segment_id, segmentEffortId).then(function (currentSegmentEffortDateTime, leaderBoardData) {
                        _this.handleTimeDifferenceAlongUserLeaderBoard(leaderBoardData, currentSegmentEffortDateTime, elapsedTime, segmentEffortId, deltaPRCell, deltaYearPRCell);
                    });
                });
            });
        });
        $.force_appear();
        var waitForSegmentsSectionRemoved = function () {
            if ($("#segments.time-comparison-enabled").length !== 0) {
                setTimeout(function () {
                    waitForSegmentsSectionRemoved();
                }, 1000);
                return;
            }
            _this.modify();
        };
        waitForSegmentsSectionRemoved();
    };
    ActivitySegmentTimeComparisonModifier.prototype.findOutGender = function () {
        this.isFemale = false;
        if (!_.isUndefined(window.pageView)) {
            this.isFemale = window.pageView.activityAthlete() && window.pageView.activityAthlete().get('gender') != "M";
        }
    };
    ActivitySegmentTimeComparisonModifier.prototype.setNewLabelsValues = function () {
        this.deltaKomLabel = "&Delta;" + this.crTitle();
        this.deltaPRLabel = "&Delta;PR";
        this.deltaYearPRLabel = "&Delta;yPR";
    };
    ActivitySegmentTimeComparisonModifier.prototype.findCurrentSegmentEffortDate = function (segmentId, segmentEffortId, page, deferred, fetchedLeaderboardData) {
        var _this = this;
        if (!page) {
            page = 1;
        }
        if (!deferred) {
            deferred = $.Deferred();
        }
        if (!fetchedLeaderboardData) {
            fetchedLeaderboardData = [];
        }
        var perPage = 50;
        var jqxhr = $.getJSON('/segments/' + segmentId + '/leaderboard?raw=true&page=' + page + '&per_page=' + perPage + '&viewer_context=false&filter=my_results');
        var currentSegmentEffortDateTime = null;
        jqxhr.done(function (leaderBoardData) {
            for (var i = 0, max = leaderBoardData.top_results.length; i < max; i++) {
                leaderBoardData.top_results[i].__dateTime = new Date(leaderBoardData.top_results[i].start_date_local_raw);
                if (leaderBoardData.top_results[i].id == segmentEffortId) {
                    currentSegmentEffortDateTime = leaderBoardData.top_results[i].__dateTime;
                }
            }
            fetchedLeaderboardData = _.flatten(_.union(leaderBoardData.top_results, fetchedLeaderboardData));
            if (currentSegmentEffortDateTime) {
                deferred.resolve(currentSegmentEffortDateTime, fetchedLeaderboardData);
            }
            else {
                _this.findCurrentSegmentEffortDate(segmentId, segmentEffortId, page + 1, deferred, fetchedLeaderboardData);
            }
        }).fail(function (error) {
            deferred.reject(error);
        });
        return deferred.promise();
    };
    ActivitySegmentTimeComparisonModifier.prototype.handleTimeDifferenceAlongUserLeaderBoard = function (leaderBoardData, currentSegmentEffortDateTime, elapsedTime, segmentEffortId, deltaPRCell, deltaYearPRCell) {
        var previousPersonalSeconds, previousPersonalDate, currentYearPRSeconds, currentYearPRDate;
        if (!currentSegmentEffortDateTime) {
            deltaPRCell.html("-");
            deltaYearPRCell.html("-");
            return;
        }
        leaderBoardData = leaderBoardData.sort(function (left, right) {
            return left.rank - right.rank;
        });
        var deltaTime;
        if (this.showDifferenceToPR) {
            for (var i = 0; i < leaderBoardData.length; i++) {
                if (leaderBoardData[i].__dateTime < currentSegmentEffortDateTime) {
                    previousPersonalSeconds = leaderBoardData[i].elapsed_time_raw;
                    previousPersonalDate = leaderBoardData[i].start_date_local;
                    break;
                }
            }
            if (previousPersonalSeconds) {
                deltaTime = (elapsedTime - previousPersonalSeconds);
                deltaPRCell.html("<span title='Time difference with your previous PR time (" + Helper.secondsToHHMMSS(previousPersonalSeconds, true) + " on " + previousPersonalDate + ")' style='font-size:11px; color:" + (deltaTime > 0 ? "#FF5555" : "#2EB92E") + ";'>" + ((Math.sign(deltaTime) == 1) ? "+" : "-") + Helper.secondsToHHMMSS(Math.abs(deltaTime), true) + "</span>");
            }
            else {
                deltaPRCell.html("<span title='First cross' style='font-size:11px; color: grey;'>1X</span>");
            }
        }
        if (this.showDifferenceToPR && this.showDifferenceToCurrentYearPR) {
            var resultsThisYear = [];
            for (var j = 0; j < leaderBoardData.length; j++) {
                if (leaderBoardData[j].__dateTime.getFullYear() === currentSegmentEffortDateTime.getFullYear()) {
                    currentYearPRSeconds = leaderBoardData[j].elapsed_time_raw;
                    currentYearPRDate = leaderBoardData[j].start_date_local;
                    resultsThisYear.push(leaderBoardData[j]);
                }
            }
            resultsThisYear = resultsThisYear.sort(function (left, right) {
                return left.elapsed_time_raw - right.elapsed_time_raw;
            });
            var currentActivityResult_1 = _.findWhere(resultsThisYear, {
                __dateTime: currentSegmentEffortDateTime
            });
            var previousBestResultThisYear_1 = null;
            _.some(resultsThisYear, function (result) {
                if (result.activity_id !== currentActivityResult_1.activity_id && result.__dateTime < currentActivityResult_1.__dateTime) {
                    previousBestResultThisYear_1 = result;
                    return true;
                }
            });
            if (currentYearPRSeconds) {
                if (!previousPersonalSeconds) {
                    deltaYearPRCell.html("<span title='First cross this year' style='font-size:11px; color: grey;'>1X</span>");
                }
                else if (currentYearPRSeconds - previousPersonalSeconds < 0) {
                    if (previousBestResultThisYear_1) {
                        deltaTime = currentActivityResult_1.elapsed_time_raw - previousBestResultThisYear_1.elapsed_time_raw;
                        deltaYearPRCell.html("<span title='Time difference with your previous best result this year (" + Helper.secondsToHHMMSS(previousBestResultThisYear_1.elapsed_time_raw, true) + " on " + previousBestResultThisYear_1.start_date_local + ")' style='font-size:11px; color:" + (deltaTime > 0 ? "#FF5555" : "#2EB92E") + ";'>" + ((Math.sign(deltaTime) == 1) ? "+" : "-") + Helper.secondsToHHMMSS(Math.abs(deltaTime), true) + "</span>");
                    }
                    else {
                        deltaYearPRCell.html("<span title='This time beats previous PR. Time difference with your previous PR time  (" + Helper.secondsToHHMMSS(previousPersonalSeconds, true) + " on " + previousPersonalDate + ")' style='font-size:11px; color: grey;'>&#9733;</span>");
                    }
                }
                else {
                    if (previousBestResultThisYear_1) {
                        deltaTime = currentActivityResult_1.elapsed_time_raw - previousBestResultThisYear_1.elapsed_time_raw;
                        deltaYearPRCell.html("<span title='Time difference with your previous best result this year (" + Helper.secondsToHHMMSS(previousBestResultThisYear_1.elapsed_time_raw, true) + " on " + previousBestResultThisYear_1.start_date_local + ")' style='font-size:11px; color:" + (deltaTime > 0 ? "#FF5555" : "#2EB92E") + ";'>" + ((Math.sign(deltaTime) == 1) ? "+" : "-") + Helper.secondsToHHMMSS(Math.abs(deltaTime), true) + "</span>");
                    }
                    else {
                        deltaTime = (elapsedTime - currentYearPRSeconds);
                        if (deltaTime) {
                            deltaYearPRCell.html("<span title='Time difference with your current year PR time (" + Helper.secondsToHHMMSS(currentYearPRSeconds, true) + " on " + currentYearPRDate + ")' style='font-size:11px; color:" + (deltaTime > 0 ? "#FF5555" : "#2EB92E") + ";'>" + ((Math.sign(deltaTime) == 1) ? "+" : "-") + Helper.secondsToHHMMSS(Math.abs(deltaTime), true) + "</span>");
                        }
                        else {
                            deltaYearPRCell.html("<span title='First cross this year' style='font-size:11px; color: grey;'>1X</span>");
                        }
                    }
                }
            }
            else {
                deltaYearPRCell.html("<span title='First cross this year' style='font-size:11px; color: grey;'>1X</span>");
            }
        }
    };
    ActivitySegmentTimeComparisonModifier.prototype.getColorForPercentage = function (pct) {
        pct = 1 - pct;
        var percentColors = [{
                pct: 0.0,
                color: {
                    r: 0xff,
                    g: 0x55,
                    b: 0x55
                }
            }, {
                pct: 0.5,
                color: {
                    r: 0xff,
                    g: 0xff,
                    b: 0
                }
            }, {
                pct: 1.0,
                color: {
                    r: 0x00,
                    g: 0xff,
                    b: 0x00
                }
            }];
        var i;
        for (i = 1; i < percentColors.length - 1; i++) {
            if (pct < percentColors[i].pct) {
                break;
            }
        }
        var lower = percentColors[i - 1];
        var upper = percentColors[i];
        var range = upper.pct - lower.pct;
        var rangePct = (pct - lower.pct) / range;
        var pctLower = 1 - rangePct;
        var pctUpper = rangePct;
        var color = {
            r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    };
    return ActivitySegmentTimeComparisonModifier;
}());
