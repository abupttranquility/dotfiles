var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AscentSpeedDataView = (function (_super) {
    __extends(AscentSpeedDataView, _super);
    function AscentSpeedDataView(elevationData, units) {
        _super.call(this, units);
        this.mainColor = [44, 0, 204];
        this.setGraphTitleFromUnits();
        this.elevationData = elevationData;
        this.setupDistributionGraph(this.elevationData.ascentSpeedZones);
        this.setupDistributionTable(this.elevationData.ascentSpeedZones);
    }
    AscentSpeedDataView.prototype.render = function () {
        this.content += this.generateSectionTitle('<img src="' + this.appResources.tachometerIcon + '" style="vertical-align: baseline; height:20px;"/> ASCENT SPEED<a target="_blank" href="' + this.appResources.settingsLink + '#/zonesSettings/ascent" style="float: right;margin-right: 10px;"><img src="' + this.appResources.cogIcon + '" style="vertical-align: baseline; height:20px;"/></a>');
        this.makeGrid(3, 2);
        this.insertDataIntoGrid();
        this.generateCanvasForGraph();
        this.injectToContent();
    };
    AscentSpeedDataView.prototype.insertDataIntoGrid = function () {
        var ascentSpeedAvg = this.elevationData.ascentSpeed.avg;
        var ascentSpeedAvgDisplay;
        if (ascentSpeedAvg) {
            if (ascentSpeedAvg === -1) {
                ascentSpeedAvgDisplay = '&infin;';
            }
            else {
                ascentSpeedAvgDisplay = ascentSpeedAvg.toFixed(0);
            }
        }
        this.insertContentAtGridPosition(0, 0, ascentSpeedAvgDisplay, 'Avg Ascent Speed or VAM', 'Vm/h', 'displayAdvancedElevationData');
        this.insertContentAtGridPosition(0, 1, this.elevationData.ascentSpeed.lowerQuartile, '25% Quartile Ascent Speed', 'Vm/h', 'displayAdvancedElevationData');
        this.insertContentAtGridPosition(1, 1, this.elevationData.ascentSpeed.median, '50% Quartile Ascent Speed', 'Vm/h', 'displayAdvancedElevationData');
        this.insertContentAtGridPosition(2, 1, this.elevationData.ascentSpeed.upperQuartile, '75% Quartile Ascent Speed', 'Vm/h', 'displayAdvancedElevationData');
    };
    return AscentSpeedDataView;
}(AbstractDataView));
