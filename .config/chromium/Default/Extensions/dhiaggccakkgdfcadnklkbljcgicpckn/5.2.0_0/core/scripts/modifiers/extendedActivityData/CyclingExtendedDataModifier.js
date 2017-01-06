var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CyclingExtendedDataModifier = (function (_super) {
    __extends(CyclingExtendedDataModifier, _super);
    function CyclingExtendedDataModifier(activityProcessor, activityId, activityType, appResources, userSettings, athleteId, athleteIdAuthorOfActivity, basicInfos, type) {
        _super.call(this, activityProcessor, activityId, activityType, appResources, userSettings, athleteId, athleteIdAuthorOfActivity, basicInfos, type);
    }
    CyclingExtendedDataModifier.prototype.insertContentSummaryGridContent = function () {
        _super.prototype.insertContentSummaryGridContent.call(this);
        var q3Move = '-';
        if (this.analysisData.speedData && this.userSettings.displayAdvancedSpeedData) {
            q3Move = (this.analysisData.speedData.upperQuartileSpeed * this.speedUnitsData.speedUnitFactor).toFixed(1);
            this.insertContentAtGridPosition(1, 0, q3Move, '75% Quartile Speed', this.speedUnitsData.speedUnitPerHour + ' <span class="summarySubGridTitle">(&sigma; :' + (this.analysisData.speedData.standardDeviationSpeed * this.speedUnitsData.speedUnitFactor).toFixed(1) + ' )</span>', 'displayAdvancedSpeedData');
        }
        var climbSpeed = '-';
        if (this.analysisData.gradeData && this.userSettings.displayAdvancedGradeData) {
            climbSpeed = (this.analysisData.gradeData.upFlatDownMoveData.up * this.speedUnitsData.speedUnitFactor).toFixed(1);
        }
        this.insertContentAtGridPosition(1, 2, climbSpeed, 'Avg climbing speed', this.speedUnitsData.speedUnitPerHour, 'displayAdvancedGradeData');
        var medianCadence = '-';
        var standardDeviationCadence = '-';
        if (this.analysisData.cadenceData && this.userSettings.displayCadenceData) {
            medianCadence = this.analysisData.cadenceData.medianCadence.toString();
            standardDeviationCadence = this.analysisData.cadenceData.standardDeviationCadence.toString();
        }
        this.insertContentAtGridPosition(0, 3, medianCadence, 'Median Cadence', (standardDeviationCadence !== '-') ? ' rpm <span class="summarySubGridTitle">(&sigma; :' + standardDeviationCadence + ' )</span>' : '', 'displayCadenceData');
        var cadenceTimeMoving = '-';
        var cadencePercentageMoving = '-';
        if (this.analysisData.cadenceData && this.userSettings.displayCadenceData) {
            cadenceTimeMoving = Helper.secondsToHHMMSS(this.analysisData.cadenceData.cadenceTimeMoving);
            cadencePercentageMoving = this.analysisData.cadenceData.cadencePercentageMoving.toFixed(0);
        }
        this.insertContentAtGridPosition(1, 3, cadenceTimeMoving, 'Pedaling Time', (cadencePercentageMoving !== '-') ? ' <span class="summarySubGridTitle">(' + cadencePercentageMoving + '% of activity)</span>' : '', 'displayCadenceData');
        var weightedPower = '-';
        if (this.analysisData.powerData && this.userSettings.displayAdvancedPowerData) {
            weightedPower = this.analysisData.powerData.weightedPower.toFixed(0);
            var labelWeightedPower = 'Weighted Avg Power';
            if (!this.analysisData.powerData.hasPowerMeter) {
                labelWeightedPower = 'Estimated ' + labelWeightedPower;
            }
            this.insertContentAtGridPosition(0, 4, weightedPower, labelWeightedPower, ' w <span class="summarySubGridTitle" style="font-size: 11px;">(Dr. A. Coggan formula)</span>', 'displayAdvancedPowerData');
        }
        var avgWattsPerKg = '-';
        if (this.analysisData.powerData && this.userSettings.displayAdvancedPowerData) {
            avgWattsPerKg = this.analysisData.powerData.avgWattsPerKg.toFixed(2);
            var labelWKg = 'Watts Per Kilograms';
            if (!this.analysisData.powerData.hasPowerMeter) {
                labelWKg = 'Estimated ' + labelWKg;
            }
            this.insertContentAtGridPosition(1, 4, avgWattsPerKg, labelWKg, ' w/kg', 'displayAdvancedPowerData');
        }
    };
    CyclingExtendedDataModifier.prototype.placeSummaryPanel = function (panelAdded) {
        this.makeSummaryGrid(2, 6);
        _super.prototype.placeSummaryPanel.call(this, panelAdded);
    };
    CyclingExtendedDataModifier.prototype.placeExtendedStatsButtonSegment = function (buttonAdded) {
        var _this = this;
        var htmlButton = '<section>';
        htmlButton += '<a class="btn-block btn-xs button raceshape-btn btn-primary" data-xtd-seg-effort-stats id="' + this.segmentEffortButtonId + '">';
        htmlButton += 'Show extended statistics of effort';
        htmlButton += '</a>';
        htmlButton += '</section>';
        if ($('[data-xtd-seg-effort-stats]').length === 0) {
            $('.raceshape-btn').last().after(htmlButton).each(function () {
                _super.prototype.placeExtendedStatsButtonSegment.call(_this, buttonAdded);
            });
        }
    };
    CyclingExtendedDataModifier.prototype.setDataViewsNeeded = function () {
        _super.prototype.setDataViewsNeeded.call(this);
        if (this.analysisData.speedData && this.userSettings.displayAdvancedSpeedData) {
            var measurementPreference = window.currentAthlete.get('measurement_preference');
            var units = (measurementPreference == 'meters') ? 'kph' : 'mph';
            var speedDataView = new SpeedDataView(this.analysisData.speedData, units);
            speedDataView.setAppResources(this.appResources);
            speedDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            speedDataView.setActivityType(this.activityType);
            speedDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(speedDataView);
        }
        if (this.analysisData.powerData && this.userSettings.displayAdvancedPowerData) {
            var powerDataView = new PowerDataView(this.analysisData.powerData, 'w');
            powerDataView.setAppResources(this.appResources);
            powerDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            powerDataView.setActivityType(this.activityType);
            powerDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(powerDataView);
        }
        if (this.analysisData.cadenceData && this.userSettings.displayCadenceData) {
            var cyclingCadenceDataView = new CyclingCadenceDataView(this.analysisData.cadenceData, 'rpm');
            cyclingCadenceDataView.setAppResources(this.appResources);
            cyclingCadenceDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            cyclingCadenceDataView.setActivityType(this.activityType);
            cyclingCadenceDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(cyclingCadenceDataView);
        }
        if (this.analysisData.gradeData && this.userSettings.displayAdvancedGradeData) {
            var cyclingGradeDataView = new CyclingGradeDataView(this.analysisData.gradeData, '%');
            cyclingGradeDataView.setAppResources(this.appResources);
            cyclingGradeDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            cyclingGradeDataView.setActivityType(this.activityType);
            cyclingGradeDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(cyclingGradeDataView);
        }
        if (this.analysisData.elevationData && this.userSettings.displayAdvancedElevationData) {
            var elevationDataView = new ElevationDataView(this.analysisData.elevationData, 'm');
            elevationDataView.setAppResources(this.appResources);
            elevationDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
            elevationDataView.setActivityType(this.activityType);
            elevationDataView.setIsSegmentEffortView(this.type === AbstractExtendedDataModifier.TYPE_SEGMENT);
            this.dataViews.push(elevationDataView);
            if (this.analysisData.elevationData.ascentSpeed && this.analysisData.elevationData.ascentSpeedZones) {
                var ascentSpeedDataView = new AscentSpeedDataView(this.analysisData.elevationData, 'Vm/h');
                ascentSpeedDataView.setAppResources(this.appResources);
                ascentSpeedDataView.setIsAuthorOfViewedActivity(this.isAuthorOfViewedActivity);
                ascentSpeedDataView.setActivityType(this.activityType);
                this.dataViews.push(ascentSpeedDataView);
            }
        }
    };
    return CyclingExtendedDataModifier;
}(AbstractExtendedDataModifier));
