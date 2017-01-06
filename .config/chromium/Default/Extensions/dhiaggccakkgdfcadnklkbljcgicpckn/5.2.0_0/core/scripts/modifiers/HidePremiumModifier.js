var HidePremiumModifier = (function () {
    function HidePremiumModifier() {
    }
    HidePremiumModifier.prototype.modify = function () {
        if (!_.isUndefined(window.pageView)) {
            if (window.pageView.activityAthlete() && !window.pageView.activityAthlete().get('premium')) {
                $("#premium-views").hide();
            }
        }
        $(".premium").hide();
        this.hideElementWithInterval("p:contains('remium')");
        this.hideElementWithInterval("a[href*='premium']");
        $('#performance-goals').hide();
        this.hideElementWithInterval(".upsell-others");
        this.hideElementWithInterval("li[id*='premium']", '#premium-views');
        this.hideElementWithInterval(".button.compact.set-goal");
        $("div[id='upgrade-account-container']").children().first().hide();
        $('.js-channel-dashboard-right-top.section').hide();
        this.hideElementWithInterval('.btn-xs.button.set-goal', null, 750);
        this.hideElementWithInterval('.btn-block.btn-xs.button.training-plans-btn', null, 750);
        $('.upsell-sm').hide();
        var element = $("a[href='/settings/performance']");
        if (element.length > 0) {
            element.hide();
        }
    };
    HidePremiumModifier.prototype.hideElementWithInterval = function (selector, notSelector, time) {
        setInterval(function () {
            if (notSelector) {
                $(selector).not(notSelector).hide();
            }
            else {
                $(selector).hide();
            }
        }, (time) ? time : 750);
    };
    return HidePremiumModifier;
}());
