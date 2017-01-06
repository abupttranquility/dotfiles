var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SpeedDataView = (function (_super) {
    __extends(SpeedDataView, _super);
    function SpeedDataView(speedData, units) {
        _super.call(this, units);
        this.mainColor = [9, 123, 219];
        this.setGraphTitleFromUnits();
        this.speedData = speedData;
        this.speedUnitsData = Helper.getSpeedUnitData();
        this.setupDistributionGraph(this.speedData.speedZones, this.speedUnitsData.speedUnitFactor);
        this.setupDistributionTable(this.speedData.speedZones, this.speedUnitsData.speedUnitFactor);
    }
    SpeedDataView.prototype.render = function () {
        this.content += this.generateSectionTitle('<img src="' + this.appResources.tachometerIcon + '" style="vertical-align: baseline; height:20px;"/> SPEED <a target="_blank" href="' + this.appResources.settingsLink + '#/zonesSettings/speed" style="float: right;margin-right: 10px;"><img src="' + this.appResources.cogIcon + '" style="vertical-align: baseline; height:20px;"/></a>');
        this.makeGrid(3, 2);
        this.insertDataIntoGrid();
        this.generateCanvasForGraph();
        this.injectToContent();
    };
    SpeedDataView.prototype.insertDataIntoGrid = function () {
        this.insertContentAtGridPosition(0, 0, (this.speedData.lowerQuartileSpeed * this.speedUnitsData.speedUnitFactor).toFixed(1), '25% Quartile Speed', this.speedUnitsData.speedUnitPerHour, 'displayAdvancedSpeedData');
        this.insertContentAtGridPosition(1, 0, (this.speedData.medianSpeed * this.speedUnitsData.speedUnitFactor).toFixed(1), '50% Quartile Speed', this.speedUnitsData.speedUnitPerHour, 'displayAdvancedSpeedData');
        this.insertContentAtGridPosition(2, 0, (this.speedData.upperQuartileSpeed * this.speedUnitsData.speedUnitFactor).toFixed(1), '75% Quartile Speed', this.speedUnitsData.speedUnitPerHour, 'displayAdvancedSpeedData');
        this.insertContentAtGridPosition(0, 1, (this.speedData.standardDeviationSpeed * this.speedUnitsData.speedUnitFactor).toFixed(1), 'Std Deviation &sigma;', this.speedUnitsData.speedUnitPerHour, 'displayAdvancedSpeedData');
        this.insertContentAtGridPosition(1, 1, (this.speedData.genuineAvgSpeed * this.speedUnitsData.speedUnitFactor).toFixed(1), 'Average speed', this.speedUnitsData.speedUnitPerHour, 'displayAdvancedSpeedData');
        if (!this.isSegmentEffortView) {
            this.insertContentAtGridPosition(2, 1, (this.speedData.totalAvgSpeed * this.speedUnitsData.speedUnitFactor).toFixed(1), 'Full time Avg speed', this.speedUnitsData.speedUnitPerHour, 'displayAdvancedSpeedData');
        }
    };
    return SpeedDataView;
}(AbstractDataView));
