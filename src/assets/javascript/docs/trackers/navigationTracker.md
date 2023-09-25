# Navigation Tracker

This document describes how a navigation tracker works. The navigation tracker pushes a `navigation` event to GA4. For details on
how to configure a navigation tracker, see `src/assets/javascript/docs/ga4/configuration.md`. 

If a user has consented to analytics cookies and the navigation tracker has been configured on an element, then the 
`navigation` event is pushed to the dataLayer when the user clicks on the element. The event is only pushed if the event data is configured correctly.

## How it works

The navigation tracker works by adding an event listener to the element which listens for the `click` event dispatched by the
element (button/link). The event listener invokes the `trackButtonClick` function with the `click` event.

The data required for the `navigation` event is parsed from the element's `ga4-data-navigation` attribute.

> The `ga4-data-navigation` attribute is mandatory and must be of the format `{ text: string, type: string, external: string }`.
> If any of the properties are missing or are in the wrong format, the event will not be sent.

## Tracking different navigation types

The type of the `navigation` event is determined by the properties parsed in the `ga4-data-navigation` attribute, and so only the configuration needs
to be modified per navigation type.

Types of `navigation` events can be found at: https://govukverify.atlassian.net/wiki/spaces/PI/pages/3603791886/GA4+Implementation+Guide#Navigation-(NAV)-interactions