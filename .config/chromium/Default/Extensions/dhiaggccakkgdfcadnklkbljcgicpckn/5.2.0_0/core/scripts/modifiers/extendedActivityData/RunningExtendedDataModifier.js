var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RunningExtendedDataModifier = (function (_super) {
    __extends(RunningExtendedDataModifier, _super);
    function RunningExtendedDataModifier(activityProcessor, activityId, activityType, appResources, userSettings, athleteId, athleteIdAuthorOfActivity, basicInfos, type) {
        _super.call(this, activityProcessor, activityId, activityType, appResources, userSettings, athleteId, athleteIdAuthorOfActivity, basicInfos, type);
    }
    RunningExtendedDataModifier.prototype.insertContentSummaryGridContent = function () {
        _super.prototype.insertContentSummaryGridContent.call(this);
        var q3Move = '-';
        if (this.analysisData.paceData && this.userSettings.displayAdvancedSpeedData) {
            q3Move = Helper.secondsToHHMMSS(this.analysisData.paceData.upperQuartilePace / this.speedUnitsData.speedUnitFactor, true);
            this.insertContentAtGridPosition(1, 0, q3Move, '75% Quartile Pace', '/' + this.speedUnitsData.units, 'displayAdvancedSpeedData');
        }
        var climbPaceDisplayed = '-';
        if (this.analysisData.gradeData && this.userSettings.displayAdvancedGradeData) {
            var avgClimbPace = this.convertSpeedToPace(this.analysisData.gradeData.upFlatDownMoveData.up);
            if (avgClimbPace !== -1) {
                var seconds = avgClimbPace / this.speedUnitsData.speedUnitFactor;
                if (seconds) {
                    climbPaceDisplayed = Helper.secondsToHHMMSS(seconds, true);
                }
            }
            this.insertContentAtGridPosition(1, 2, climbPaceDisplayed, 'Avg climbing pace', '/' + this.speedUnitsData.units, 'displayAdvancedGradeData');
        }
    };
    RunningExtendedDataModifier.prototype.placeSummaryPanel = function (panelAdded) {
        this.makeSummaryGrid(2, 3);
        _super.prototype.placeSummaryPanel.call(this, panelAdded);
    };
    RunningExtendedDataModifier.prototype.placeExtendedStatsButtonSegment = function (buttonAdded) {
        var _this = this;
        setTimeout(function () {
            var htmlButton = '<section>';
            htmlButton += '<a class="btn-block btn-xs button raceshape-btn btn-primary" data-xtd-seg-effort-stats id="' + _this.segmentEffortButtonId + '">';
            htmlButton += 'Show extended statistics of effort';
            htmlButton += '</a>';
            htmlButton += '</section>';
            if ($('[data-xtd-seg-effort-stats]').length === 0) {
                $('.leaderboard-summary').after(htmlButton).each(function () {
                    _super.prototype.placeExtendedStatsButtonSegment.call(_this, buttonAdded);
                });
            }
        });
    };
    RunningExtendedDataModifier.prototype.setDataViewsNeeded = function () {
        _super.prototype.setDataViewsNeeded.call(this);
        if (this.analysisData.paceData && this.userSettings.displayAdvancedSpeedData) {
            var measurementPreference = window.currentAthlete.get('measurement_preference');
            var units = (measurementPreference == 'meters') ? '/km' : '/mi';
            var paceDataView = new PaceDataView(this.analysisData.paceData, units);
            paceDataView.setAppResources(this.appResources);
            paceDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            paceDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(paceDataView);
        }
        if (this.analysisData.cadenceData && this.userSettings.displayCadenceData) {
            var runningCadenceDataView = new RunningCadenceDataView(this.analysisData.cadenceData, 'spm', this.userSettings);
            runningCadenceDataView.setAppResources(this.appResources);
            runningCadenceDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            runningCadenceDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(runningCadenceDataView);
        }
        if (this.analysisData.gradeData && this.userSettings.displayAdvancedGradeData) {
            var runningGradeDataView = new RunningGradeDataView(this.analysisData.gradeData, '%');
            runningGradeDataView.setAppResources(this.appResources);
            runningGradeDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            runningGradeDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(runningGradeDataView);
        }
        if (this.analysisData.elevationData && this.userSettings.displayAdvancedElevationData) {
            var elevationDataView = new ElevationDataView(this.analysisData.elevationData, 'm');
            elevationDataView.setAppResources(this.appResources);
            elevationDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            elevationDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(elevationDataView);
        }
    };
    return RunningExtendedDataModifier;
}(AbstractExtendedDataModifier));
