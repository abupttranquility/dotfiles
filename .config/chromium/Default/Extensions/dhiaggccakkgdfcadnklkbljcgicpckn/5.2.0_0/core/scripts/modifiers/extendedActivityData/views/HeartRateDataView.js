var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HeartRateDataView = (function (_super) {
    __extends(HeartRateDataView, _super);
    function HeartRateDataView(heartRateData, units, userSettings) {
        _super.call(this, units);
        this.mainColor = [255, 43, 66];
        this.heartRateData = heartRateData;
        this.setGraphTitleFromUnits();
        this.userSettings = userSettings;
        this.setupDistributionGraph();
        this.setupDistributionTable();
    }
    HeartRateDataView.prototype.setupDistributionTable = function () {
        var htmlTable = '';
        htmlTable += '<div>';
        htmlTable += '<div style="height:500px; overflow:auto;">';
        htmlTable += '<table class="distributionTable">';
        htmlTable += '<tr>';
        htmlTable += '<td>ZONE</td>';
        htmlTable += '<td>%HRR</td>';
        htmlTable += '<td>BPM</td>';
        htmlTable += '<td>TIME</td>';
        htmlTable += '<td>% ZONE</td>';
        htmlTable += '</tr>';
        var zoneId = 1;
        for (var zone in this.heartRateData.hrrZones) {
            htmlTable += '<tr>';
            htmlTable += '<td>Z' + zoneId + '</td>';
            htmlTable += '<td>' + this.heartRateData.hrrZones[zone].fromHrr + "% - " + this.heartRateData.hrrZones[zone].toHrr + "%" + '</th>';
            htmlTable += '<td>' + this.heartRateData.hrrZones[zone].fromHr + " - " + this.heartRateData.hrrZones[zone].toHr + '</td>';
            htmlTable += '<td>' + Helper.secondsToHHMMSS(this.heartRateData.hrrZones[zone].s) + '</td>';
            htmlTable += '<td>' + this.heartRateData.hrrZones[zone].percentDistrib.toFixed(0) + '%</td>';
            htmlTable += '</tr>';
            zoneId++;
        }
        htmlTable += '</table>';
        htmlTable += '</div>';
        htmlTable += '</div>';
        this.table = $(htmlTable);
    };
    HeartRateDataView.prototype.setupDistributionGraph = function () {
        var labelsData = [];
        var zone;
        for (zone in this.heartRateData.hrrZones) {
            var label = "Z" + (parseInt(zone) + 1) + " " + this.heartRateData.hrrZones[zone].fromHrr + "-" + this.heartRateData.hrrZones[zone].toHrr + "%";
            labelsData.push(label);
        }
        var hrDistributionInMinutesArray = [];
        for (zone in this.heartRateData.hrrZones) {
            hrDistributionInMinutesArray.push((this.heartRateData.hrrZones[zone].s / 60).toFixed(2));
        }
        this.graphData = {
            labels: labelsData,
            datasets: [{
                    label: this.graphTitle,
                    backgroundColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 0.5)",
                    borderColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 1)",
                    borderWidth: 1,
                    hoverBackgroundColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 0.8)",
                    hoverBorderColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 1)",
                    data: hrDistributionInMinutesArray
                }]
        };
    };
    HeartRateDataView.prototype.customTooltips = function (tooltip) {
        if (!tooltip || !tooltip.body || !tooltip.body[0] || !tooltip.body[0].lines || !tooltip.body[0].lines[0]) {
            return;
        }
        var lineValue = tooltip.body[0].lines[0];
        var timeInMinutes = _.first(lineValue.match(/[+-]?\d+(\.\d+)?/g).map(function (value) {
            return parseFloat(value);
        }));
        var hr = tooltip.title[0].split(' ')[1].replace('%', '').split('-');
        tooltip.body[0].lines[0] = Helper.heartrateFromHeartRateReserve(parseInt(hr[0]), StravistiX.instance.userSettings.userMaxHr, StravistiX.instance.userSettings.userRestHr) + ' - ' + Helper.heartrateFromHeartRateReserve(parseInt(hr[1]), StravistiX.instance.userSettings.userMaxHr, StravistiX.instance.userSettings.userRestHr) + ' bpm held during ' + Helper.secondsToHHMMSS(timeInMinutes * 60);
    };
    HeartRateDataView.prototype.render = function () {
        this.content += this.generateSectionTitle('<img src="' + this.appResources.heartBeatIcon + '" style="vertical-align: baseline; height:20px;"/> HEART RATE <a target="_blank" href="' + this.appResources.settingsLink + '#/hrrZonesSettings" style="float: right;margin-right: 10px;"><img src="' + this.appResources.cogIcon + '" style="vertical-align: baseline; height:20px;"/></a>');
        this.makeGrid(3, 3);
        this.insertDataIntoGrid();
        this.generateCanvasForGraph();
        this.setupDistributionTable();
        if (!this.isAuthorOfViewedActivity) {
            this.content += '<u>Note:</u> You don\'t own this activity. Notice that <strong>TRaining IMPulse</strong>, <strong>%HRR Average</strong> and <strong>distribution graph</strong> are computed from your StravistiX health settings.<br/>';
            this.content += 'This allows you to analyse your heart capacity with the data recorded on the activity of this athlete.<br/><br/>';
        }
        this.injectToContent();
    };
    HeartRateDataView.prototype.insertDataIntoGrid = function () {
        this.insertContentAtGridPosition(0, 0, this.heartRateData.TRIMP.toFixed(0), 'TRaining IMPulse', '', 'displayAdvancedHrData');
        this.insertContentAtGridPosition(1, 0, this.heartRateData.averageHeartRate.toFixed(0), 'Average Heart Rate', 'bpm', 'displayAdvancedHrData');
        this.insertContentAtGridPosition(2, 0, this.heartRateData.activityHeartRateReserve.toFixed(0), 'Heart Rate Reserve Avg', '%', 'displayAdvancedHrData');
        this.insertContentAtGridPosition(0, 1, this.heartRateData.lowerQuartileHeartRate, '25% Quartile HeartRate', 'bpm', 'displayAdvancedHrData');
        this.insertContentAtGridPosition(1, 1, this.heartRateData.medianHeartRate, '50% Quartile HeartRate', 'bpm', 'displayAdvancedHrData');
        this.insertContentAtGridPosition(2, 1, this.heartRateData.upperQuartileHeartRate, '75% Quartile HeartRate', 'bpm', 'displayAdvancedHrData');
        this.insertContentAtGridPosition(0, 2, this.heartRateData.TRIMPPerHour.toFixed(1), 'TRaining IMPulse / Hour', '', 'displayAdvancedHrData');
    };
    return HeartRateDataView;
}(AbstractDataView));
