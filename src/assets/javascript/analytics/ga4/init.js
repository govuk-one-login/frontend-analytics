/* global window document */

window.DI = window.DI || {}
window.DI.analyticsGa4 = window.DI.analyticsGa4 || {};

(function (analytics) {

  'use strict'

  // container is an optional parameter used for unit tests
  var init = function(container) {

    var consentGiven = window.DI.cookies.hasConsentForAnalytics()

    if (consentGiven) {
      window.DI.core.load(window.DI.analytics.vars.ga4ContainerId)

      initGa4GlobalTrackers()
      initGa4ElementTrackers(container ?? document)
    } else {
      window.addEventListener('cookie-consent', function() { return window.DI.analyticsGa4.init() })
    }
  }

  // Initialise trackers for GA4 events which can be tracked at the global page level, such as page_view events
  var initGa4GlobalTrackers = function () {
    var trackers = window.DI.analyticsGa4.trackers
    for (var trackerName in trackers) {
      if (Object.hasOwn(trackers, trackerName)) {
        var tracker = trackers[trackerName]
        if (typeof tracker.init === 'function') {
          try {
            tracker.init()
          } catch (e) {
            // if there's a problem with the tracker, catch the error to allow other trackers to start
            /* eslint-disable-next-line no-console */
            console.warn('Error starting analytics tracker ' + tracker + ': ' + e.message, window.location)
          }
        }
      }
    }
  }

  var getTrackingElements = function (document) {
    var trackerSelector = '[ga4-trackers]'
    var trackingElementsNodes = document.querySelectorAll(trackerSelector)
    var trackingElements = []
    // convert nodelist of trackers to array
    for (var i = 0; i < trackingElementsNodes.length; i++) {
      var element = trackingElementsNodes[i]
      trackingElements.push(element)
    }

    return trackingElements
  }

  // eg form-tracker to FormTracker
  var kebabCaseToPascalCase = function (string) {
    var camelCase = function (string) {
      return string.replace(/-([a-z])/g, function (g) {
        return g.charAt(1).toUpperCase()
      })
    }

    var capitaliseFirstLetter = function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }

    return capitaliseFirstLetter(camelCase(string))
  }

  // Initialise trackers for GA4 events which should be tracked on specific page elements, such as form_response events
  var initGa4ElementTrackers = function (document) {

    var elements = getTrackingElements(document)

    for (var i = 0; i < elements.length; i++) {
      var element = elements[i]
      var elementTrackers = element.getAttribute('ga4-trackers').split(' ')

      for (var j = 0; j < elementTrackers.length; j++) {
        var elementTracker = elementTrackers[j]
        var trackerName = kebabCaseToPascalCase(elementTracker)
        var trackers = window.DI.analyticsGa4.trackers
        if (Object.hasOwn(trackers, trackerName)) {
          var tracker = trackers[trackerName]
          if (typeof tracker === 'function' && typeof tracker.prototype.init === 'function') {
            try {
              new tracker(element).init()
            } catch (e) {
              // if there's a problem with the tracker, catch the error to allow other trackers to start
              /* eslint-disable-next-line no-console */
              console.warn('Error starting element tracker ' + tracker + ': ' + e.message, window.location)
            }
          }
        }
      }
    }
  }

  analytics.init = init

})(window.DI.analyticsGa4)
