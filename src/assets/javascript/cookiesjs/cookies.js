/* global document window dataLayer ga */

"use strict";

var cookies = function (trackingId, analyticsCookieDomain) {
  var COOKIES_PREFERENCES_SET = "cookies_preferences_set";
  var cookiesAccepted = document.querySelector("#cookies-accepted");
  var cookiesRejected = document.querySelector("#cookies-rejected");
  var hideCookieBanner = document.querySelectorAll(".cookie-hide-button");
  var cookieBannerContainer = document.querySelector(".govuk-cookie-banner");
  var cookieBanner = document.querySelector("#cookies-banner-main");
  var acceptCookies = document.querySelector('button[name="cookiesAccept"]');
  var rejectCookies = document.querySelector('button[name="cookiesReject"]');

  function cookieBannerInit() {
    acceptCookies.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        setBannerCookieConsent(true);
      }.bind(this),
    );

    rejectCookies.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        setBannerCookieConsent(false);
      }.bind(this),
    );

    var hideButtons = Array.prototype.slice.call(hideCookieBanner);
    hideButtons.forEach(function (element) {
      element.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          hideElement(cookieBannerContainer);
        }.bind(this),
      );
    });

    var hasCookiesPolicy = getCookie(COOKIES_PREFERENCES_SET);
    if (!hasCookiesPolicy) {
      showElement(cookieBannerContainer);
    }
  }

  function setBannerCookieConsent(analyticsConsent) {
    setCookie(
      COOKIES_PREFERENCES_SET,
      { analytics: analyticsConsent },
      { days: 365 },
    );

    hideElement(cookieBanner);

    if (analyticsConsent) {
      showElement(cookiesAccepted);
      initAnalytics();
    } else {
      showElement(cookiesRejected);
    }
  }

  function hasConsentForAnalytics() {
    var cookieConsent = JSON.parse(
      decodeURIComponent(getCookie(COOKIES_PREFERENCES_SET)),
    );
    return cookieConsent ? cookieConsent.analytics : false;
  }

  function initAnalytics() {
    loadGtmScript();
    initGtm();
    initLinkerHandlers();
  }

  function loadGtmScript() {
    var gtmScriptTag = document.createElement("script");
    gtmScriptTag.type = "text/javascript";
    gtmScriptTag.setAttribute("async", "true");
    gtmScriptTag.setAttribute(
      "src",
      "https://www.googletagmanager.com/gtm.js?id=" + trackingId,
    );
    gtmScriptTag.setAttribute("crossorigin", "anonymous");
    document.documentElement.firstChild.appendChild(gtmScriptTag);
  }

  function initGtm() {
    window.dataLayer = [
      {
        "gtm.allowlist": ["google"],
        "gtm.blocklist": ["adm", "awct", "sp", "gclidw", "gcs", "opt"],
      },
    ];

    var gaDataElement = document.getElementById("gaData");

    var sessionJourney = getJourneyMapping(window.location.pathname);
    var criJourney = criDataLayer(
      gaDataElement ? gaDataElement.value : "undefined",
    );

    function gtag(obj) {
      dataLayer.push(obj);
    }

    if (sessionJourney) {
      gtag(sessionJourney);
    }

    if (criJourney) {
      gtag(criJourney);
    }

    gtag({ "gtm.start": new Date().getTime(), event: "gtm.js" });
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

  function getCookie(name) {
    var nameEQ = name + "=";
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
    return null;
  }

  function setCookie(name, values, options) {
    if (typeof options === "undefined") {
      options = {};
    }

    var cookieString = name + "=" + encodeURIComponent(JSON.stringify(values));
    if (options.days) {
      var date = new Date();
      date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000);
      cookieString =
        cookieString +
        "; Expires=" +
        date.toUTCString() +
        "; Path=/; Domain=" +
        analyticsCookieDomain;
    }

    if (document.location.protocol === "https:") {
      cookieString = cookieString + "; Secure";
    }

    document.cookie = cookieString;
  }

  function hideElement(el) {
    el.style.display = "none";
  }

  function showElement(el) {
    el.style.display = "block";
  }

  return {
    cookieBannerInit: cookieBannerInit,
    hasConsentForAnalytics: hasConsentForAnalytics,
    initAnalytics: initAnalytics,
  };
};

window.GOVUKFrontend = window.GOVUKFrontend || {};
window.GOVUKFrontend.Cookies = cookies;
