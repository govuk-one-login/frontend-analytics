window.DI = window.DI || {};

// ***********
// Let’s not initialise GOVUKFrontend as that will add extra code
// we don’t need to know about at this point
// window.GOVUKFrontend.initAll();
// ***********

window.onload = function () {
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      // eslint-disable-next-line no-undef
      navigator.userAgent,
    )
  ) {
    setVoiceOverFocus();
  }
};

function setVoiceOverFocus() {
  var focusInterval = 10; // ms, time between function calls
  var focusTotalRepetitions = 10; // number of repetitions
  var mainContent = document.getElementsByTagName("main")["main-content"];
  var cookieBanner = document.getElementsByClassName("govuk-cookie-banner")[0];
  var mainElement =
    cookieBanner.style.display === "block" ? cookieBanner : mainContent;

  mainElement.setAttribute("tabindex", "0");
  mainElement.blur();

  var focusRepetitions = 0;
  var interval = window.setInterval(function () {
    mainElement.focus();

    focusRepetitions++;
    if (focusRepetitions >= focusTotalRepetitions) {
      window.clearInterval(interval);
    }
  }, focusInterval);
}

(function (DI) {
  "use strict";

  function appInit(config) {
    if (config.isGa4Enabled === true) {
      // New analytics implementation (UA and GA4)
      window.DI.cookieBannerInit(config.analyticsCookieDomain);
      window.DI.loadAnalytics(config.uaContainerId, config.ga4ContainerId);
    } else {
      // Existing analytics implementation (UA only)
      var cookies = window.GOVUKFrontend.Cookies(
        config.uaContainerId,
        config.analyticsCookieDomain,
      );
      if (cookies.hasConsentForAnalytics()) {
        cookies.initAnalytics();
      }
      cookies.cookieBannerInit();
    }
  }

  DI.appInit = appInit;
})(window.DI);
