var expanded = false, $extension, widgetPosition, mouseDown = false, timerBusy = false, previousPostCount, currentPostCount, initialPositionX, initialPositionY, initialPositionLeft, initialPositionTop, maxWidth, maxHeight;

$(function(){
    chrome.storage.sync.get(['positionTop', 'positionRight'], function(items) {
        var positionTop = items.positionTop;
        var positionRight = items.positionRight;

        if (positionTop && positionRight) {
            setPosition(positionTop, positionRight);
        } else {
            positionTop = "0px";
            positionRight = "0px";

            chrome.storage.sync.set({positionTop: positionTop, positionRight: positionRight}, function() {
                setPosition(positionTop, positionRight);
            });
        }

        function setPosition(positionTop, positionRight) {
            widgetPositionTop = positionTop;
            widgetPositionRight = positionRight;

            initialise();
        }
    });

    function resetExtensionHeight() {
        var h = $("#extension4c div").outerHeight();

        $("#extension4c").css("height", h+"px");
    }

    function expandPost($container) {
        var $this = $container.find("a.fileThumb");

        if(!$this.attr("href"))
            return;

        var src = $this.attr("href");

        if(src.substr(src.length - 4) == "webm") {
            // webm
            if($this.parent().find("video").length)
                return;

            $container.css("clear", "both");

            $this.css("display", "none").parent().append('<video controls loop autoplay muted class="expandedWebm" src="'+src+'" style="max-width: 100%; max-height: 800px;"></video>');
            $this.parent().find("div.fileText").append('<span class="collapseWebm">-[<a href="javascript:void()">Close</a>]</span>');

            $this.parent().find("span.collapseWebm a").click(function(){
                $this.css("display", "block").parent().find("video").remove();
                $this.parent().find("div.fileText").find("span.collapseWebm").remove();
            });
        } else {
            // image
            if($this.parent().hasClass("image-expanded"))
                return;

            $this.parent().addClass("image-expanded");

            $this.find("img").css("display", "none").after('<img src="'+src+'" class="expanded-thumb" style="max-width: 100%" />');
        }
    }

    function initialise() {
        // init
        var content = '<div id="extension4c" style="position: fixed; right: '+widgetPositionRight+'; top: '+widgetPositionTop+'; width: 150px; height: 400px; background: rgba(240, 192, 176, 0.7); border-radius: 0 0 0 5px; padding: 10px; z-index: 20000; font-size: 11px; line-height: 16px; text-align: center;">';
        content += '<div>';
        content += '<button id="btnEnlargeAll" style="display: block; width: 100%; padding: 2px;">Enlarge All Images</button>';
        content += '<div id="extension4cText" style="display: none"><div style="clear: both; height: 10px;"></div>';
        content += 'After expanding all images, right-click the page and choose <strong>Save as...</strong> to save all images into a folder.';
        content += '</div>';
        content += '<a href="javascript:void()" id="extensionMove" style="position: absolute; bottom: -12px; left: -12px; display: block; width: 26px; height: 26px; background-color: rgba(240, 192, 176, 0.7); background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTZBQzEyMEE1NDFBMTFFNTlFMDlGRTRCOUEyOEJCNUQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTZBQzEyMEI1NDFBMTFFNTlFMDlGRTRCOUEyOEJCNUQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBNkFDMTIwODU0MUExMUU1OUUwOUZFNEI5QTI4QkI1RCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBNkFDMTIwOTU0MUExMUU1OUUwOUZFNEI5QTI4QkI1RCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv2zTjMAAABoSURBVHjarFJBDsAgDBLSh+4x+9BeqBcvM6FlUy4aIkRo8dxXS9DnCfWAhni9Wwbd5FoIA5yIYIFOziwOf4hfJmG2LfntDmI2rNoueVZjSoB1CvgqPrIHYbYuN5LVF6uIdHJm/QwBBgAADxS6TnLHIwAAAABJRU5ErkJggg==); background-position: center center; background-repeat: no-repeat; border-radius: 100%;"><img src="" border="0" /></a>';
        content += '</div></div>';

        if(document.URL.indexOf("thread") > -1) {
            $("body").append(content);

            resetExtensionHeight();

            previousPostCount = $("div.thread div.postContainer").length;

            $extension = $("#extension4c");
        }
    }

    // events
    $('div.thread').bind("DOMSubtreeModified",function(){
        if(timerBusy || !expanded)
            return;

        currentPostCount = $("div.thread div.postContainer").length;

        if(currentPostCount > previousPostCount) {
            // new post
            timerBusy = true;

            setTimeout(function(){
                // delay 1 sec to be sure
                timerBusy = false;

                $("div.thread div.postContainer").slice(previousPostCount, currentPostCount).each(function(){
                    expandPost($(this));
                });

                previousPostCount = currentPostCount;
            }, 1000);
        }
    });

    // move extension
    $(document).mouseup(function(){
        mouseDown = false;

        $("body").css("user-select", "");

        var positionTop = $extension.css("top");
        var positionRight = $extension.css("right");

        chrome.storage.sync.set({positionTop: positionTop, positionRight: positionRight});
    });

    $("body").off("mousedown", "#extensionMove");
    $("body").on("mousedown", "#extensionMove", function(e){
        mouseDown = true;

        $("body").css("user-select", "none");

        initialPositionX = e.pageX;
        initialPositionY = e.pageY;
        initialPositionRight = parseInt($extension.css("right"));
        initialPositionTop = parseInt($extension.css("top"));

        maxWidth = $(window).width() - $extension.outerWidth();
        maxHeight = $(window).height() - $extension.outerHeight();
    });

    $(document).mousemove(function(e){
        if(mouseDown) {
            var x = Math.round(initialPositionRight + (initialPositionX - e.pageX));
            var y = Math.round(initialPositionTop - (initialPositionY - e.pageY));

            if(x < 0)
                x = 0;

            if(y < 0)
                y = 0;

            if(x > maxWidth)
                x = maxWidth;

            if(y > maxHeight)
                y = maxHeight;

            $extension.css({ "right": x+"px", "top": y+"px" });
        }
    });

    // enlarge
    $("body").on("click", "#btnEnlargeAll", function(){
        if(!expanded) {
            expanded = true;

            $(this).html("Shrink All Images");

            $("#extension4cText").fadeIn(500);

            resetExtensionHeight();

            $("a.fileThumb").each(function(){
                expandPost($(this).closest("div.postContainer"));
            });
        } else {
            expanded = false;

            $(this).html("Expand All Images");

            $("#extension4cText").fadeOut(500, function(){
                resetExtensionHeight();
            });

            $("a.fileThumb").each(function(){
                var $this = $(this);

                var src = $this.attr("href");

                if(src.substr(src.length - 4) == "webm") {
                    // webm
                    $this.closest("div.postContainer").css("clear", "");

                    $this.css("display", "block").parent().find("video").remove();
                    $this.parent().find("div.fileText").find("span.collapseWebm").remove();
                } else {
                    // image
                    if(!$this.parent().hasClass("image-expanded"))
                        return;

                    $this.parent().removeClass("image-expanded");
                    $this.find("img:first").css("display", "block");
                    $this.find("img:last").remove();
                }
            });
        }

        //$this.parent().append('<a href="'+$this.attr("href")+'" target="_blank" style="display: inline-block" download><button style="display: inline; float: left; clear: both; font-size: 11px; cursor: pointer;">Download Image</button></a>');
    });
});
