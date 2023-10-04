window.DI = window.DI || {};

(function (DI) {
  "use strict";

  var cookies = {
    hasConsentForAnalytics: function () {
      var COOKIES_PREFERENCES_SET = "cookies_preferences_set";
      var cookieConsent = JSON.parse(
        decodeURIComponent(this.getCookie(COOKIES_PREFERENCES_SET)),
      );
      return cookieConsent ? cookieConsent.analytics === true : false;
    },

    getCookie: function (name) {
      var nameEQ = name + "=";
      if (document.cookie) {
        var cookies = document.cookie.split(";");
        for (var i = 0, len = cookies.length; i < len; i++) {
          var cookie = cookies[i];
          while (cookie.charAt(0) === " ") {
            cookie = cookie.substring(1, cookie.length);
          }
          if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length);
          }
        }
      }
      return null;
    },

    setCookie: function (name, values, options, domain) {
      if (typeof options === "undefined") {
        options = {};
      }

      var cookieString =
        name + "=" + encodeURIComponent(JSON.stringify(values));
      if (options.days) {
        var date = new Date();
        date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000);
        cookieString =
          cookieString +
          "; Expires=" +
          date.toUTCString() +
          "; Path=/; Domain=" +
          domain;
      }

      if (document.location.protocol === "https:") {
        cookieString = cookieString + "; Secure";
      }

      document.cookie = cookieString;
    },
  };

  DI.cookies = cookies;
})(window.DI);
