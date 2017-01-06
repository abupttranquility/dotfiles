var ReliveCCModifier = (function () {
    function ReliveCCModifier(activityId) {
        this.activityId = activityId;
    }
    ReliveCCModifier.prototype.modify = function () {
        var _this = this;
        var html = "<li class='group'>";
        html += "<div class='title' style='font-size: 14px; cursor: pointer;' id='stravistix_relivecc'>Relive Ride <sup style='color:#FC4C02; font-size:10px;'>NEW</sup></div>";
        $("#pagenav").append($(html)).each(function () {
            $('#stravistix_relivecc').click(function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                var url = 'https://www.relive.cc/view/' + _this.activityId;
                var embedUrl = url + '/embed';
                var windowWidth = window.innerWidth * 0.50;
                $.fancybox({
                    fitToView: true,
                    autoSize: true,
                    closeClick: false,
                    openEffect: 'none',
                    closeEffect: 'none',
                    scrolling: 'no',
                    'type': 'iframe',
                    'content': '<div style="text-align:center;"><a href="' + url + '" target="_blank">View in relive.cc website</a></div><iframe src="' + embedUrl + '" width="' + windowWidth + '" height="' + windowWidth * 9 / 16 + '" frameborder="0"></iframe>'
                });
            });
        });
    };
    return ReliveCCModifier;
}());
