var VirtualPartnerModifier = (function () {
    function VirtualPartnerModifier(activityId) {
        this.activityId = activityId;
    }
    VirtualPartnerModifier.prototype.modify = function () {
        if (!Strava.Labs) {
            return;
        }
        var view = Strava.Labs.Activities.SegmentLeaderboardView;
        if (!view) {
            return;
        }
        var functionRender = view.prototype.render;
        var that = this;
        view.prototype.render = function () {
            var r = functionRender.apply(this, Array.prototype.slice.call(arguments));
            if ($('.stravistix_exportVpu').length < 1) {
                var exportButtonHtml = '<a class="btn-block btn-xs button raceshape-btn stravistix_exportVpu" id="stravistix_exportVpu">Export effort as Virtual Partner</a>';
                $('.raceshape-btn').first().after(exportButtonHtml).each(function () {
                    $('#stravistix_exportVpu').click(function (evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        that.displayRaceShapePopup();
                    });
                    return;
                });
            }
            return r;
        };
    };
    VirtualPartnerModifier.prototype.displayRaceShapePopup = function () {
        var _this = this;
        var effortId = parseInt(window.location.pathname.split('/')[4] || window.location.hash.replace('#', ''));
        var coursesTypesExport = ['CRS', 'TCX', 'GPX'];
        var dlButton = '';
        _.each(coursesTypesExport, function (type) {
            dlButton += '<a class="button btn-block btn-primary" style="margin-bottom: 15px;" href="http://raceshape.com/strava.export.php?effort=' + effortId + '|' + _this.activityId + '&type=' + type + '">';
            dlButton += 'Download effort as .' + type;
            dlButton += '</a>';
        });
        var title = 'Export effort as Virtual Partner';
        var message = 'You are going to download a course file from raceshape.com.<br/><br/>If you are using a garmin device put downloaded file into <strong>NewFiles/*</strong> folder.<br/><br/>' + dlButton;
        $.fancybox('<h3>' + title + '</h3><h4>' + message + '</h4>');
    };
    return VirtualPartnerModifier;
}());
