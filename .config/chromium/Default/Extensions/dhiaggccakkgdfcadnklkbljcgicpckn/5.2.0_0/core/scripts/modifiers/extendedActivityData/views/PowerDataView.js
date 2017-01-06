var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PowerDataView = (function (_super) {
    __extends(PowerDataView, _super);
    function PowerDataView(powerData, units) {
        _super.call(this, units);
        this.mainColor = [96, 96, 96];
        this.setGraphTitleFromUnits();
        this.powerData = powerData;
        this.setupDistributionGraph(this.powerData.powerZones);
        this.setupDistributionTable(this.powerData.powerZones);
    }
    PowerDataView.prototype.render = function () {
        this.content += this.generateSectionTitle('<img src="' + this.appResources.boltIcon + '" style="vertical-align: baseline; height:20px;"/> POWER <a target="_blank" href="' + this.appResources.settingsLink + '#/zonesSettings/power" style="float: right;margin-right: 10px;"><img src="' + this.appResources.cogIcon + '" style="vertical-align: baseline; height:20px;"/></a>');
        this.makeGrid(3, 3);
        this.insertDataIntoGrid();
        this.generateCanvasForGraph();
        this.injectToContent();
    };
    PowerDataView.prototype.insertDataIntoGrid = function () {
        this.insertContentAtGridPosition(0, 0, this.powerData.weightedPower.toFixed(0), 'Weighted Power', 'W', 'displayAdvancedPowerData');
        this.insertContentAtGridPosition(1, 0, this.powerData.variabilityIndex.toFixed(2), 'Variability Index', '', 'displayAdvancedPowerData');
        if (this.powerData.punchFactor) {
            this.insertContentAtGridPosition(2, 0, this.powerData.punchFactor.toFixed(2), 'Punch Factor', '', 'displayAdvancedPowerData');
        }
        this.insertContentAtGridPosition(0, 1, this.powerData.lowerQuartileWatts, '25% Quartile Watts', 'W', 'displayAdvancedPowerData');
        this.insertContentAtGridPosition(1, 1, this.powerData.medianWatts, '50% Quartile Watts', 'W', 'displayAdvancedPowerData');
        this.insertContentAtGridPosition(2, 1, this.powerData.upperQuartileWatts, '75% Quartile Watts', 'W', 'displayAdvancedPowerData');
        this.insertContentAtGridPosition(0, 2, this.powerData.avgWattsPerKg.toFixed(2), 'Avg Watts/Kg', 'W/Kg', 'displayAdvancedPowerData');
        this.insertContentAtGridPosition(1, 2, this.powerData.weightedWattsPerKg.toFixed(2), 'Weighted Watts/Kg', 'W/Kg', 'displayAdvancedPowerData');
    };
    return PowerDataView;
}(AbstractDataView));
