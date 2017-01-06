var FitnessTrendTable = (function () {
    function FitnessTrendTable($scope, fitnessDataService, $window) {
        this.$scope = $scope;
        this.fitnessDataService = fitnessDataService;
        this.$window = $window;
        $scope.const = {};
        $scope.const.fitnessDataForTable = null;
        fitnessDataService.getFitnessData().then(function (fitnessData) {
            var fitnessDataForTable = [];
            fitnessData = _.where(fitnessData, {
                previewDay: false
            });
            _.each(fitnessData, function (fitnessObj) {
                var newFitnessObj = _.clone(fitnessObj);
                if (newFitnessObj.activitiesName.length) {
                    var finalActivityName_1 = '';
                    _.each(newFitnessObj.activitiesName, function (name, index) {
                        if (index !== 0) {
                            finalActivityName_1 += ' <strong>+</strong> ';
                        }
                        finalActivityName_1 += name;
                    });
                    var finalTypeName_1 = '';
                    _.each(newFitnessObj.type, function (type, index) {
                        if (index > 0) {
                            finalTypeName_1 += ' <strong>+</strong> ';
                        }
                        finalTypeName_1 += type;
                    });
                    newFitnessObj.activitiesNameStr = finalActivityName_1;
                    newFitnessObj.type = [finalTypeName_1];
                }
                else {
                    newFitnessObj.activitiesNameStr = '-';
                    newFitnessObj.type = ['-'];
                    newFitnessObj.trimp = -1;
                }
                fitnessDataForTable.push(newFitnessObj);
            });
            $scope.const.fitnessDataForTable = fitnessDataForTable;
            $scope.refreshFitnessDataForTable();
        });
        $scope.limitOptions = [5, 10, 15, 25, 50, 100];
        $scope.options = {
            rowSelection: false,
            multiSelect: false,
            autoSelect: true,
            decapitate: false,
            largeEditDialog: false,
            boundaryLinks: true,
            limitSelect: true,
            pageSelect: true
        };
        $scope.query = {
            filter: '',
            order: '-timestamp',
            limit: 10,
            page: 1
        };
        $scope.filter = {
            options: {
                debounce: 500
            }
        };
        $scope.$watch('query.filter', function (newValue, oldValue) {
            if (!oldValue) {
                $scope.bookmarkPage = $scope.query.page;
            }
            if (newValue !== oldValue) {
                $scope.query.page = 1;
            }
            if (!newValue) {
                $scope.query.page = $scope.bookmarkPage;
            }
            $scope.refreshFitnessDataForTable();
        });
        $scope.removeFilter = function () {
            $scope.filter.show = false;
            $scope.query.filter = '';
        };
        $scope.refreshFitnessDataForTable = function () {
            var filter = $scope.query.filter;
            filter = filter.replace(' ', '.*');
            filter = filter.trim();
            $scope.fitnessDataForTableFiltered = _.filter($scope.const.fitnessDataForTable, function (item) {
                return (item.activitiesName + item.type).match(new RegExp(filter, 'ig'));
            });
        };
        $scope.openActivities = function (fitnessObject) {
            _.each(fitnessObject.ids, function (activityId) {
                $window.open('https://www.strava.com/activities/' + activityId, '_blank');
            });
        };
        $scope.logPagination = function (page, pageCount) {
        };
    }
    FitnessTrendTable.$inject = ['$scope', 'FitnessDataService', '$window'];
    return FitnessTrendTable;
}());
app.directive('fitnessTrendTable', [function () {
        return {
            templateUrl: 'directives/fitnessTrend/templates/fitnessTrendTable.html',
            controller: FitnessTrendTable
        };
    }]);
