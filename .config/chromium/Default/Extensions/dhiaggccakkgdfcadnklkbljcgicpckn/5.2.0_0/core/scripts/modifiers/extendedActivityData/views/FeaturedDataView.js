var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FeaturedDataView = (function (_super) {
    __extends(FeaturedDataView, _super);
    function FeaturedDataView(analysisData, userSettings, basicInfo) {
        _super.call(this, null);
        this.hasGraph = false;
        this.analysisData = analysisData;
        this.userSettings = userSettings;
        this.basicInfo = basicInfo;
        if (!this.analysisData || !this.userSettings) {
            console.error('analysisData and userSettings are required');
        }
        if (this.isSegmentEffortView && !_.isEmpty(this.basicInfo.segmentEffort)) {
            this.mainColor = [252, 76, 2];
        }
    }
    FeaturedDataView.prototype.render = function () {
        if (this.analysisData.moveRatio && this.userSettings.displayActivityRatio ||
            this.analysisData.toughnessScore && this.userSettings.displayMotivationScore ||
            this.analysisData.speedData && this.userSettings.displayAdvancedSpeedData ||
            this.analysisData.heartRateData && this.userSettings.displayAdvancedHrData ||
            this.analysisData.powerData && this.userSettings.displayAdvancedPowerData ||
            this.analysisData.gradeData && this.userSettings.displayAdvancedGradeData) {
            var title = '<img src="' + this.appResources.lightbulbIcon + '" style="vertical-align: baseline; height:20px;"/>';
            if (this.isSegmentEffortView && !_.isEmpty(this.basicInfo.segmentEffort)) {
                title += ' EFFORT STATS on <i>&lt;' + this.basicInfo.segmentEffort.name + '&gt;</i> SEGMENT // TIME ' + Helper.secondsToHHMMSS(this.basicInfo.segmentEffort.elapsedTimeSec);
                this.content += this.generateSectionTitle(title);
            }
            else {
                title += ' STATS on <i>&lt;' + this.basicInfo.activityName + '&gt;</i> ACTIVITY';
                this.content += this.generateSectionTitle(title);
            }
            this.makeGrid(7, 1);
            this.insertDataIntoGrid();
            this.content += '<div class="featuredData">' + this.grid.html() + '</div>';
        }
    };
    FeaturedDataView.prototype.insertDataIntoGrid = function () {
        var speedUnitsData = Helper.getSpeedUnitData();
        if (this.analysisData.moveRatio && this.userSettings.displayActivityRatio && _.isEmpty(this.basicInfo.segmentEffort)) {
            this.insertContentAtGridPosition(0, 0, this.analysisData.moveRatio.toFixed(2), 'Move Ratio', '', 'displayActivityRatio');
        }
        if (this.analysisData.toughnessScore && this.userSettings.displayMotivationScore) {
            this.insertContentAtGridPosition(1, 0, this.analysisData.toughnessScore.toFixed(0), 'Toughness Factor', '', 'displayMotivationScore');
        }
        if (this.analysisData.speedData && this.userSettings.displayAdvancedSpeedData) {
            this.insertContentAtGridPosition(2, 0, (this.analysisData.speedData.upperQuartileSpeed * speedUnitsData.speedUnitFactor).toFixed(1), '75% Quartile Speed', speedUnitsData.speedUnitPerHour, 'displayAdvancedSpeedData');
        }
        if (this.analysisData.heartRateData && this.userSettings.displayAdvancedHrData) {
            this.insertContentAtGridPosition(3, 0, this.analysisData.heartRateData.TRIMP.toFixed(0), 'TRaining IMPulse', '', 'displayAdvancedHrData');
            this.insertContentAtGridPosition(4, 0, this.analysisData.heartRateData.activityHeartRateReserve.toFixed(0), 'Heart Rate Reserve Avg', '%', 'displayAdvancedHrData');
        }
        if (this.analysisData.powerData && this.userSettings.displayAdvancedPowerData && this.analysisData.powerData.weightedWattsPerKg) {
            this.insertContentAtGridPosition(5, 0, this.analysisData.powerData.weightedWattsPerKg.toFixed(2), 'Weighted Watts/kg', 'w/kg', 'displayAdvancedPowerData');
        }
        if (this.analysisData.gradeData && this.userSettings.displayAdvancedGradeData) {
            this.insertContentAtGridPosition(6, 0, this.analysisData.gradeData.gradeProfile, 'Grade Profile', '', 'displayAdvancedGradeData');
        }
        this.grid.find('td:empty').remove();
    };
    return FeaturedDataView;
}(AbstractDataView));
