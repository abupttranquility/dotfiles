var SegmentRecentEffortsHRATimeModifier = (function () {
    function SegmentRecentEffortsHRATimeModifier(userSettings, athleteId, segmentId) {
        this.userSettings = userSettings;
        this.athleteId = athleteId;
        this.segmentId = segmentId;
    }
    SegmentRecentEffortsHRATimeModifier.prototype.modify = function () {
        var _this = this;
        if (this.userSettings.displayRecentEffortsHRAdjustedPacePower) {
            this.hraTimeLoop = setInterval(function () {
                _this.hraTime();
            }, 750);
        }
    };
    SegmentRecentEffortsHRATimeModifier.prototype.findCurrentSegmentEfforts = function (segmentId, page, deferred, fetchedLeaderBoardData) {
        var _this = this;
        if (!page) {
            page = 1;
        }
        if (!deferred) {
            deferred = $.Deferred();
        }
        if (!fetchedLeaderBoardData) {
            fetchedLeaderBoardData = [];
        }
        var perPage = 50;
        var jqxhr = $.getJSON('/segments/' + segmentId + '/leaderboard?raw=true&page=' + page + '&per_page=' + perPage + '&viewer_context=false&filter=my_results');
        jqxhr.done(function (leaderBoardData) {
            fetchedLeaderBoardData = _.flatten(_.union(leaderBoardData.top_results, fetchedLeaderBoardData));
            if (leaderBoardData.top_results.length == 0) {
                deferred.resolve(fetchedLeaderBoardData);
            }
            else {
                _this.findCurrentSegmentEfforts(segmentId, page + 1, deferred, fetchedLeaderBoardData);
            }
        }).fail(function (error) {
            deferred.reject(error);
        });
        return deferred.promise();
    };
    SegmentRecentEffortsHRATimeModifier.prototype.hraTime = function () {
        var _this = this;
        function createElementSVG(kind) {
            var attribs = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                attribs[_i - 1] = arguments[_i];
            }
            var ret = document.createElementNS("http://www.w3.org/2000/svg", kind);
            for (var _a = 0, attribs_1 = attribs; _a < attribs_1.length; _a++) {
                var attrib = attribs_1[_a];
                ret.setAttribute(attrib[0], attrib[1]);
            }
            return ret;
        }
        function createChildElementSVG(parent, kind) {
            var attribs = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                attribs[_i - 2] = arguments[_i];
            }
            var ch = createElementSVG.apply(void 0, [kind].concat(attribs));
            parent.appendChild(ch);
            return ch;
        }
        var recentEffortsChart = $("#athlete-history-chart");
        if (!recentEffortsChart.hasClass("stravistiXGraph")) {
            recentEffortsChart.addClass("stravistiXGraph");
            var chart_1 = recentEffortsChart.find("svg");
            var marks_1 = chart_1.find("circle").filter(".mark");
            var xyFromMark_1 = function (m) {
                return { "x": m.cx.baseVal.value, "y": m.cy.baseVal.value };
            };
            var maxY_1, minY_1;
            var minX_1, maxX_1;
            marks_1.each(function (i, m) {
                var xy = xyFromMark_1(m);
                minY_1 = Helper.safeMin(minY_1, xy.y);
                maxY_1 = Helper.safeMax(maxY_1, xy.y);
                minX_1 = Helper.safeMin(minX_1, xy.x);
                maxX_1 = Helper.safeMax(maxX_1, xy.x);
            });
            this.findCurrentSegmentEfforts(this.segmentId).then(function (fetchedLeaderBoardData) {
                fetchedLeaderBoardData = fetchedLeaderBoardData.sort(function (left, right) {
                    var lDate = new Date(left.start_date_local_raw);
                    var rDate = new Date(right.start_date_local_raw);
                    return lDate.getTime() - rDate.getTime();
                });
                if (marks_1.length < fetchedLeaderBoardData.length) {
                    fetchedLeaderBoardData = fetchedLeaderBoardData.splice(-marks_1.length, marks_1.length);
                }
                var showWatts = true;
                fetchedLeaderBoardData.forEach(function (r) {
                    if (r.avg_watts == null) {
                        showWatts = false;
                    }
                });
                var minHR = null, maxHR = null;
                fetchedLeaderBoardData.forEach(function (r) {
                    minHR = Helper.safeMin(minHR, r.avg_heart_rate);
                    maxHR = Helper.safeMax(maxHR, r.avg_heart_rate);
                });
                var restHR = _this.userSettings.userRestHr;
                var targetHR = maxHR;
                var HRValueComputed = (function () {
                    function HRValueComputed(effort, hraValue) {
                        this.effort = effort;
                        this.hraValue = hraValue;
                    }
                    return HRValueComputed;
                }());
                var hrValuesComputed = fetchedLeaderBoardData.map(function (r) {
                    if (r.avg_heart_rate != null && r.avg_heart_rate > restHR) {
                        var mValue = showWatts ? r.avg_watts : r.elapsed_time_raw;
                        var ratio = (r.avg_heart_rate - restHR) / (targetHR - restHR);
                        return new HRValueComputed(r, showWatts ? mValue / ratio : mValue * ratio);
                    }
                    else
                        return new HRValueComputed(r);
                });
                var hrValues = hrValuesComputed.filter(function (h) { return h.hraValue != null; }).length;
                if (hrValues > 1) {
                    var fastestValue_1 = null;
                    var slowestValue_1 = null;
                    if (showWatts) {
                        hrValuesComputed.forEach(function (r) {
                            var rValue = r.hraValue;
                            if (rValue != null) {
                                fastestValue_1 = Helper.safeMax(fastestValue_1, rValue);
                                slowestValue_1 = Helper.safeMin(slowestValue_1, rValue);
                            }
                        });
                    }
                    else {
                        fetchedLeaderBoardData.forEach(function (r) {
                            var rValue = r.elapsed_time_raw;
                            fastestValue_1 = Helper.safeMin(fastestValue_1, rValue);
                            slowestValue_1 = Helper.safeMax(slowestValue_1, rValue);
                        });
                    }
                    if (showWatts) {
                        var minWattRange = 100;
                        var wattRange = fastestValue_1 - slowestValue_1;
                        if (wattRange < minWattRange) {
                            slowestValue_1 -= (minWattRange - wattRange) / 2;
                            if (slowestValue_1 < 0) {
                                slowestValue_1 = 0;
                            }
                            fastestValue_1 = slowestValue_1 + minWattRange;
                        }
                    }
                    var topY_1 = 10;
                    var bottomY_1 = parseInt(chart_1[0].getAttribute("height")) - 10;
                    var slowY_1 = maxY_1;
                    var fastY_1 = minY_1;
                    if (showWatts) {
                        var translateRegEx_1 = /translate\((.*),(.*)\)/;
                        var yAxis = chart_1.find(".y.axis");
                        var ticks = yAxis.find(".tick");
                        var ticksY = ticks.map(function (index, domElement) {
                            var tickText = $(domElement).attr("transform");
                            var yTick = translateRegEx_1.exec(tickText)[2];
                            return parseFloat(yTick);
                        }).valueOf();
                        var yTickTop = ticksY[0];
                        var yTickBot = ticksY[ticksY.length - 1];
                        slowY_1 = yTickTop + (yTickBot - yTickTop) * 0.25;
                        fastY_1 = yTickBot - (yTickBot - yTickTop) * 0.2;
                        var step = 25;
                        if (fastestValue_1 - slowestValue_1 >= 400) {
                            step = 100;
                        }
                        else if (fastestValue_1 - slowestValue_1 >= 200) {
                            step = 50;
                        }
                        var roundFastestDown = Math.floor(fastestValue_1 / step) * step;
                        var roundSlowestUp = Math.ceil(slowestValue_1 / step) * step;
                        var wattMarks = [];
                        for (var mWatts = roundSlowestUp; mWatts <= roundFastestDown + 1; mWatts += step) {
                            wattMarks.push(mWatts);
                        }
                        var wattAxisX = maxX_1;
                        var gAxis_1 = createElementSVG("g", ["class", "y axis"], ["style", "opacity: 1;"], ["transform", "translate(" + wattAxisX + ", 0)"]);
                        wattMarks.forEach(function (mWatts) {
                            var f = (mWatts - fastestValue_1) / (slowestValue_1 - fastestValue_1);
                            var mY = f * (slowY_1 - fastY_1) + fastY_1;
                            var g = createChildElementSVG(gAxis_1, "g", ["class", "tick"], ["style", "opacity: 1;"], ["transform", "translate(0," + mY.toFixed(0) + ")"]);
                            createChildElementSVG(g, "line", ["x2", "0"], ["y2", "0"], ["class", "grid"]);
                            var text = createChildElementSVG(g, "text", ["x", "50"], ["y", "0"], ["dy", ".32em"], ["class", "hra-axis axis-tick-text"], ["style", "text-anchor: end;"]);
                            text.textContent = mWatts.toFixed(0) + " W";
                        });
                        var insertDOM = chart_1.find(".y.axis").eq(0);
                        insertDOM.before(gAxis_1);
                    }
                    var mapValueToY_1 = function (value) {
                        return (value - fastestValue_1) / (slowestValue_1 - fastestValue_1) * (slowY_1 - fastY_1) + fastY_1;
                    };
                    var clampY_1 = function (resY) {
                        return Math.min(Math.max(topY_1, resY), bottomY_1);
                    };
                    var markData = marks_1.map(function (i, m) {
                        var xy = xyFromMark_1(m);
                        var hraValue = hrValuesComputed[i].hraValue;
                        if (hraValue != null) {
                            var resY = mapValueToY_1(hraValue);
                            return [[i, m, resY, hraValue, xy.x]];
                        }
                    }).valueOf();
                    var mappedMarks = $.map(markData, function (imr) {
                        var resY = imr[2], hraValue = imr[3], mx = imr[4];
                        var clampedY = clampY_1(resY);
                        var mark = createElementSVG("circle", ["class", "hra-time-mark mark"], ["cx", mx.toString()], ["cy", clampedY.toString()], ["r", "3"]);
                        if (resY < topY_1 || resY > bottomY_1) {
                            var title = createElementSVG("text", ["x", (mx + 4).toString()], ["y", (clampedY + 4).toString()], ["class", "axis-tick-text"]);
                            title.textContent = showWatts ? hraValue.toFixed(0) : Helper.secondsToHHMMSS(hraValue, true);
                            return [mark, title];
                        }
                        return mark;
                    });
                    var lines = [];
                    var infobox = null;
                    for (var i = 1; i < markData.length; i++) {
                        var imrPrev = markData[i - 1];
                        var imrNext = markData[i];
                        var line = createElementSVG("line", ["class", "hra-line"], ["x1", imrPrev[4].toString()], ["y1", clampY_1(imrPrev[2]).toString()], ["x2", imrNext[4].toString()], ["y2", clampY_1(imrNext[2]).toString()]);
                        lines.push(line);
                    }
                    if (lines.length > 0) {
                        var lastLine = lines[lines.length - 1];
                        var pbLabel = chart_1.find(".personal-best-label");
                        var pbValue = chart_1.find(".personal-best-value");
                        var pbLabelBox = pbLabel[0].getBBox();
                        var pbLabelValue = pbValue[0].getBBox();
                        var pbTop = Math.min(pbLabelBox.y, pbLabelValue.y);
                        var pbBot = Math.max(pbLabelBox.y + pbLabelBox.height, pbLabelValue.y + pbLabelValue.height);
                        var lastHRAY = parseFloat(lastLine.getAttribute("y2"));
                        var hoverW = 14;
                        var hoverH = 14;
                        var hoverX = 20;
                        var hoverY = -hoverH / 2;
                        var infoY = lastHRAY;
                        if (infoY + hoverH / 2 < pbTop) { }
                        else if (infoY - hoverH / 2 > pbBot) { }
                        else {
                            if (infoY < (pbTop + pbBot) / 2)
                                infoY = pbTop - hoverH / 2;
                            else
                                infoY = pbBot + hoverH / 2;
                        }
                        var boxX = parseFloat(pbLabel.attr("x"));
                        var line = createElementSVG("line", ["class", "hra-line"], ["x1", lastLine.getAttribute("x2")], ["y1", lastHRAY.toString()], ["x2", (boxX - 3).toString()], ["y2", infoY.toString()]);
                        lines.push(line);
                        infobox = createElementSVG("g", ["transform", "translate(" + boxX.toString() + ", " + infoY.toString() + ")"]);
                        {
                            var infoboxValue = createChildElementSVG(infobox, "text", ["id", "hra-value"], ["x", "0"], ["y", (hoverY + hoverH / 2).toString()]);
                            infoboxValue.textContent = maxHR.toFixed();
                        }
                        {
                            createChildElementSVG(infobox, "rect", ["id", "hra-box-help"], ["x", hoverX.toString()], ["y", hoverY.toString()], ["width", hoverW.toString()], ["height", hoverH.toString()]);
                            var infoboxHelp = createChildElementSVG(infobox, "text", ["id", "hra-value-help"], ["x", (hoverX + hoverW / 2).toString()], ["y", (hoverY + hoverH / 2).toString()]);
                            infoboxHelp.textContent = "?";
                        }
                        var infoboxHoverG = createChildElementSVG(infobox, "g", ["id", "hra-hover"]);
                        {
                            createChildElementSVG(infoboxHoverG, "rect", ["id", "hra-hover-box"], ["x", hoverX.toString()], ["y", hoverY.toString()], ["width", hoverW.toString()], ["height", hoverH.toString()]);
                            var lineH = 15;
                            var textX = 5;
                            var textY = 3;
                            var performance_1 = showWatts ? "power" : "time";
                            var infoText = [
                                "Estimation of " + performance_1 + " you could",
                                "achieve at " + maxHR.toFixed() + "bpm,",
                                "the highest average HR of",
                                "all efforts in this segment."
                            ];
                            var infoboxH = infoText.length * lineH + textY * 2 + 5;
                            var infoboxW = 200;
                            var infoboxRectG = createChildElementSVG(infoboxHoverG, "g", ["id", "hra-hover-g"], ["transform", "translate(" + (34 - infoboxW).toString() + "," + (hoverY + hoverH).toString() + ")"]);
                            createChildElementSVG(infoboxRectG, "rect", ["id", "hra-box"], ["width", infoboxW.toString()], ["height", infoboxH.toString()]);
                            for (var l = 0; l < infoText.length; l++) {
                                var text = createChildElementSVG(infoboxRectG, "text", ["x", textX.toString()], ["y", (textY + lineH * (l + 1)).toString()]);
                                text.textContent = infoText[l];
                            }
                        }
                    }
                    var firstMark = chart_1.find("circle").eq(0);
                    firstMark.before(mappedMarks);
                    var bestMark = chart_1.find("circle").filter(".personal-best-mark");
                    bestMark.after(lines);
                    if (infobox != null) {
                        var topG = chart_1.children("g").last();
                        var newG = createChildElementSVG(topG[0], "g", ["transform", topG.attr("transform")]);
                        newG.appendChild(infobox);
                        topG.after(newG);
                    }
                }
            });
            clearInterval(this.hraTimeLoop);
        }
    };
    return SegmentRecentEffortsHRATimeModifier;
}());
