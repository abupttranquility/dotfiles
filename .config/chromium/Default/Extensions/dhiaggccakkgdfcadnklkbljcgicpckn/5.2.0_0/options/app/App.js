var app = angular.module("App", ['ngRoute', 'ngMaterial', 'ngSanitize', 'ngAnimate', 'nvd3', 'md.data.table', 'angularMoment']);
var $colors = {
    strava: '#e94e1b',
    ctl: '#e94e1b',
    atl: '#5f5f5f',
    tsb: '#a7a7a7',
    lightGrey: '#eeeeee',
    midGrey: '#4e4e4e',
    strongGrey: '#2f2f2f'
};
app.constant('$colors', $colors);
app.config(function ($mdThemingProvider, $colors) {
    var stravaOrange = $mdThemingProvider.extendPalette('orange', {
        '500': $colors.strava,
        'contrastDefaultColor': 'light'
    });
    $mdThemingProvider.definePalette('stravaOrange', stravaOrange);
    $mdThemingProvider.theme('default').primaryPalette('stravaOrange');
});
app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(routeMap.commonSettingsRoute, {
            templateUrl: 'views/commonSettings.html',
            controller: 'CommonSettingsController'
        });
        $routeProvider.when(routeMap.athleteSettingsRoute, {
            templateUrl: 'views/athleteSettings.html',
            controller: 'AthleteSettingsController'
        });
        $routeProvider.when(routeMap.hrrZonesSettingsRoute, {
            templateUrl: 'views/hrrZonesSettings.html',
            controller: 'HrrZonesSettingsController'
        });
        $routeProvider.when(routeMap.zonesSettingsRoute + '/:zoneValue', {
            templateUrl: 'views/XtdZonesSettingsController.html',
            controller: 'XtdZonesSettingsController'
        });
        $routeProvider.when(routeMap.fitnessTrendRoute, {
            templateUrl: 'views/fitnessTrend.html',
            controller: 'FitnessTrendController'
        });
        $routeProvider.otherwise({
            redirectTo: routeMap.commonSettingsRoute
        });
    }]);
