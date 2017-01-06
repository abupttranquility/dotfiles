var AbstractDataView = (function () {
    function AbstractDataView(units) {
        this.content = '';
        this.viewTitle = '';
        this.units = units;
        this.hasGraph = true;
        this.mainColor = [0, 0, 0];
        this.canvasId = Helper.guid();
    }
    AbstractDataView.prototype.getContent = function () {
        return this.content;
    };
    AbstractDataView.prototype.setIsSegmentEffortView = function (bool) {
        this.isSegmentEffortView = bool;
    };
    AbstractDataView.prototype.setIsAuthorOfViewedActivity = function (bool) {
        this.isAuthorOfViewedActivity = bool;
    };
    AbstractDataView.prototype.setGraphTitleFromUnits = function () {
        this.graphTitle = (('' + this.units).toUpperCase() + ' distribution in minutes');
    };
    AbstractDataView.prototype.setActivityType = function (type) {
        this.activityType = type;
    };
    AbstractDataView.prototype.setAppResources = function (appResources) {
        this.appResources = appResources;
    };
    AbstractDataView.prototype.generateSectionTitle = function (title) {
        return "<h2 style='background-color: rgb(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + "); color: white; padding-bottom: 20px; padding-top: 20px;'><span style='padding-left: 10px;'>" + title + "</span></h2>";
    };
    AbstractDataView.prototype.generateCanvasForGraph = function () {
        if (!this.units) {
            console.error('View must have unit');
            return;
        }
        var graphWidth = window.innerWidth * 0.4;
        var screenRatio = window.innerWidth / window.innerHeight;
        if (screenRatio - 0.1 > (4 / 3)) {
            graphWidth = graphWidth * 1.3;
        }
        var htmlCanvas = '';
        htmlCanvas += '<div>';
        htmlCanvas += '<div>';
        htmlCanvas += '<canvas id="' + this.canvasId + '" height="450" width="' + graphWidth + '"></canvas>';
        htmlCanvas += '</div>';
        this.graph = $(htmlCanvas);
    };
    AbstractDataView.prototype.setupDistributionGraph = function (zones, ratio) {
        if (!ratio) {
            ratio = 1;
        }
        var labelsData = [];
        var zone;
        for (zone in zones) {
            var label = "Z" + (parseInt(zone) + 1) + " " + (zones[zone].from * ratio).toFixed(1).replace('.0', '') + " to " + (zones[zone].to * ratio).toFixed(1).replace('.0', '') + " " + this.units;
            labelsData.push(label);
        }
        var distributionArray = [];
        for (zone in zones) {
            distributionArray.push((zones[zone].s / 60).toFixed(2));
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
                    data: distributionArray
                }]
        };
    };
    AbstractDataView.prototype.injectToContent = function () {
        this.content += this.grid.html();
        this.content += this.graph.html();
        this.content += this.table.html();
    };
    AbstractDataView.prototype.displayGraph = function () {
        if (!this.canvasId) {
            console.error('View Id must exist in ' + typeof this);
            return;
        }
        if (!this.hasGraph) {
            return;
        }
        var canvas = document.getElementById(this.canvasId);
        this.chart = new Chart(canvas.getContext("2d"), {
            type: 'bar',
            data: this.graphData,
            options: {
                tooltips: {
                    custom: this.customTooltips,
                },
                scales: {
                    yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                }
            }
        });
        this.chart = this.chart.clear();
    };
    AbstractDataView.prototype.customTooltips = function (tooltip) {
        if (!tooltip || !tooltip.body || !tooltip.body[0] || !tooltip.body[0].lines || !tooltip.body[0].lines[0]) {
            return;
        }
        var lineValue = tooltip.body[0].lines[0];
        var timeInMinutes = _.first(lineValue.match(/[+-]?\d+(\.\d+)?/g).map(function (value) {
            return parseFloat(value);
        }));
        tooltip.body[0].lines[0] = 'Zone held during ' + Helper.secondsToHHMMSS(parseFloat(timeInMinutes) * 60);
    };
    AbstractDataView.prototype.setupDistributionTable = function (zones, ratio) {
        if (!ratio) {
            ratio = 1;
        }
        if (!this.units) {
            console.error('View must have units.');
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
        var zoneId = 1;
        var zone;
        for (zone in zones) {
            htmlTable += '<tr>';
            htmlTable += '<td>Z' + zoneId + '</td>';
            htmlTable += '<td>' + (zones[zone].from * ratio).toFixed(1) + '</th>';
            htmlTable += '<td>' + (zones[zone].to * ratio).toFixed(1) + '</th>';
            htmlTable += '<td>' + Helper.secondsToHHMMSS(zones[zone].s) + '</td>';
            htmlTable += '<td>' + zones[zone].percentDistrib.toFixed(1) + '%</td>';
            htmlTable += '</tr>';
            zoneId++;
        }
        htmlTable += '</table>';
        htmlTable += '</div>';
        htmlTable += '</div>';
        this.table = $(htmlTable);
    };
    AbstractDataView.prototype.makeGrid = function (columns, rows) {
        var grid = '';
        grid += '<div>';
        grid += '<div class="grid">';
        grid += '<table>';
        for (var i = 0; i < rows; i++) {
            grid += '<tr>';
            for (var j = 0; j < columns; j++) {
                grid += '<td data-column="' + j + '" data-row="' + i + '">';
                grid += '</td>';
            }
            grid += '</tr>';
        }
        grid += '</table>';
        grid += '</div>';
        grid += '</div>';
        this.grid = $(grid);
    };
    AbstractDataView.prototype.insertContentAtGridPosition = function (columnId, rowId, data, title, units, userSettingKey) {
        var onClickHtmlBehaviour = "onclick='javascript:window.open(\"" + this.appResources.settingsLink + "#/commonSettings?viewOptionHelperId=" + userSettingKey + "\",\"_blank\");'";
        if (this.grid) {
            var content_1 = '<span class="gridDataContainer" ' + onClickHtmlBehaviour + '>' + data + ' <span class="gridUnits">' + units + '</span><br /><span class="gridTitle">' + title + '</span></span>';
            this.grid.find('[data-column=' + columnId + '][data-row=' + rowId + ']').html(content_1);
        }
        else {
            console.error('Grid is not initialized');
        }
    };
    AbstractDataView.prototype.convertSpeedToPace = function (speed) {
        if (_.isNaN(speed)) {
            return -1;
        }
        return (speed === 0) ? -1 : 1 / speed * 60 * 60;
    };
    return AbstractDataView;
}());
