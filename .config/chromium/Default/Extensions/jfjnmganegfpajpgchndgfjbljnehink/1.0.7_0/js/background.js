define(["require","exports","utils/facebook-utils","utils/analytics"],function(a,b,c,d){"use strict";var e=function(){function a(){}return a.run=function(){d.init("/background.html"),chrome.runtime.onMessage.addListener(function(a,b,e){switch(a.cmd){case"getCurrentUser":return c.getUserIdFromCookie(function(a){e(a)}),!0;case"newTab":chrome.tabs.create(a.data);break;case"logEvent":d.logEventData(a.data)}})},a}();return e});