var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ElevationDataView = (function (_super) {
    __extends(ElevationDataView, _super);
    function ElevationDataView(elevationData, units) {
        _super.call(this, units);
        this.mainColor = [216, 212, 38];
        this.elevationData = elevationData;
        this.setGraphTitleFromUnits();
        this.setupDistributionGraph(this.elevationData.elevationZones);
        this.setupDistributionTable(this.elevationData.elevationZones);
    }
    ElevationDataView.prototype.render = function () {
        this.content += this.generateSectionTitle('<img src="' + this.appResources.logArrowUpIcon + '" style="vertical-align: baseline; height:20px;"/> ELEVATION <a target="_blank" href="' + this.appResources.settingsLink + '#/zonesSettings/elevation" style="float: right;margin-right: 10px;"><img src="' + this.appResources.cogIcon + '" style="vertical-align: baseline; height:20px;"/></a>');
        this.makeGrid(3, 2);
        this.insertDataIntoGrid();
        this.generateCanvasForGraph();
        this.injectToContent();
    };
    ElevationDataView.prototype.insertDataIntoGrid = function () {
        this.insertContentAtGridPosition(0, 0, this.elevationData.avgElevation, 'Average Elevation', 'm', 'displayAdvancedElevationData');
        this.insertContentAtGridPosition(1, 0, this.elevationData.accumulatedElevationAscent.toFixed(0), 'Ascent', 'm', 'displayAdvancedElevationData');
        this.insertContentAtGridPosition(2, 0, this.elevationData.accumulatedElevationDescent.toFixed(0), 'Descent', 'm', 'displayAdvancedElevationData');
        this.insertContentAtGridPosition(0, 1, this.elevationData.lowerQuartileElevation, '25% Quartile Elevation', 'm', 'displayAdvancedElevationData');
        this.insertContentAtGridPosition(1, 1, this.elevationData.medianElevation, '50% Quartile Elevation', 'm', 'displayAdvancedElevationData');
        this.insertContentAtGridPosition(2, 1, this.elevationData.upperQuartileElevation, '75% Quartile Elevation', 'm', 'displayAdvancedElevationData');
    };
    return ElevationDataView;
}(AbstractDataView));
