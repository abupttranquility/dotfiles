var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RunningCadenceDataView = (function (_super) {
    __extends(RunningCadenceDataView, _super);
    function RunningCadenceDataView(cadenceData, units, userSettings) {
        if (userSettings.enableBothLegsCadence) {
            var cadenceDataClone = $.extend(true, {}, cadenceData);
            cadenceDataClone.averageCadenceMoving *= 2;
            cadenceDataClone.lowerQuartileCadence *= 2;
            cadenceDataClone.medianCadence *= 2;
            cadenceDataClone.upperQuartileCadence *= 2;
            for (var zone in cadenceDataClone.cadenceZones) {
                cadenceDataClone.cadenceZones[zone].from *= 2;
                cadenceDataClone.cadenceZones[zone].to *= 2;
            }
            _super.call(this, cadenceDataClone, units);
        }
        else {
            _super.call(this, cadenceData, units);
        }
        this.userSettings = userSettings;
        this.setGraphTitleFromUnits();
    }
    RunningCadenceDataView.prototype.render = function () {
        this.content += this.generateSectionTitle('<img src="' + this.appResources.circleNotchIcon + '" style="vertical-align: baseline; height:20px;"/> CADENCE @ ' + ((this.userSettings.enableBothLegsCadence) ? '2 legs' : '1 leg') + ' <a target="_blank" href="' + this.appResources.settingsLink + '#/zonesSettings/runningCadence" style="float: right;margin-right: 10px;"><img src="' + this.appResources.cogIcon + '" style="vertical-align: baseline; height:20px;"/></a>');
        this.makeGrid(3, 2);
        this.insertDataIntoGrid();
        this.generateCanvasForGraph();
        this.injectToContent();
    };
    RunningCadenceDataView.prototype.insertDataIntoGrid = function () {
        this.insertContentAtGridPosition(0, 0, this.cadenceData.averageCadenceMoving.toFixed(1), 'Average Cadence', this.units, 'displayCadenceData');
        this.insertContentAtGridPosition(0, 1, this.cadenceData.lowerQuartileCadence, '25% Quartile Cadence', this.units, 'displayCadenceData');
        this.insertContentAtGridPosition(1, 1, this.cadenceData.medianCadence, '50% Quartile Cadence', this.units, 'displayCadenceData');
        this.insertContentAtGridPosition(2, 1, this.cadenceData.upperQuartileCadence, '75% Quartile Cadence', this.units, 'displayCadenceData');
    };
    return RunningCadenceDataView;
}(AbstractCadenceDataView));
