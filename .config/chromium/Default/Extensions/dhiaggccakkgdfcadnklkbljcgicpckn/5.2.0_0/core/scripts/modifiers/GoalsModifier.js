var GOAL_MARKER_TEXT_WIDTH = 40;
var GoalsModifier = (function () {
    function GoalsModifier($element) {
        var _this = this;
        this.modify = function () {
            _this.getActivities().then(function (activities) {
                _this.$element.find('.tab-contents > .tab-content').each(function (_, tab) {
                    var $tab = $(tab);
                    var $view = $(tab).find('.js-view');
                    var $edit = $(tab).find('.js-edit');
                    var $barYearly = _this.findProgressBar($view);
                    var goal = _this.findGoal($edit, 'year');
                    var activityType = $tab.attr('data-sport');
                    activityType =
                        activityType[0].toUpperCase() + activityType.slice(1);
                    var $actual = $barYearly.find('.actual');
                    var actual = parseInt($actual.text().replace(/[^0-9]/g, ""), 10);
                    if (goal.value !== 0) {
                        if (goal.units === GoalUnit.METRES) {
                            actual = actual * 1000;
                        }
                        else if (goal.units === GoalUnit.YARDS) {
                            actual = actual * 1760;
                        }
                        goal.value = Math.max(goal.value - actual, 0);
                        _this.addProgressBarMonthly($view, activities, activityType, goal);
                        _this.addProgressBarWeekly($view, activities, activityType, goal);
                    }
                    _this.labelProgressBar($barYearly, '2016');
                });
            });
        };
        this.addProgressBarWeekly = function ($view, activities, activityType, goal) {
            var now = new Date();
            var weekStart = new Date();
            var day = weekStart.getDay() || 7;
            if (day !== 1) {
                weekStart.setHours(-24 * (day - 1));
            }
            weekStart.setHours(0, 0, 0, 0);
            var weekProgress = day / 7;
            var weekNumber = _this.weekNumber();
            var weekCount = _this.weekCount();
            var weeksRemaining = _this.weekCount() - _this.weekNumber() + 1;
            var scaledGoal = {
                value: goal.value / weeksRemaining,
                units: goal.units,
            };
            var actual = _this.calculateActual(activities, weekStart, activityType, goal.units);
            var bar = _this.createProgressBar($view, scaledGoal, actual, weekProgress);
            _this.labelProgressBar(bar, "this week");
            $view.append(bar);
        };
        this.weekNumber = function () {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var counter = new Date(today.getFullYear(), 0, 1);
            var week = 0;
            while (counter <= today) {
                week++;
                counter.setDate(counter.getDate() + 7);
            }
            return week;
        };
        this.weekCount = function () {
            var now = new Date();
            var counter = new Date(now.getFullYear(), 0, 1);
            var newYear = new Date(now.getFullYear() + 1, 0, 1);
            var week = 0;
            while (counter < newYear) {
                week++;
                counter.setDate(counter.getDate() + 7);
            }
            return week;
        };
        this.addProgressBarMonthly = function ($view, activities, activityType, goal) {
            var now = new Date();
            var monthStart = new Date();
            monthStart.setHours(0, 0, 0, 0);
            monthStart.setDate(1);
            var monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            var monthProgress = now.getDate() / monthDays;
            var monthsRemaining = 12 - monthStart.getMonth();
            var scaledGoal = {
                value: goal.value / monthsRemaining,
                units: goal.units,
            };
            var actual = _this.calculateActual(activities, monthStart, activityType, goal.units);
            var bar = _this.createProgressBar($view, scaledGoal, actual, monthProgress);
            _this.labelProgressBar(bar, [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ][now.getMonth()]);
            $view.append(bar);
        };
        this.getActivities = function () {
            var activities = [];
            var monthStart = new Date();
            monthStart.setHours(0, 0, 0, 0);
            monthStart.setDate(1);
            return new Promise(function (resolve, reject) {
                var request = function (page) {
                    $.ajax({
                        url: "/athlete/training_activities",
                        type: 'GET',
                        data: {
                            page: page,
                            new_activity_only: false,
                        },
                        dataType: 'json',
                        success: function (response) {
                            var monthStartReached = false;
                            activities.push.apply(activities, response.models);
                            for (var _i = 0, _a = response.models; _i < _a.length; _i++) {
                                var activity = _a[_i];
                                if (activity.start_date_local_raw < +monthStart) {
                                    monthStartReached = true;
                                }
                            }
                            if (response.models.length === response.perPage
                                && !monthStartReached) {
                                request(page + 1);
                            }
                            else {
                                resolve(activities);
                            }
                        },
                        error: function () {
                            console.log("Unable to fetch activities since " + monthStart);
                            reject();
                        },
                    });
                };
                request(1);
            });
        };
        this.calculateActual = function (activities, since, type, units) {
            var actual = 0;
            for (var _i = 0, activities_1 = activities; _i < activities_1.length; _i++) {
                var activity = activities_1[_i];
                if (activity.start_date_local_raw < +since / 1000) {
                    break;
                }
                if (activity.type === type) {
                    if (units === GoalUnit.METRES) {
                        actual = actual + activity.distance_raw;
                    }
                    else if (units === GoalUnit.YARDS) {
                        actual = actual + (activity.distance_raw * 1.09361);
                    }
                    else if (units === GoalUnit.HOURS) {
                        actual = actual + (activity.moving_time_raw / 3600);
                    }
                }
            }
            return actual;
        };
        this.findGoal = function ($edit, period) {
            var goalString = $edit.find("[data-period=\"" + period + "\"] .goal-value").val();
            var goalNumeric = parseInt(goalString, 10);
            if (!goalNumeric) {
                goalNumeric = 0;
            }
            var $units = $edit.find("[data-period=\"" + period + "\"] .goal-unit");
            var units = $units.find('button.active').attr('data-type');
            var goalUnits = GoalUnit.UNKNOWN;
            if (units === 'distance') {
                var unitsSymbol = $units.find('button.active').text().trim();
                if (unitsSymbol.charAt(unitsSymbol.length - 1) === "m") {
                    goalUnits = GoalUnit.METRES;
                    if (unitsSymbol === 'km') {
                        goalNumeric = goalNumeric * 1000;
                    }
                }
                else {
                    goalUnits = GoalUnit.YARDS;
                    if (unitsSymbol === 'mi') {
                        goalNumeric = goalNumeric * 1760;
                    }
                }
            }
            else if (units === 'time') {
                goalUnits = GoalUnit.HOURS;
            }
            return {
                value: goalNumeric,
                units: goalUnits,
            };
        };
        this.findProgressBar = function ($view) {
            return $view
                .find('[id$="-yearly-progress-container"]')
                .first();
        };
        this.createProgressBar = function ($view, goal, actual, progress) {
            var $sourceContainer = _this.findProgressBar($view);
            var $container = $sourceContainer.clone();
            var $svg = $container.find('.chart-container svg');
            var $tooltip = $container.find('.yearly-goal-tooltip');
            var $tooltipSource = $sourceContainer.find('.yearly-goal-tooltip');
            var formattedGoal = _this.formatValue(goal.value, goal.units);
            var formattedActual = _this.formatValue(actual, goal.units, false);
            var difference = (goal.value * progress) - actual;
            var formattedDifference = _this.formatValue(Math.abs(difference), goal.units);
            $container
                .find('.primary-stats')
                .contents()
                .filter(function () {
                return this.nodeType === 3;
            })
                .last()
                .replaceWith(" / " + formattedGoal);
            $container
                .find('.primary-stats .actual')
                .text(formattedActual);
            if (difference > 0) {
                $tooltip.text(formattedDifference + " behind pace");
            }
            else {
                $tooltip.text(formattedDifference + " ahead of pace");
            }
            $svg.find('g').hover(function () {
                $tooltip.attr('style', $tooltipSource.attr('style'));
                $tooltip.addClass('yearly-goal-tooltip-visible');
            }, function () {
                $tooltip.removeClass('yearly-goal-tooltip-visible');
            });
            _this.updateProgressBarSVG($svg, goal, actual, progress);
            return $container;
        };
        this.updateProgressBarSVG = function ($svg, goal, actual, progress) {
            var $container = $svg.find('rect.progress-bar-container');
            var $fill = $svg.find('rect.progress-bar-fill');
            var $marker = $svg.find('line.progress-marker');
            var $markerText = $svg.find('text');
            var markerNudge = 0;
            var width = parseInt($container.attr('width'), 10);
            if (goal.value === 0) {
                $fill.attr('width', width);
            }
            else {
                $fill.attr('width', width * (actual / goal.value));
            }
            if (progress >= 1) {
                progress = 1;
                markerNudge = -1;
            }
            else if (progress <= 0) {
                progress = 0;
            }
            var markerX = (width * progress) + markerNudge;
            $marker
                .attr('x1', markerX)
                .attr('x2', markerX);
            var markerTextAnchor = 'middle';
            if (width - markerX < GOAL_MARKER_TEXT_WIDTH) {
                markerTextAnchor = 'end';
            }
            else if (markerX < GOAL_MARKER_TEXT_WIDTH) {
                markerTextAnchor = 'start';
            }
            $markerText
                .attr('x', markerX)
                .attr('text-anchor', markerTextAnchor);
        };
        this.labelProgressBar = function ($bar, label) {
            var $label = $('<span>');
            $label
                .text(label)
                .css('float', 'right')
                .css('padding-top', '0.4em')
                .css('text-transform', 'uppercase')
                .css('font-size', '0.6em');
            $bar.find('.primary-stats').append($label);
        };
        this.formatValue = function (value, units, includeUnits) {
            if (includeUnits === void 0) { includeUnits = true; }
            var formattedValue = '';
            var formattedUnits = '';
            if (units === GoalUnit.METRES) {
                formattedUnits = ' km';
                formattedValue = (Math.round(value / 1000)).toLocaleString();
            }
            else if (units === GoalUnit.YARDS) {
                formattedUnits = ' mi';
                formattedValue = (Math.round(value / 1760)).toLocaleString();
            }
            else if (units === GoalUnit.HOURS) {
                formattedUnits = 'h';
                formattedValue = Math.round(value).toLocaleString();
            }
            if (!includeUnits) {
                formattedUnits = '';
            }
            return "" + formattedValue + formattedUnits;
        };
        this.$element = $element;
    }
    return GoalsModifier;
}());
var GoalUnit;
(function (GoalUnit) {
    GoalUnit[GoalUnit["UNKNOWN"] = 0] = "UNKNOWN";
    GoalUnit[GoalUnit["METRES"] = 1] = "METRES";
    GoalUnit[GoalUnit["YARDS"] = 2] = "YARDS";
    GoalUnit[GoalUnit["HOURS"] = 3] = "HOURS";
})(GoalUnit || (GoalUnit = {}));
