window.DI = window.DI || {};
window.DI.analyticsGa4 = window.DI.analyticsGa4 || {};
window.DI.analyticsGa4.trackers = window.DI.analyticsGa4.trackers || {};

(function (trackers) {
  "use strict";

  var PageViewTracker = {
    init: function () {
      var data = {
        event: "page_view_ga4",
        page_view: {
          language: this.getLanguage(),
          location: this.getLocation(),
          organisations: "<OT1056>",
          primary_publishing_organisation:
            "government digital service - digital identity",
          status_code: this.getStatusCode(),
          title: this.getTitle(),
          referrer: this.getReferrer(),
          taxonomy_level1: "document checking application",
          taxonomy_level2: "pre cri",
        },
      };
      window.DI.core.sendData(data);
    },

    getLanguage: function () {
      return (window.DI.cookies.getCookie("lng") ?? "en").toLowerCase();
    },

    getStatusCode: function () {
      return window.DI.httpStatusCode ?? 200;
    },

    getLocation: function () {
      return document.location.href?.toLowerCase();
    },

    getTitle: function () {
      return document.title?.toLowerCase();
    },

    getReferrer: function () {
      return document.referrer?.toLowerCase();
    },
  };

  trackers.PageViewTracker = PageViewTracker;
})(window.DI.analyticsGa4.trackers);
