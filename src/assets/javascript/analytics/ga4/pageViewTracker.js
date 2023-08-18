/* global window document */

window.DI = window.DI || {}
window.DI.analyticsGa4 = window.DI.analyticsGa4 || {}
window.DI.analyticsGa4.trackers = window.DI.analyticsGa4.trackers || {};

(function (trackers) {

  'use strict'

  let PageViewTracker = {

    init: function() {
      const data = {
        event: 'page_view_ga4',
        page_view: {
          language: this.getLanguage(),
          location: document.location.href,
          organisations: '<OT1056>',
          primary_publishing_organisation: 'government digital service - digital identity',
          status_code: this.getStatusCode(),
          title: document.title,
          referrer: document.referrer,
          taxonomy_level1: 'document checking application',
          taxonomy_level2: 'pre cri'
        }
      }
      window.DI.core.sendData(data)
    },

    getLanguage: function() {
      return window.DI.cookies.getCookie('lng') ?? 'en'
    },

    getStatusCode: function() {
      return window.DI.httpStatusCode ?? 200
    }
  }

  trackers.PageViewTracker = PageViewTracker

})(window.DI.analyticsGa4.trackers)
