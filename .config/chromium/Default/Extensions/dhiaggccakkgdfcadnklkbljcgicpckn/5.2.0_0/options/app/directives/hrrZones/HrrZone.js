var HrrZone = (function () {
    function HrrZone($scope, AvoidInputKeysService) {
        this.$scope = $scope;
        this.AvoidInputKeysService = AvoidInputKeysService;
        $scope.avoidInputKeyEdit = function (evt) {
            AvoidInputKeysService.apply(evt);
        };
        $scope.$watch('hrrZone', function (newHrZone, oldHrZone) {
            $scope.$parent.onZoneChange(parseInt($scope.hrrZoneId), oldHrZone, newHrZone);
        }, true);
        $scope.removeZone = function ($event) {
            $scope.$parent.removeHrZone($event, parseInt($scope.hrrZoneId));
        };
    }
    HrrZone.$inject = ['$scope', 'AvoidInputKeysService'];
    return HrrZone;
}());
app.directive('hrrZone', [function () {
        return {
            scope: {
                hrrZoneId: '@hrrZoneId',
                hrrZone: '=',
                previousFromHrr: '@previousFromHrr',
                nextToHrr: '@nextToHrr',
                hrrZoneFirst: '@hrrZoneFirst',
                hrrZoneLast: '@hrrZoneLast',
                userMaxHr: '@userMaxHr',
                userRestHr: '@userRestHr',
                step: '@zoneStep'
            },
            controller: HrrZone,
            templateUrl: 'directives/hrrZones/templates/hrrZone.html'
        };
    }]);
