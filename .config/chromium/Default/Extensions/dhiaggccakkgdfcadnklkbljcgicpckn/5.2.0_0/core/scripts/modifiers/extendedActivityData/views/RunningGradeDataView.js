var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RunningGradeDataView = (function (_super) {
    __extends(RunningGradeDataView, _super);
    function RunningGradeDataView(gradeData, units) {
        _super.call(this, gradeData, units);
    }
    RunningGradeDataView.prototype.insertDataIntoGrid = function () {
        _super.prototype.insertDataIntoGrid.call(this);
        this.gradeData.upFlatDownMoveData.up = this.convertSpeedToPace(this.gradeData.upFlatDownMoveData.up);
        this.gradeData.upFlatDownMoveData.flat = this.convertSpeedToPace(this.gradeData.upFlatDownMoveData.flat);
        this.gradeData.upFlatDownMoveData.down = this.convertSpeedToPace(this.gradeData.upFlatDownMoveData.down);
        this.insertContentAtGridPosition(0, 4, (this.gradeData.upFlatDownMoveData.up / this.speedUnitsData.speedUnitFactor !== 0) ? Helper.secondsToHHMMSS(this.gradeData.upFlatDownMoveData.up / this.speedUnitsData.speedUnitFactor, true) : '-', 'Avg climbing pace', '/' + this.speedUnitsData.units, 'displayAdvancedGradeData');
        this.insertContentAtGridPosition(1, 4, (this.gradeData.upFlatDownMoveData.flat / this.speedUnitsData.speedUnitFactor !== 0) ? Helper.secondsToHHMMSS(this.gradeData.upFlatDownMoveData.flat / this.speedUnitsData.speedUnitFactor, true) : '-', 'Avg flat pace', '/' + this.speedUnitsData.units, 'displayAdvancedGradeData');
        this.insertContentAtGridPosition(2, 4, (this.gradeData.upFlatDownMoveData.down / this.speedUnitsData.speedUnitFactor !== 0) ? Helper.secondsToHHMMSS(this.gradeData.upFlatDownMoveData.down / this.speedUnitsData.speedUnitFactor, true) : '-', 'Avg downhill pace', '/' + this.speedUnitsData.units, 'displayAdvancedGradeData');
    };
    return RunningGradeDataView;
}(AbstractGradeDataView));
