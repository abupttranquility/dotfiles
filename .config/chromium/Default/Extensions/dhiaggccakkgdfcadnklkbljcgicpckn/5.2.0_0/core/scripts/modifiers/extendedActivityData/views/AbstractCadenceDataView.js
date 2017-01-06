var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractCadenceDataView = (function (_super) {
    __extends(AbstractCadenceDataView, _super);
    function AbstractCadenceDataView(cadenceData, units) {
        _super.call(this, units);
        this.cadenceData = cadenceData;
        this.mainColor = [213, 0, 195];
        this.setGraphTitleFromUnits();
        this.setupDistributionGraph(this.cadenceData.cadenceZones);
        this.setupDistributionTable(this.cadenceData.cadenceZones);
    }
    return AbstractCadenceDataView;
}(AbstractDataView));
