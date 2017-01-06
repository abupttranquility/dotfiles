var AbstractExtendedDataModifier = (function () {
    function AbstractExtendedDataModifier(activityProcessor, activityId, activityType, appResources, userSettings, athleteId, athleteIdAuthorOfActivity, basicInfo, type) {
        var _this = this;
        this.dataViews = [];
        this.activityProcessor = activityProcessor;
        this.activityId = activityId;
        this.activityType = activityType;
        this.appResources = appResources;
        this.userSettings = userSettings;
        this.athleteId = athleteId;
        this.athleteIdAuthorOfActivity = athleteIdAuthorOfActivity;
        this.basicInfo = basicInfo;
        this.isAuthorOfViewedActivity = (this.athleteIdAuthorOfActivity == this.athleteId);
        this.speedUnitsData = Helper.getSpeedUnitData();
        this.type = type;
        if (_.isNull(this.type)) {
            console.error('ExtendedDataModifier must be set');
        }
        this.activityProcessor.setActivityType(activityType);
        this.activityProcessor.getAnalysisData(this.activityId, null, function (analysisData) {
            _this.analysisData = analysisData;
            if (_this.type === AbstractExtendedDataModifier.TYPE_ACTIVITY) {
                _this.placeSummaryPanel(function () {
                    _this.placeExtendedStatsButton(function () {
                        if (_this.isAuthorOfViewedActivity) {
                            Helper.getFromStorage(_this.appResources.extensionId, StorageManager.storageLocalType, 'profileConfigured').then(function (profileConfigured) {
                                if (!profileConfigured || !profileConfigured.data) {
                                    $('#extendedStatsButton').after("<a target='_blank' href='" + _this.appResources.settingsLink + "#/athleteSettings'>Did you check your athlete settings before?</a>");
                                }
                            });
                        }
                    });
                });
            }
            else if (_this.type === AbstractExtendedDataModifier.TYPE_SEGMENT) {
                _this.placeExtendedStatsButtonSegment(function () {
                });
            }
        });
    }
    AbstractExtendedDataModifier.prototype.placeSummaryPanel = function (panelAdded) {
        this.insertContentSummaryGridContent();
        $('.inline-stats.section').first().after(this.summaryGrid.html()).each(function () {
            if (panelAdded)
                panelAdded();
        });
    };
    AbstractExtendedDataModifier.prototype.makeSummaryGrid = function (columns, rows) {
        var summaryGrid = '';
        summaryGrid += '<div>';
        summaryGrid += '<div class="summaryGrid">';
        summaryGrid += '<table>';
        for (var i = 0; i < rows; i++) {
            summaryGrid += '<tr>';
            for (var j = 0; j < columns; j++) {
                summaryGrid += '<td data-column="' + j + '" data-row="' + i + '">';
                summaryGrid += '</td>';
            }
            summaryGrid += '</tr>';
        }
        summaryGrid += '</table>';
        summaryGrid += '</div>';
        summaryGrid += '</div>';
        this.summaryGrid = $(summaryGrid);
    };
    AbstractExtendedDataModifier.prototype.insertContentSummaryGridContent = function () {
        var moveRatio = '-';
        if (this.analysisData.moveRatio && this.userSettings.displayActivityRatio) {
            moveRatio = this.analysisData.moveRatio.toFixed(2);
        }
        this.insertContentAtGridPosition(0, 0, moveRatio, 'Move Ratio', '', 'displayActivityRatio');
        var trainingImpulse = '-';
        var activityHeartRateReserve = '-';
        var activityHeartRateReserveUnit = '%';
        if (this.analysisData.heartRateData && this.userSettings.displayAdvancedHrData) {
            trainingImpulse = this.analysisData.heartRateData.TRIMP.toFixed(0) + ' <span class="summarySubGridTitle">(' + this.analysisData.heartRateData.TRIMPPerHour.toFixed(1) + ' / hour)</span>';
            activityHeartRateReserve = this.analysisData.heartRateData.activityHeartRateReserve.toFixed(0);
            activityHeartRateReserveUnit = '%  <span class="summarySubGridTitle">(Max: ' + this.analysisData.heartRateData.activityHeartRateReserveMax.toFixed(0) + '% @ ' + this.analysisData.heartRateData.maxHeartRate + 'bpm)</span>';
        }
        this.insertContentAtGridPosition(0, 1, trainingImpulse, 'TRaining IMPulse', '', 'displayAdvancedHrData');
        this.insertContentAtGridPosition(1, 1, activityHeartRateReserve, 'Heart Rate Reserve Avg', activityHeartRateReserveUnit, 'displayAdvancedHrData');
        var climbTime = '-';
        var climbTimeExtra = '';
        if (this.analysisData.gradeData && this.userSettings.displayAdvancedGradeData) {
            climbTime = Helper.secondsToHHMMSS(this.analysisData.gradeData.upFlatDownInSeconds.up);
            climbTimeExtra = '<span class="summarySubGridTitle">(' + (this.analysisData.gradeData.upFlatDownInSeconds.up / this.analysisData.gradeData.upFlatDownInSeconds.total * 100).toFixed(0) + '% of time)</span>';
        }
        this.insertContentAtGridPosition(0, 2, climbTime, 'Time climbing', climbTimeExtra, 'displayAdvancedGradeData');
    };
    AbstractExtendedDataModifier.prototype.placeExtendedStatsButton = function (buttonAdded) {
        var _this = this;
        var htmlButton = '<section style="text-align: center;">';
        htmlButton += '<a class="button btn-block btn-primary" id="extendedStatsButton" href="#">';
        htmlButton += 'Show extended statistics';
        htmlButton += '</a>';
        htmlButton += '</section>';
        $('.inline-stats.section').first().after(htmlButton).each(function () {
            $('#extendedStatsButton').click(function () {
                _this.activityProcessor.setActivityType(_this.activityType);
                _this.activityProcessor.getAnalysisData(_this.activityId, null, function (analysisData) {
                    _this.analysisData = analysisData;
                    _this.renderViews();
                    _this.showResultsAndRefreshGraphs();
                });
            });
            if (buttonAdded)
                buttonAdded();
        });
    };
    AbstractExtendedDataModifier.prototype.placeExtendedStatsButtonSegment = function (buttonAdded) {
        var _this = this;
        $('#' + this.segmentEffortButtonId).click(function () {
            _this.getSegmentInfos(function (segmentInfosResponse) {
                if (!segmentInfosResponse.start_index && segmentInfosResponse.end_index) {
                    return;
                }
                _this.basicInfo.segmentEffort = {
                    name: segmentInfosResponse.display_name,
                    elapsedTimeSec: segmentInfosResponse.elapsed_time_raw
                };
                _this.activityProcessor.getAnalysisData(_this.activityId, [segmentInfosResponse.start_index, segmentInfosResponse.end_index], function (analysisData) {
                    _this.analysisData = analysisData;
                    _this.renderViews();
                    _this.showResultsAndRefreshGraphs();
                });
            });
        });
        if (buttonAdded)
            buttonAdded();
    };
    AbstractExtendedDataModifier.prototype.getSegmentInfos = function (callback) {
        var effortId = parseInt(window.location.pathname.split('/')[4] || window.location.hash.replace('#', '')) || null;
        if (!effortId) {
            console.error('No effort id found');
            return;
        }
        var segmentInfosResponse;
        $.when($.ajax({
            url: '/segment_efforts/' + effortId,
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            },
            dataType: 'json',
            success: function (xhrResponseText) {
                segmentInfosResponse = xhrResponseText;
            },
            error: function (err) {
                console.error(err);
            }
        })).then(function () {
            callback(segmentInfosResponse);
        });
    };
    AbstractExtendedDataModifier.prototype.renderViews = function () {
        var _this = this;
        this.content = '';
        this.setDataViewsNeeded();
        _.each(this.dataViews, function (view) {
            if (!view) {
                console.warn(view);
            }
            view.render();
            _this.content += view.getContent();
        });
    };
    AbstractExtendedDataModifier.prototype.showResultsAndRefreshGraphs = function () {
        $.fancybox({
            padding: 0,
            margin: 15,
            width: '100%',
            height: '100%',
            autoScale: true,
            transitionIn: 'none',
            transitionOut: 'none',
            closeBtn: false,
            type: 'iframe',
            content: '<div class="stravistiXExtendedData">' + this.content + '</div>'
        });
        _.each(this.dataViews, function (view) {
            view.displayGraph();
        });
    };
    AbstractExtendedDataModifier.prototype.setDataViewsNeeded = function () {
        this.cleanDataViews();
        if (this.analysisData) {
            var featuredDataView = new FeaturedDataView(this.analysisData, this.userSettings, this.basicInfo);
            featuredDataView.setAppResources(this.appResources);
            featuredDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            featuredDataView.setActivityType(this.activityType);
            featuredDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(featuredDataView);
        }
        if (this.analysisData.heartRateData && this.userSettings.displayAdvancedHrData) {
            var heartRateDataView = new HeartRateDataView(this.analysisData.heartRateData, 'hrr', this.userSettings);
            heartRateDataView.setAppResources(this.appResources);
            heartRateDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            heartRateDataView.setActivityType(this.activityType);
            heartRateDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(heartRateDataView);
        }
    };
    AbstractExtendedDataModifier.prototype.cleanDataViews = function () {
        if (!_.isEmpty(this.dataViews)) {
            for (var i = 0; i < this.dataViews.length; i++) {
                this.dataViews[i] = null;
                delete this.dataViews[i];
            }
            this.dataViews = [];
        }
    };
    AbstractExtendedDataModifier.prototype.insertContentAtGridPosition = function (columnId, rowId, data, title, units, userSettingKey) {
        var onClickHtmlBehaviour = "onclick='javascript:window.open(\"" + this.appResources.settingsLink + "#/commonSettings?viewOptionHelperId=" + userSettingKey + "\",\"_blank\");'";
        if (this.summaryGrid) {
            var content_1 = '<span class="summaryGridDataContainer" ' + onClickHtmlBehaviour + '>' + data + ' <span class="summaryGridUnits">' + units + '</span><br /><span class="summaryGridTitle">' + title + '</span></span>';
            this.summaryGrid.find('[data-column=' + columnId + '][data-row=' + rowId + ']').html(content_1);
        }
        else {
            console.error('Grid is not initialized');
        }
    };
    AbstractExtendedDataModifier.prototype.convertSpeedToPace = function (speed) {
        if (_.isNaN(speed)) {
            return -1;
        }
        return (speed === 0) ? -1 : 1 / speed * 60 * 60;
    };
    AbstractExtendedDataModifier.TYPE_ACTIVITY = 0;
    AbstractExtendedDataModifier.TYPE_SEGMENT = 1;
    return AbstractExtendedDataModifier;
}());
