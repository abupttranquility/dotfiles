var RemoteLinksModifier = (function () {
    function RemoteLinksModifier(appResources, authorOfActivity, activityId) {
        this.appResources = appResources;
        this.authorOfActivity = authorOfActivity;
        this.activityId = activityId;
    }
    RemoteLinksModifier.prototype.modify = function () {
        if (!_.isUndefined(window.pageView)) {
            this.modifyActivityPage();
        }
        if (!_.isNull(window.location.pathname.match(/^\/segments\/(\d+)$/))) {
            this.modifySegmentPage();
        }
    };
    RemoteLinksModifier.prototype.modifyActivityPage = function () {
        var _this = this;
        var remoteViewActivityLinksArray = [
            ["VeloViewer", 'http://veloviewer.com/activities/', '?referrer=stravistiX', ''],
            ["Surface", 'http://strava-tools.raceshape.com/erea/?url=', '', '']
        ];
        var html = "<li class='group'>";
        html += "<div class='title' id='stravistix_remote_title' style='font-size: 14px; cursor: pointer;'>Remote Views</div>";
        html += "<ul style='display: none;' id='stravistix_remoteViews'>";
        _.each(remoteViewActivityLinksArray, function (linkArray) {
            html += "<li>";
            html += "<a data-menu='' " + linkArray[3] + " target='_blank' style='color: #333;' href='" + linkArray[1] + _this.activityId + linkArray[2] + "'>" + linkArray[0] + "</a>";
        });
        html += "</ul>";
        html += "</li>";
        $("#pagenav").append($(html)).each(function () {
            $('[data-remote-views]').click(function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
            });
            $('#stravistix_remote_title').click(function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if ($('#stravistix_remoteViews').is(':visible')) {
                    $('#stravistix_remoteViews').slideUp();
                }
                else {
                    $('#stravistix_remoteViews').slideDown();
                }
            });
        });
        if (this.authorOfActivity) {
            var htmlForTCXExport = "<li><a href='" + window.location.pathname + "/export_tcx'>Export TCX</a></li>";
            $(".actions-menu .slide-menu .options").append(htmlForTCXExport);
        }
    };
    RemoteLinksModifier.prototype.modifySegmentPage = function () {
        var segmentData = window.location.pathname.match(/^\/segments\/(\d+)$/);
        if (_.isNull(segmentData)) {
            return;
        }
        var segmentId = parseInt(segmentData[1]);
        var remoteViewSegmentLinksArray = [
            ["<img width='24px' style='vertical-align:middle' src='" + this.appResources.veloviewerIcon + "'/> <span>VeloViewer</span>", 'http://veloviewer.com/segment/', '?referrer=stravistiX'],
            ["<img width='24px' style='vertical-align:middle' src='" + this.appResources.pollIcon + "'/> <span>Segment details (Jonathan Okeeffe)</span>", 'http://www.jonathanokeeffe.com/strava/segmentDetails.php?segmentId=', '']
        ];
        var html = "<div class='dropdown' style='padding-bottom: 10px;'>";
        html += "<div class='drop-down-menu' style='width: 100%;' >";
        html += "<button class='btn btn-default dropdown-toggle'><img style='vertical-align:middle' src='" + this.appResources.remoteViewIcon + "'/> <span>Remote Segment View</span> <span class='app-icon-wrapper '><span class='app-icon icon-strong-caret-down icon-dark icon-xs'></span></span></button>";
        html += "<ul class='options' style='z-index: 999;'>";
        _.each(remoteViewSegmentLinksArray, function (linkArray) {
            html += "<li><a target='_blank' href='" + linkArray[1] + segmentId + linkArray[2] + "'>" + linkArray[0] + "</a></li>";
        });
        html += "</ul>";
        html += "</div>";
        html += "</div>";
        $(html).prependTo('.segment-activity-my-efforts');
    };
    return RemoteLinksModifier;
}());
