window.DI = window.DI || {};

(function (DI) {
  "use strict";

  var COOKIES_PREFERENCES_SET = "cookies_preferences_set";
  var cookiesAccepted = document.querySelector("#cookies-accepted");
  var cookiesRejected = document.querySelector("#cookies-rejected");
  var hideCookieBanner = document.querySelectorAll(".cookie-hide-button");
  var cookieBannerContainer = document.querySelector(".govuk-cookie-banner");
  var cookieBanner = document.querySelector("#cookies-banner-main");
  var acceptCookies = document.querySelector('button[name="cookiesAccept"]');
  var rejectCookies = document.querySelector('button[name="cookiesReject"]');

  function cookieBannerInit(domain) {
    if (typeof domain !== "string") {
      /* eslint-disable-next-line no-console */
      console.warn("Cookie banner cannot be initialised: domain is " + domain);
      return;
    }

    acceptCookies.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        setBannerCookieConsent(true, domain);
      }.bind(this),
    );

    rejectCookies.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        setBannerCookieConsent(false, domain);
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

    var hasCookiesPolicy = window.DI.cookies.getCookie(COOKIES_PREFERENCES_SET);
    if (!hasCookiesPolicy) {
      showElement(cookieBannerContainer);
    }
  }

  function setBannerCookieConsent(analyticsConsent, domain) {
    window.DI.cookies.setCookie(
      COOKIES_PREFERENCES_SET,
      { analytics: analyticsConsent },
      { days: 365 },
      domain,
    );

    hideElement(cookieBanner);

    if (analyticsConsent === true) {
      showElement(cookiesAccepted);

      var event;
      if (typeof window.CustomEvent === "function") {
        event = new window.CustomEvent("cookie-consent");
      } else {
        event = document.createEvent("CustomEvent");
        event.initCustomEvent("cookie-consent");
      }
      window.dispatchEvent(event);
    } else {
      showElement(cookiesRejected);
    }
  }

  function hideElement(el) {
    el.style.display = "none";
  }

  function showElement(el) {
    el.style.display = "block";
  }

  DI.cookieBannerInit = cookieBannerInit;
})(window.DI);
