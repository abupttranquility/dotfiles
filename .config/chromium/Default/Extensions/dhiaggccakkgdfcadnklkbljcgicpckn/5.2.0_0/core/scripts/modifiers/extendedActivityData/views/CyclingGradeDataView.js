var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CyclingGradeDataView = (function (_super) {
    __extends(CyclingGradeDataView, _super);
    function CyclingGradeDataView(gradeData, units) {
        _super.call(this, gradeData, units);
    }
    CyclingGradeDataView.prototype.insertDataIntoGrid = function () {
        _super.prototype.insertDataIntoGrid.call(this);
        var avgClimbingSpeed = (this.gradeData.upFlatDownMoveData.up * this.speedUnitsData.speedUnitFactor);
        var avgFlatSpeed = (this.gradeData.upFlatDownMoveData.flat * this.speedUnitsData.speedUnitFactor);
        var avgDownhillSpeed = (this.gradeData.upFlatDownMoveData.down * this.speedUnitsData.speedUnitFactor);
        this.insertContentAtGridPosition(0, 4, _.isNaN(avgClimbingSpeed) || avgClimbingSpeed.toString() == 'NaN' ? '-' : avgClimbingSpeed.toFixed(1), 'Avg climbing speed', this.speedUnitsData.speedUnitPerHour, 'displayAdvancedGradeData');
        this.insertContentAtGridPosition(1, 4, _.isNaN(avgFlatSpeed) || avgFlatSpeed.toString() == 'NaN' ? '-' : avgFlatSpeed.toFixed(1), 'Avg flat speed', this.speedUnitsData.speedUnitPerHour, 'displayAdvancedGradeData');
        this.insertContentAtGridPosition(2, 4, _.isNaN(avgDownhillSpeed) || avgDownhillSpeed.toString() == 'NaN' ? '-' : avgDownhillSpeed.toFixed(1), 'Avg downhill speed', this.speedUnitsData.speedUnitPerHour, 'displayAdvancedGradeData');
    };
    return CyclingGradeDataView;
}(AbstractGradeDataView));
