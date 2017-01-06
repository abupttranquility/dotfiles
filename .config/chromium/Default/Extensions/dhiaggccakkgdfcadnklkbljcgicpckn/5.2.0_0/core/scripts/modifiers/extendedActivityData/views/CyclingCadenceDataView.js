var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CyclingCadenceDataView = (function (_super) {
    __extends(CyclingCadenceDataView, _super);
    function CyclingCadenceDataView(cadenceData, units) {
        _super.call(this, cadenceData, units);
    }
    CyclingCadenceDataView.prototype.render = function () {
        this.content += this.generateSectionTitle('<img src="' + this.appResources.circleNotchIcon + '" style="vertical-align: baseline; height:20px;"/> CADENCE <a target="_blank" href="' + this.appResources.settingsLink + '#/zonesSettings/cyclingCadence" style="float: right;margin-right: 10px;"><img src="' + this.appResources.cogIcon + '" style="vertical-align: baseline; height:20px;"/></a>');
        this.makeGrid(3, 3);
        this.insertDataIntoGrid();
        this.generateCanvasForGraph();
        this.injectToContent();
    };
    CyclingCadenceDataView.prototype.insertDataIntoGrid = function () {
        this.insertContentAtGridPosition(0, 0, this.cadenceData.cadencePercentageMoving.toFixed(2), 'Cadence % while moving', '%', 'displayCadenceData');
        this.insertContentAtGridPosition(1, 0, Helper.secondsToHHMMSS(this.cadenceData.cadenceTimeMoving), 'Cadence Time while moving', '', 'displayCadenceData');
        this.insertContentAtGridPosition(2, 0, this.cadenceData.crankRevolutions.toFixed(0), 'Crank Revolutions', '', 'displayCadenceData');
        this.insertContentAtGridPosition(0, 1, this.cadenceData.lowerQuartileCadence, '25% Quartile Cadence', 'rpm', 'displayCadenceData');
        this.insertContentAtGridPosition(1, 1, this.cadenceData.medianCadence, '50% Quartile Cadence', 'rpm', 'displayCadenceData');
        this.insertContentAtGridPosition(2, 1, this.cadenceData.upperQuartileCadence, '75% Quartile Cadence', 'rpm', 'displayCadenceData');
        this.insertContentAtGridPosition(0, 2, this.cadenceData.standardDeviationCadence, 'Std Deviation &sigma;', 'rpm', 'displayCadenceData');
    };
    return CyclingCadenceDataView;
}(AbstractCadenceDataView));
