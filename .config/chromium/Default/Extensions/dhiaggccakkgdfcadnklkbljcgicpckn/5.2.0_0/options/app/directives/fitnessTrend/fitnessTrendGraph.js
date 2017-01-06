var FitnessTrendGraph = (function () {
    function FitnessTrendGraph($scope, fitnessDataService, $colors, $window, $mdDialog) {
        this.$scope = $scope;
        this.fitnessDataService = fitnessDataService;
        this.$colors = $colors;
        this.$window = $window;
        this.$mdDialog = $mdDialog;
        var onGraphDrawTimeStart;
        var onGraphDrawnTimeDone;
        $scope.displayOnFirstDrawn = false;
        $scope.colors = $colors;
        fitnessDataService.getFitnessData().then(function (fitnessData) {
            $scope.fitnessData = fitnessData;
            $scope.fitnessDataOnToday = _.last(_.where($scope.fitnessData, {
                previewDay: false
            }));
            $scope.fitnessTrendGraphDataLoaded(!_.isEmpty($scope.fitnessData));
            setTimeout(function () {
                $scope.updateFitnessChartGraph(true, false);
            });
        });
        $scope.periodsToWatch = [{
                days: moment.duration(moment().diff(moment().subtract(7, 'days'))).asDays(),
                label: 'Last 7 days'
            }, {
                days: moment.duration(moment().diff(moment().subtract(14, 'days'))).asDays(),
                label: 'Last 14 days'
            }, {
                days: moment.duration(moment().diff(moment().subtract(1, 'months'))).asDays(),
                label: 'Last month'
            }, {
                days: moment.duration(moment().diff(moment().subtract(2, 'months'))).asDays(),
                label: 'Last 2 months'
            }, {
                days: moment.duration(moment().diff(moment().subtract(4, 'months'))).asDays(),
                label: 'Last 4 months'
            }, {
                days: moment.duration(moment().diff(moment().subtract(6, 'months'))).asDays(),
                label: 'Last 6 months'
            }, {
                days: moment.duration(moment().diff(moment().subtract(1, 'years'))).asDays(),
                label: 'Last 12 months'
            }, {
                days: moment.duration(moment().diff(moment().subtract(2, 'years'))).asDays(),
                label: 'Last 24 months'
            }, {
                days: 0,
                label: 'From the beginning'
            }];
        $scope.periodSelected = $scope.periodsToWatch[5];
        $scope.lastMonthsPeriodChanged = function () {
            $scope.updateFitnessChartGraph(true, false);
        };
        $scope.fromDateChanged = function () {
            $scope.updateFitnessChartGraph(false, true);
        };
        $scope.toDateChanged = function () {
            $scope.updateFitnessChartGraph(false, true);
        };
        $scope.updateFitnessChartGraph = function (lastMonthPeriodChange, fromOrToDateChange) {
            onGraphDrawTimeStart = performance.now();
            var fromTimestamp, toTimestamp;
            $scope.minDate = moment(_.first($scope.fitnessData).timestamp).startOf('day').toDate();
            $scope.maxDate = new Date();
            if (lastMonthPeriodChange) {
                if ($scope.periodSelected.days === 0) {
                    fromTimestamp = $scope.minDate.getTime();
                }
                else {
                    fromTimestamp = moment().startOf('day').subtract($scope.periodSelected.days.toString(), 'days').toDate().getTime();
                }
                toTimestamp = $scope.maxDate.getTime();
                $scope.fromDate = new Date(fromTimestamp);
                $scope.toDate = new Date(toTimestamp);
            }
            if (fromOrToDateChange) {
                fromTimestamp = $scope.fromDate.getTime();
                toTimestamp = moment($scope.toDate).endOf('day').toDate().getTime();
            }
            $scope.fitnessChartData = $scope.generateFitnessGraphData($scope.fitnessData, fromTimestamp, toTimestamp);
            $scope.generateGraph();
        };
        $scope.drawLegendSquare = function (color, width, text) {
            return '<span style="width: ' + width + 'px; height: ' + width + 'px; border: 1px solid grey; background-color: ' + color + '; vertical-align: middle;"></span> <span style="vertical-align: middle;">' + text + '</span>';
        };
        $scope.drawHtmlSeparator = function () {
            return '<div style="width: 100%; border-bottom: 1px solid ' + $colors.lightGrey + '; padding-bottom: 3px; padding-top: 3px;"></div>';
        };
        $scope.makeTooltip = function (d) {
            var fitnessObject = (_.findWhere($scope.fitnessData, {
                timestamp: d.value
            }));
            var hasActivities = (fitnessObject.activitiesName.length) ? true : false;
            var html = '';
            html += '<table class="trendGraphTooltipTable" style="color: ' + $colors.midGrey + ';">';
            html += '   <tr>';
            html += '       <td colspan="3" class="dayType underlined" style="color: ' + (hasActivities ? $colors.strava : $colors.midGrey) + ';">' + ((fitnessObject.previewDay) ? 'PREVIEW' : (hasActivities ? 'ACTIVE' : 'REST')) + '</td>';
            html += '   </tr>';
            if (hasActivities) {
                html += '   <tr>';
                html += '       <td class="title" style="vertical-align: top;">Name</td>';
                html += '       <td colspan="2" style="white-space:pre-wrap ; word-wrap:break-word;">' + fitnessObject.activitiesName + '</td>';
                html += '   </tr>';
            }
            if (hasActivities) {
                html += '   <tr>';
                html += '       <td class="title">Type</td>';
                html += '       <td colspan="2">' + fitnessObject.type + '</td>';
                html += '   </tr>';
            }
            if (hasActivities) {
                html += '   <tr>';
                html += '       <td class="title">TRIMP</td>';
                html += '       <td>' + fitnessObject.trimp + '</td>';
                html += '   </tr>';
            }
            html += '   <tr>';
            html += '       <td class="title underlined">Date</td>';
            html += '       <td class="underlined" colspan="2">' + moment(d.point.x).format('MMMM Do YYYY') + '</td>';
            html += '   </tr>';
            html += '   <tr>';
            html += '       <td class="title" colspan="2">' + $scope.drawLegendSquare($colors.ctl, 10, 'FITNESS') + '</td>';
            html += '       <td>' + fitnessObject.ctl + '</td>';
            html += '   </tr>';
            html += '   <tr>';
            html += '       <td class="title" colspan="2">' + $scope.drawLegendSquare($colors.atl, 10, 'FATIGUE') + '</td>';
            html += '       <td>' + fitnessObject.atl + '</td>';
            html += '   </tr>';
            html += '   <tr>';
            html += '       <td class="title" colspan="2">' + $scope.drawLegendSquare($colors.tsb, 10, 'FORM') + '</td>';
            html += '       <td>' + fitnessObject.tsb + '</td>';
            html += '   </tr>';
            if (hasActivities) {
                html += '   <tr>';
                html += '       <td class="underlined" colspan="3"></td>';
                html += '   </tr>';
                html += '   <tr>';
                html += '       <td colspan="3" class="hint"><i>Hint: Click to open activities</i></td>';
                html += '   </tr>';
            }
            html += '</table>';
            return html;
        };
        $scope.generateGraph = function () {
            $scope.fitnessChartOptions = {
                chart: {
                    type: 'lineWithFocusChart',
                    height: window.innerHeight * 0.65,
                    showLegend: false,
                    margin: {
                        top: 20,
                        right: 50,
                        bottom: 80,
                        left: 50
                    },
                    yDomain: $scope.fitnessChartData.yDomain,
                    x: function (d) {
                        return d.x;
                    },
                    y: function (d) {
                        return d.y;
                    },
                    dispatch: {
                        stateChange: function (e) {
                            console.log("stateChange");
                        },
                        changeState: function (e) {
                        },
                        tooltipShow: function (e) {
                            console.log("tooltipShow");
                        },
                        tooltipHide: function (e) {
                            console.log("tooltipHide");
                        },
                    },
                    lines: {
                        dispatch: {
                            elementClick: function (d) {
                                var fitnessObject = (_.findWhere($scope.fitnessData, {
                                    timestamp: d.point.x
                                }));
                                _.each(fitnessObject.ids, function (activityId) {
                                    $window.open('https://www.strava.com/activities/' + activityId, '_blank');
                                });
                            }
                        }
                    },
                    interactive: true,
                    tooltip: {
                        enabled: true,
                        hideDelay: 500,
                        contentGenerator: function (d) {
                            return $scope.makeTooltip(d);
                        }
                    },
                    xAxis: {
                        ticks: 12,
                        tickFormat: function (d) {
                            return (new Date(d)).toLocaleDateString();
                        },
                        staggerLabels: true
                    },
                    yAxis: {
                        ticks: 10,
                        tickFormat: function (d) {
                            return d3.format('.01f')(d);
                        },
                        axisLabelDistance: -10,
                    },
                    y2Axis: {
                        tickFormat: function (d) {
                            return d3.format('.01f')(d);
                        },
                    },
                    x2Axis: {
                        ticks: 10,
                        tickFormat: function (d) {
                            return;
                        },
                        tickPadding: 15,
                    },
                    callback: function (chart) {
                        chart.legend.updateState(false);
                        $scope.onGraphDrawn();
                    },
                }
            };
        };
        $scope.generateFitnessGraphData = function (fitnessData, fromTimestamp, toTimestamp) {
            var ctlValues = [];
            var atlValues = [];
            var tsbValues = [];
            var activitiesPoints = [];
            _.each(fitnessData, function (fitData) {
                if (!fitData.previewDay && fitData.timestamp >= fromTimestamp && fitData.timestamp <= toTimestamp) {
                    ctlValues.push({
                        x: fitData.timestamp,
                        y: fitData.ctl
                    });
                    atlValues.push({
                        x: fitData.timestamp,
                        y: fitData.atl
                    });
                    tsbValues.push({
                        x: fitData.timestamp,
                        y: fitData.tsb
                    });
                    if (fitData.activitiesName.length > 0) {
                        activitiesPoints.push({
                            x: fitData.timestamp,
                            y: 0
                        });
                    }
                }
            });
            var ctlPreviewValues = [];
            var atlPreviewValues = [];
            var tsbPreviewValues = [];
            var fitnessDataPreview = _.where(fitnessData, {
                previewDay: true
            });
            if (moment(toTimestamp).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
                _.each(fitnessDataPreview, function (fitData) {
                    ctlPreviewValues.push({
                        x: fitData.timestamp,
                        y: fitData.ctl
                    });
                    atlPreviewValues.push({
                        x: fitData.timestamp,
                        y: fitData.atl
                    });
                    tsbPreviewValues.push({
                        x: fitData.timestamp,
                        y: fitData.tsb
                    });
                });
            }
            var yDomainMax = d3.max([
                d3.max(ctlValues, function (d) {
                    return parseInt(d.y);
                }),
                d3.max(atlValues, function (d) {
                    return parseInt(d.y);
                }),
                d3.max(tsbValues, function (d) {
                    return parseInt(d.y);
                }),
                d3.max(ctlPreviewValues, function (d) {
                    return parseInt(d.y);
                }),
                d3.max(atlPreviewValues, function (d) {
                    return parseInt(d.y);
                }),
                d3.max(tsbPreviewValues, function (d) {
                    return parseInt(d.y);
                })
            ], function (d) {
                return d;
            });
            var yDomainMin = d3.min([
                d3.min(ctlValues, function (d) {
                    return parseInt(d.y);
                }),
                d3.min(atlValues, function (d) {
                    return parseInt(d.y);
                }),
                d3.min(tsbValues, function (d) {
                    return parseInt(d.y);
                }),
                d3.min(ctlPreviewValues, function (d) {
                    return parseInt(d.y);
                }),
                d3.min(atlPreviewValues, function (d) {
                    return parseInt(d.y);
                }),
                d3.min(tsbPreviewValues, function (d) {
                    return parseInt(d.y);
                })
            ], function (d) {
                return d;
            });
            var fitnessGraphData = {
                curves: [{
                        key: "Fitness/CTL",
                        values: ctlValues,
                        color: $colors.ctl,
                    }, {
                        key: "Fatigue/ATL",
                        values: atlValues,
                        color: $colors.atl
                    }, {
                        key: "Form/TSB",
                        values: tsbValues,
                        color: $colors.tsb,
                        area: true
                    }, {
                        key: "Active days",
                        values: activitiesPoints,
                        color: $colors.strongGrey
                    }, {
                        key: "Preview_CTL",
                        values: ctlPreviewValues,
                        color: $colors.ctl
                    }, {
                        key: "Preview_ATL",
                        values: atlPreviewValues,
                        color: $colors.atl
                    }, {
                        key: "Preview_TSB",
                        values: tsbPreviewValues,
                        color: $colors.tsb
                    }],
                yDomain: [yDomainMin * 1.05, yDomainMax * 1.05]
            };
            return fitnessGraphData;
        };
        $scope.onGraphDrawn = function () {
            $scope.displayOnFirstDrawn = true;
            $scope.$apply();
            onGraphDrawnTimeDone = performance.now();
            console.log("Generating Fitness Graph took " + (onGraphDrawnTimeDone - onGraphDrawTimeStart).toFixed(0) + " ms.");
        };
        $scope.showHelp = function () {
            $mdDialog.show({
                controller: function ($scope) {
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                },
                templateUrl: 'directives/fitnessTrend/templates/fitnessHelper.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };
        $scope.$on('window-resize-gt-md', function () {
            $window.dispatchEvent(new Event('resize'));
        });
    }
    FitnessTrendGraph.$inject = ['$scope', 'FitnessDataService', '$colors', '$window', '$mdDialog'];
    return FitnessTrendGraph;
}());
app.directive('fitnessTrendGraph', [function () {
        return {
            templateUrl: 'directives/fitnessTrend/templates/fitnessTrendGraph.html',
            controller: FitnessTrendGraph
        };
    }]);
