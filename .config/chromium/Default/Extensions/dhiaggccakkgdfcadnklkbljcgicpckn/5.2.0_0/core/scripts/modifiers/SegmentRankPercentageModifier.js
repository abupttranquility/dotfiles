var SegmentRankPercentageModifier = (function () {
    function SegmentRankPercentageModifier() {
    }
    SegmentRankPercentageModifier.prototype.modify = function () {
        var _this = this;
        this.intervalId = setInterval(function () { return _this.addPercentageRanking(); }, 750);
    };
    SegmentRankPercentageModifier.prototype.addPercentageRanking = function () {
        console.debug('Adding Percentage Ranking');
        var standing = $('.leaders').find("table").find(".standing");
        var ranking = standing.children().last().text().trim().replace("\n", "").replace(/ /g, '').split('/');
        var percentage;
        if (_.isNaN(parseInt(ranking[0]))) {
            percentage = '-';
        }
        else {
            percentage = (parseInt(ranking[0]) / parseInt(ranking[1]) * 100).toFixed(2) + '%';
        }
        standing.after('<td class="percentageRanking"><h3>Rank %</h3><strong>' + percentage + '</strong></td>');
        if ($('.percentageRanking').length) {
            clearInterval(this.intervalId);
        }
    };
    return SegmentRankPercentageModifier;
}());
