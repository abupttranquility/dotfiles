var Loader = (function () {
    function Loader() {
    }
    Loader.prototype.require = function (scripts, loadingFinished) {
        this.loadCount = 0;
        this.totalRequired = scripts.length;
        this.loadingFinished = loadingFinished;
        for (var i = 0; i < scripts.length; i++) {
            this.writeScript(chrome.extension.getURL(scripts[i]));
        }
    };
    Loader.prototype.loaded = function () {
        this.loadCount++;
        if (this.loadCount == this.totalRequired && typeof this.loadingFinished === 'function')
            this.loadingFinished();
    };
    Loader.prototype.writeScript = function (src) {
        var _this = this;
        var ext = src.substr(src.lastIndexOf('.') + 1);
        var head = document.getElementsByTagName('head')[0];
        if (ext === 'js') {
            var s = document.createElement('script');
            s.type = "text/javascript";
            s.async = false;
            s.src = src;
            s.addEventListener('load', function () {
                _this.loaded();
            }, false);
            head.appendChild(s);
        }
        else if (ext === 'css') {
            var link = document.createElement('link');
            link.href = src;
            link.addEventListener('load', function () {
                _this.loaded();
            }, false);
            link.type = 'text/css';
            link.rel = 'stylesheet';
            head.appendChild(link);
        }
    };
    Loader.prototype.injectJS = function (codeString) {
        var inner = document.createElement('script');
        inner.textContent = codeString;
        inner.onload = function () {
            inner.remove();
        };
        (document.head || document.documentElement).appendChild(inner);
    };
    return Loader;
}());
