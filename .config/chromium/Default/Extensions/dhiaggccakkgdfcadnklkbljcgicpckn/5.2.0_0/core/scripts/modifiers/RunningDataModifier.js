var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractRunningDataModifier = (function () {
    function AbstractRunningDataModifier(dataWatch) {
        this.dataWatch = dataWatch;
    }
    AbstractRunningDataModifier.prototype.modify = function () {
        var _this = this;
        this.intervalId = setInterval(function () {
            var element = $('#elevation-profile td[data-type=' + _this.dataWatch + '] .toggle-button')
                .not('.once-only')
                .addClass('once-only');
            if (element.length === 0) {
                clearInterval(_this.intervalId);
            }
            element.click();
            if ($('#elevation-profile td[data-type=' + _this.dataWatch + ']').find('.active').length) {
                clearInterval(_this.intervalId);
            }
        }, AbstractRunningDataModifier.INTERVAL_DELAY);
    };
    AbstractRunningDataModifier.INTERVAL_DELAY = 750;
    return AbstractRunningDataModifier;
}());
var RunningHeartRateModifier = (function (_super) {
    __extends(RunningHeartRateModifier, _super);
    function RunningHeartRateModifier() {
        _super.call(this, 'heartrate');
    }
    return RunningHeartRateModifier;
}(AbstractRunningDataModifier));
var RunningCadenceModifier = (function (_super) {
    __extends(RunningCadenceModifier, _super);
    function RunningCadenceModifier() {
        _super.call(this, 'cadence');
    }
    return RunningCadenceModifier;
}(AbstractRunningDataModifier));
var RunningTemperatureModifier = (function (_super) {
    __extends(RunningTemperatureModifier, _super);
    function RunningTemperatureModifier() {
        _super.call(this, 'temp');
    }
    return RunningTemperatureModifier;
}(AbstractRunningDataModifier));
var RunningGradeAdjustedPaceModifier = (function (_super) {
    __extends(RunningGradeAdjustedPaceModifier, _super);
    function RunningGradeAdjustedPaceModifier() {
        _super.call(this, 'grade_adjusted_pace');
    }
    return RunningGradeAdjustedPaceModifier;
}(AbstractRunningDataModifier));
