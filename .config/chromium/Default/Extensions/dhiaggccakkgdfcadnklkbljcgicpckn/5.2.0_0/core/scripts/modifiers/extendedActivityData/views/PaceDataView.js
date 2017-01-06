var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PaceDataView = (function (_super) {
    __extends(PaceDataView, _super);
    function PaceDataView(paceData, units) {
        _super.call(this, units);
        this.mainColor = [9, 123, 219];
        this.setGraphTitleFromUnits();
        this.paceData = paceData;
        this.speedUnitsData = Helper.getSpeedUnitData();
        this.setupDistributionGraph(this.paceData.paceZones, 1 / this.speedUnitsData.speedUnitFactor);
        this.setupDistributionTable(this.paceData.paceZones, 1 / this.speedUnitsData.speedUnitFactor);
    }
    PaceDataView.prototype.render = function () {
        this.content += this.generateSectionTitle('<img src="' + this.appResources.tachometerIcon + '" style="vertical-align: baseline; height:20px;"/> PACE <a target="_blank" href="' + this.appResources.settingsLink + '#/zonesSettings/pace" style="float: right;margin-right: 10px;"><img src="' + this.appResources.cogIcon + '" style="vertical-align: baseline; height:20px;"/></a>');
        this.makeGrid(3, 2);
        this.insertDataIntoGrid();
        this.generateCanvasForGraph();
        this.injectToContent();
    };
    PaceDataView.prototype.insertDataIntoGrid = function () {
        var paceTimePerDistance = Helper.secondsToHHMMSS(this.paceData.avgPace / this.speedUnitsData.speedUnitFactor, true);
        this.insertContentAtGridPosition(0, 0, Helper.secondsToHHMMSS(this.paceData.lowerQuartilePace / this.speedUnitsData.speedUnitFactor, true), '25% Quartile Pace', this.units, 'displayAdvancedSpeedData');
        this.insertContentAtGridPosition(1, 0, Helper.secondsToHHMMSS(this.paceData.medianPace / this.speedUnitsData.speedUnitFactor, true), '50% Quartile Pace', this.units, 'displayAdvancedSpeedData');
        this.insertContentAtGridPosition(2, 0, Helper.secondsToHHMMSS(this.paceData.upperQuartilePace / this.speedUnitsData.speedUnitFactor, true), '75% Quartile Pace', this.units, 'displayAdvancedSpeedData');
        if (this.isSegmentEffortView) {
            this.insertContentAtGridPosition(0, 1, paceTimePerDistance, 'Average pace', '/' + this.speedUnitsData.units, 'displayAdvancedSpeedData');
        }
    };
    PaceDataView.prototype.setupDistributionTable = function (zones, ratio) {
        if (!ratio) {
            ratio = 1;
        }
        if (!this.units) {
            console.error('View must have unit');
            return;
        }
        var htmlTable = '';
        htmlTable += '<div>';
        htmlTable += '<div style="height:500px; overflow:auto;">';
        htmlTable += '<table class="distributionTable">';
        htmlTable += '<tr>';
        htmlTable += '<td>ZONE</td>';
        htmlTable += '<td>FROM ' + this.units.toUpperCase() + '</td>';
        htmlTable += '<td>TO ' + this.units.toUpperCase() + '</td>';
        htmlTable += '<td>TIME</td>';
        htmlTable += '<td>% ZONE</td>';
        htmlTable += '</tr>';
        _.each(zones, function (zone, index) {
            var from = (zone.from === 0) ? '&infin;' : Helper.secondsToHHMMSS(zone.from * ratio);
            htmlTable += '<tr>';
            htmlTable += '<td>Z' + (index + 1) + '</td>';
            htmlTable += '<td>' + from + '</th>';
            htmlTable += '<td>' + Helper.secondsToHHMMSS(zone.to * ratio) + '</th>';
            htmlTable += '<td>' + Helper.secondsToHHMMSS(zone.s) + '</td>';
            htmlTable += '<td>' + zone.percentDistrib.toFixed(1) + '%</td>';
            htmlTable += '</tr>';
        });
        htmlTable += '</table>';
        htmlTable += '</div>';
        htmlTable += '</div>';
        this.table = $(htmlTable);
    };
    PaceDataView.prototype.setupDistributionGraph = function (zones, ratio) {
        var _this = this;
        if (!ratio) {
            ratio = 1;
        }
        var labelsData = [];
        var distributionArray = [];
        _.each(zones, function (zone, index) {
            var from = (zone.from === 0) ? 'Infinite' : Helper.secondsToHHMMSS(zone.from * ratio);
            var label = "Z" + (index + 1) + ": " + from + " - " + Helper.secondsToHHMMSS(zone.to * ratio) + " " + _this.units;
            labelsData.push(label);
            distributionArray.push((zone.s / 60).toFixed(2));
        });
        this.graphData = {
            labels: labelsData,
            datasets: [{
                    label: this.graphTitle,
                    backgroundColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 0.5)",
                    borderColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 1)",
                    borderWidth: 1,
                    hoverBackgroundColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 0.8)",
                    hoverBorderColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 1)",
                    data: distributionArray
                }]
        };
    };
    return PaceDataView;
}(AbstractDataView));
