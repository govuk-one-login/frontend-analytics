/* global window document ga */

window.DI = window.DI || {};
window.DI.analyticsUa = window.DI.analyticsUa || {};

(function (analytics) {
  "use strict";

  function initGtm() {
    var sendData = window.DI.core.sendData;

    sendData({
      "gtm.allowlist": ["google"],
      "gtm.blocklist": ["adm", "awct", "sp", "gclidw", "gcs", "opt"],
    });

    var gaDataElement = document.getElementById("gaData");

    var sessionJourney = getJourneyMapping(window.location.pathname);
    var criJourney = criDataLayer(
      gaDataElement ? gaDataElement.value : "undefined",
    );

    if (sessionJourney) {
      sendData(sessionJourney);
    }

    if (criJourney) {
      sendData(criJourney);
    }

    sendData({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  }

  function initLinkerHandlers() {
    var submitButton = document.querySelector('button[type="submit"]');
    var pageForm = document.getElementById("form-tracking");

    if (submitButton && pageForm) {
      submitButton.addEventListener("click", function () {
        if (window.ga && window.gaplugins) {
          var tracker = ga.getAll()[0];
          var linker = new window.gaplugins.Linker(tracker);
          var destinationLink = linker.decorate(pageForm.action);
          pageForm.action = destinationLink;
        }
      });
    }

    var trackLink = document.getElementById("track-link");

    if (trackLink) {
      trackLink.addEventListener("click", function (e) {
        e.preventDefault();

        if (window.ga && window.gaplugins) {
          var tracker = ga.getAll()[0];
          var linker = new window.gaplugins.Linker(tracker);
          var destinationLink = linker.decorate(trackLink.href);
          window.location.href = destinationLink;
        } else {
          window.location.href = trackLink.href;
        }
      });
    }
  }

  function generateSessionJourney(journey, status) {
    return {
      sessionjourney: {
        journey: journey,
        status: status,
      },
    };
  }

  function criDataLayer(criJourney) {
    // cri_journey is the only field to change at the moment
    // it is based off the docType cookie bound to a hidden element on specific pages, and so if that element isn't there, it will be 'undefined'. If it is there, the values will be boolean as a string
    return {
      event: "page_view",
      page: {
        cri_type: "document checking online",
        cri_journey: criJourney !== undefined ? criJourney : "undefined",
        organisations: "DI",
      },
    };
  }

  function getJourneyMapping(url) {
    var JOURNEY_DATA_LAYER_PATHS = {
      "/authorize": generateSessionJourney("authorize", "start"),
      "/callback": generateSessionJourney("authorize", "end"),
      "/finishBiometricCheck": generateSessionJourney("authorize", "end"),
      "/flashingWarning": generateSessionJourney("authorize", "middle"),
      "/validDrivingLicence": generateSessionJourney("authorize", "middle"),
      "/workingCamera": generateSessionJourney("authorize", "middle"),
      "/readyCheck": generateSessionJourney("authorize", "middle"),
      "/downloadApp": generateSessionJourney("authorize", "middle"),
      "/abort": generateSessionJourney("authorize", "end"),
      "/simpleDevice": generateSessionJourney("authorize", "end"),
    };

    return JOURNEY_DATA_LAYER_PATHS[url];
  }

  var init = function () {
    var consentGiven = window.DI.cookies.hasConsentForAnalytics();

    if (consentGiven) {
      window.DI.core.load(window.DI.analytics.vars.uaContainerId);
      initGtm();
      initLinkerHandlers();
    } else {
      window.addEventListener("cookie-consent", window.DI.analyticsUa.init);
    }
  };

  analytics.init = init;
})(window.DI.analyticsUa);
