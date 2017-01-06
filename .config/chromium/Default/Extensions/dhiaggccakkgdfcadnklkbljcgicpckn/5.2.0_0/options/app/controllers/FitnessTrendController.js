var FitnessTrendController = (function () {
    function FitnessTrendController($rootScope, $scope) {
        $scope.enableFitnessTabs = false;
        $scope.loadFitnessTrendTable = false;
        $scope.hasFitnessData = true;
        $scope.fitnessTrendGraphDataLoaded = function (hasFitnessData) {
            $scope.hasFitnessData = hasFitnessData;
            $scope.loadFitnessTrendTable = true;
        };
        if ($rootScope.lastSyncDate !== -1) {
            $scope.enableFitnessTabs = true;
        }
    }
    FitnessTrendController.$inject = ['$rootScope', '$scope', 'ChromeStorageService'];
    return FitnessTrendController;
}());
app.controller("FitnessTrendController", FitnessTrendController);
