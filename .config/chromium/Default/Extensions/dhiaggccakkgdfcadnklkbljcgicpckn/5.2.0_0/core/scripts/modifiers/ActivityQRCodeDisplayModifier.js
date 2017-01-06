var ActivityQRCodeDisplayModifier = (function () {
    function ActivityQRCodeDisplayModifier(appResources, activityId) {
        this.appResources = appResources;
        this.activityId = activityId;
    }
    ActivityQRCodeDisplayModifier.prototype.modify = function () {
        var _this = this;
        var html = '<a href="javascript:;" id="activityFlashCodebutton" class="button" title="Flash code for your mobile app"><img src="' + this.appResources.qrCodeIcon + '"/></a>';
        $('.collapse.button').first().before(html).each(function () {
            $('#activityFlashCodebutton').click(function () {
                $.fancybox('<div align="center"><h2>#stravistix Activity Flash code</h2><h3>Scan from smartphone to get activity on Strava mobile app.</h3><p><div style="padding: 0px 60px 0px 60px;" id="qrcode"></div></p><h3>Save by right click on image then "Save image as..."</h3></div>');
                var qrcode = new QRCode("qrcode", {
                    text: "http://app.strava.com/activities/" + _this.activityId,
                    width: 384,
                    height: 384,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            });
        });
    };
    return ActivityQRCodeDisplayModifier;
}());
