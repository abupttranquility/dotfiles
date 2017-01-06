var XtdZone = (function () {
    function XtdZone($scope, AvoidInputKeysService) {
        this.$scope = $scope;
        this.AvoidInputKeysService = AvoidInputKeysService;
        $scope.zoneId = parseInt($scope.zoneId);
        $scope.avoidInputKeyEdit = function (evt) {
            AvoidInputKeysService.apply(evt);
        };
        $scope.$watch('xtdZone', function (newZone, oldZone) {
            $scope.$parent.onZoneChange(parseInt($scope.zoneId), oldZone, newZone);
        }, true);
        $scope.removeZone = function ($event) {
            $scope.$parent.removeZone($event, parseInt($scope.zoneId));
        };
    }
    XtdZone.$inject = ['$scope', 'AvoidInputKeysService'];
    return XtdZone;
}());
app.directive('xtdZone', [function () {
        return {
            scope: {
                zoneId: '@zoneId',
                xtdZone: '=',
                xtdDataSelected: "=",
                previousFrom: '@previousFrom',
                nextTo: '@nextTo',
                xtdZoneFirst: '@xtdZoneFirst',
                xtdZoneLast: '@xtdZoneLast'
            },
            controller: XtdZone,
            templateUrl: 'directives/xtdZones/templates/xtdZone.html'
        };
    }]);
