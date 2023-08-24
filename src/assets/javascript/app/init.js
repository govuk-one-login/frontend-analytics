/* global window document */

window.DI = window.DI || {};

// ***********
// Let’s not initialise GOVUKFrontend as that will add extra code
// we don’t need to know about at this point
// window.GOVUKFrontend.initAll();
// ***********

window.onload = function() {
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      // eslint-disable-next-line no-undef
      navigator.userAgent
    )
  ) {
    setVoiceOverFocus();
  }
};

function setVoiceOverFocus() {
  const focusInterval = 10; // ms, time between function calls
  const focusTotalRepetitions = 10; // number of repetitions
  const mainContent = document.getElementsByTagName("main")["main-content"];
  const cookieBanner = document.getElementsByClassName(
    "govuk-cookie-banner"
  )[0];
  const mainElement =
    cookieBanner.style.display === "block" ? cookieBanner : mainContent;

  mainElement.setAttribute("tabindex", "0");
  mainElement.blur();

  let focusRepetitions = 0;
  const interval = window.setInterval(function() {
    mainElement.focus();

    focusRepetitions++;
    if (focusRepetitions >= focusTotalRepetitions) {
      window.clearInterval(interval);
    }
  }, focusInterval);
}

(function(DI) {
  "use strict";

  function appInit({
                     analyticsCookieDomain,
                     uaContainerId,
                     isGa4Enabled,
                     ga4ContainerId
                   }) {
    if (isGa4Enabled === true) {
      // New analytics implementation (UA and GA4)
      window.DI.cookieBannerInit(analyticsCookieDomain);
      window.DI.loadAnalytics(uaContainerId, ga4ContainerId);
    } else {
      // Existing analytics implementation (UA only)
      const cookies = window.GOVUKFrontend.Cookies(
        uaContainerId,
        analyticsCookieDomain
      );
      if (cookies.hasConsentForAnalytics()) {
        cookies.initAnalytics();
      }
      cookies.cookieBannerInit();
    }
  }

  DI.appInit = appInit;
})(window.DI);
