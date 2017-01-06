var Content = (function () {
    function Content(jsDependencies, cssDependencies, userSettings, appResources) {
        this.jsDependencies = jsDependencies;
        this.cssDependencies = cssDependencies;
        this.userSettings = userSettings;
        this.appResources = appResources;
    }
    Content.prototype.loadDependencies = function (finishLoading) {
        var dependencies = _.union(this.jsDependencies, this.cssDependencies);
        Content.loader.require(dependencies, function () {
            finishLoading();
        });
    };
    Content.prototype.isExtensionRunnableInThisContext = function () {
        var isRunnable = true;
        if (window.location.pathname.match(/^\/routes\/new/) ||
            window.location.pathname.match(/^\/routes\/(\d+)\/edit$/) ||
            window.location.pathname.match(/^\/about/) ||
            window.location.pathname.match(/^\/running-app/) ||
            window.location.pathname.match(/^\/features/) ||
            window.location.pathname.match(/^\/store/) ||
            window.location.pathname.match(/^\/how-it-works/)) {
            isRunnable = false;
        }
        if (document.getElementsByClassName('btn-login').length > 0) {
            isRunnable = false;
        }
        return isRunnable;
    };
    Content.prototype.start = function () {
        var _this = this;
        if (!this.isExtensionRunnableInThisContext()) {
            console.log("Skipping StravistiX chrome extension execution in this page");
            return;
        }
        this.loadDependencies(function () {
            chrome.storage.sync.get(_this.userSettings, function (chromeSettings) {
                var node = (document.head || document.documentElement);
                var injectedScript = document.createElement('script');
                injectedScript.src = chrome.extension.getURL('core/scripts/StravistiX.js');
                injectedScript.onload = function () {
                    injectedScript.remove();
                    var inner = document.createElement('script');
                    if (_.isEmpty(chromeSettings)) {
                        chromeSettings = _this.userSettings;
                    }
                    inner.textContent = 'var $ = jQuery;';
                    inner.textContent += 'var stravistiX = new StravistiX(' + JSON.stringify(chromeSettings) + ', ' + JSON.stringify(_this.appResources) + ');';
                    inner.onload = function () {
                        inner.remove();
                    };
                    node.appendChild(inner);
                };
                node.appendChild(injectedScript);
            });
        });
    };
    Content.loader = new Loader();
    return Content;
}());
var appResources = {
    settingsLink: chrome.extension.getURL('/options/app/index.html'),
    logoStravistix: chrome.extension.getURL('/core/icons/logo_stravistix_no_circle.svg'),
    menuIconBlack: chrome.extension.getURL('/core/icons/ic_menu_24px_black.svg'),
    menuIconOrange: chrome.extension.getURL('/core/icons/ic_menu_24px_orange.svg'),
    remoteViewIcon: chrome.extension.getURL('/core/icons/ic_open_in_new_24px.svg'),
    pollIcon: chrome.extension.getURL('/core/icons/ic_poll_24px.svg'),
    helpIcon: chrome.extension.getURL('/core/icons/ic_help_black_24px.svg'),
    veloviewerIcon: chrome.extension.getURL('/core/icons/veloviewer.ico'),
    raceshapeIcon: chrome.extension.getURL('/core/icons/raceshape.ico'),
    veloviewerDashboardIcon: chrome.extension.getURL('/core/icons/ic_dashboard_24px.svg'),
    veloviewerChallengesIcon: chrome.extension.getURL('/core/icons/ic_landscape_24px.svg'),
    labIcon: chrome.extension.getURL('/core/icons/lab.png'),
    settingsIcon: chrome.extension.getURL('/core/icons/ic_settings_24px.svg'),
    heartIcon: chrome.extension.getURL('/core/icons/ic_favorite_24px.svg'),
    zonesIcon: chrome.extension.getURL('/core/icons/ic_format_line_spacing_24px.svg'),
    komMapIcon: chrome.extension.getURL('/core/icons/ic_looks_one_24px.svg'),
    heatmapIcon: chrome.extension.getURL('/core/icons/ic_whatshot_24px.svg'),
    bugIcon: chrome.extension.getURL('/core/icons/ic_bug_report_24px.svg'),
    rateIcon: chrome.extension.getURL('/core/icons/ic_star_24px.svg'),
    aboutIcon: chrome.extension.getURL('/core/icons/ic_info_outline_24px.svg'),
    eyeIcon: chrome.extension.getURL('/core/icons/ic_remove_red_eye_24px.svg'),
    bikeIcon: chrome.extension.getURL('/core/icons/ic_directions_bike_24px.svg'),
    mapIcon: chrome.extension.getURL('/core/icons/ic_map_24px.svg'),
    wheatherIcon: chrome.extension.getURL('/core/icons/ic_wb_sunny_24px.svg'),
    twitterIcon: chrome.extension.getURL('/core/icons/twitter.svg'),
    systemUpdatesIcon: chrome.extension.getURL('/core/icons/ic_system_update_24px.svg'),
    fitnessCenterIcon: chrome.extension.getURL('/core/icons/ic_fitness_center_black_24px.svg'),
    timelineIcon: chrome.extension.getURL('/core/icons/ic_timeline_black_24px.svg'),
    athleteIcon: chrome.extension.getURL('/core/icons/ic_accessibility_black_24px.svg'),
    donateIcon: chrome.extension.getURL('/core/icons/ic_attach_money_24px.svg'),
    shareIcon: chrome.extension.getURL('/core/icons/ic_share_24px.svg'),
    trackChangesIcon: chrome.extension.getURL('/core/icons/ic_track_changes_24px.svg'),
    trendingUpIcon: chrome.extension.getURL('/core/icons/ic_trending_up_black_24px.svg'),
    qrCodeIcon: chrome.extension.getURL('/core/icons/qrcode.svg'),
    lightbulbIcon: chrome.extension.getURL('/core/icons/fa-lightbulb-o.png'),
    heartBeatIcon: chrome.extension.getURL('/core/icons/fa-heartbeat.png'),
    areaChartIcon: chrome.extension.getURL('/core/icons/fa-area-chart.png'),
    tachometerIcon: chrome.extension.getURL('/core/icons/fa-tachometer.png'),
    boltIcon: chrome.extension.getURL('/core/icons/fa-bolt.png'),
    loadingIcon: chrome.extension.getURL('/core/icons/loading.gif'),
    circleNotchIcon: chrome.extension.getURL('/core/icons/fa-circle-o-notch.png'),
    lineChartIcon: chrome.extension.getURL('/core/icons/fa-line-chart.png'),
    logArrowUpIcon: chrome.extension.getURL('/core/icons/fa-long-arrow-up.png'),
    cogIcon: chrome.extension.getURL('/core/icons/fa-cog.png'),
    extVersion: chrome.runtime.getManifest().version,
    extVersionName: chrome.runtime.getManifest().version_name,
    extensionId: chrome.runtime.id,
};
var jsDependencies = [
    'core/config/env.js',
    'node_modules/q/q.js',
    'node_modules/chart.js/dist/Chart.bundle.js',
    'node_modules/fancybox/dist/js/jquery.fancybox.pack.js',
    'node_modules/qrcode-js-package/qrcode.min.js',
    'node_modules/geodesy/dms.js',
    'node_modules/geodesy/latlon-spherical.js',
    'core/modules/StorageManager.js',
    'core/modules/jquery.appear.js',
    'core/scripts/synchronizer/ActivitiesSynchronizer.js',
    'core/scripts/processors/VacuumProcessor.js',
    'core/scripts/processors/ActivityProcessor.js',
    'core/scripts/processors/ActivitiesProcessor.js',
    'core/scripts/processors/BikeOdoProcessor.js',
    'core/scripts/processors/SegmentProcessor.js',
    'core/scripts/Helper.js',
    'core/scripts/Follow.js',
    'core/scripts/modifiers/ActivityScrollingModifier.js',
    'core/scripts/modifiers/RemoteLinksModifier.js',
    'core/scripts/modifiers/WindyTyModifier.js',
    'core/scripts/modifiers/ReliveCCModifier.js',
    'core/scripts/modifiers/DefaultLeaderBoardFilterModifier.js',
    'core/scripts/modifiers/MenuModifier.js',
    'core/scripts/modifiers/SegmentRankPercentageModifier.js',
    'core/scripts/modifiers/SegmentRecentEffortsHRATimeModifier.js',
    'core/scripts/modifiers/VirtualPartnerModifier.js',
    'core/scripts/modifiers/ActivityStravaMapTypeModifier.js',
    'core/scripts/modifiers/HidePremiumModifier.js',
    'core/scripts/modifiers/AthleteStatsModifier.js',
    'core/scripts/modifiers/ActivitiesSummaryModifier.js',
    'core/scripts/modifiers/ActivitySegmentTimeComparisonModifier.js',
    'core/scripts/modifiers/ActivityBestSplitsModifier.js',
    'core/scripts/modifiers/GoalsModifier.js',
    'core/scripts/modifiers/ActivitiesSyncModifier.js',
    'core/scripts/modifiers/extendedActivityData/views/AbstractDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/FeaturedDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/SpeedDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/PaceDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/HeartRateDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/AbstractCadenceDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/CyclingCadenceDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/RunningCadenceDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/PowerDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/ElevationDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/AscentSpeedDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/AbstractGradeDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/CyclingGradeDataView.js',
    'core/scripts/modifiers/extendedActivityData/views/RunningGradeDataView.js',
    'core/scripts/modifiers/extendedActivityData/AbstractExtendedDataModifier.js',
    'core/scripts/modifiers/extendedActivityData/CyclingExtendedDataModifier.js',
    'core/scripts/modifiers/extendedActivityData/RunningExtendedDataModifier.js',
    'core/scripts/modifiers/extendedActivityData/GenericExtendedDataModifier.js',
    'core/scripts/modifiers/HideFeedModifier.js',
    'core/scripts/modifiers/DisplayFlyByFeedModifier.js',
    'core/scripts/modifiers/ActivityBikeOdoModifier.js',
    'core/scripts/modifiers/ActivityQRCodeDisplayModifier.js',
    'core/scripts/modifiers/RunningDataModifier.js',
    'core/scripts/modifiers/NearbySegmentsModifier.js',
    'core/scripts/modifiers/GoogleMapsModifier.js',
    'core/scripts/processors/ActivityComputer.js',
    'core/scripts/processors/workers/ComputeAnalysisWorker.js',
    'core/scripts/ReleaseNotes.js'
];
var cssDependencies = [
    'node_modules/fancybox/dist/css/jquery.fancybox.css',
    'core/css/core.css'
];
var content = new Content(jsDependencies, cssDependencies, userSettings, appResources);
content.start();
var constantsStr = 'var Constants = ' + JSON.stringify(Constants) + ';';
Content.loader.injectJS(constantsStr);
