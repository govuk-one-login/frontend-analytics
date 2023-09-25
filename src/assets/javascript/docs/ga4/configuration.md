# GA4 Tracker Initialisation

This document describes how to initialise different GA4 trackers on a particular page.

Below, 'tracker' refers to an object or class which is responsible for sending an event to GA4, for example, the
page view tracker can send the `page_view_ga4` event.

## Init Function

The GA4 `init` function (`src/assets/javascript/analytics/ga4/init.js`) initialises all the global trackers and all the 
element trackers for a page. The difference between these two types of tracker, and how to configure them, is described 
below.

## Global Trackers

### Description

Global trackers push events which are relevant at the global page level (as opposed to at the level of a particular HTML
element). For example, the `page_view_ga4` event is pushed any time a page is loaded, so this can be considered a global 
tracker.

### Configuration

Any data required for use by a global tracker should be accessible from the global window or document objects. 

Steps to configure a global tracker:
1. Define an object with an `init` property, which is a function that does not take any parameters. 
2. Set the tracker object as a property on the `window.DI.analyticsGa4.trackers` object.

On initialisation of a global tracker, the `init` function is called.

Sample code for defining a global tracker (see `pageViewTracker.js` for an example):
```
let TrackerName = {
  init: function () {
    // code to initialise tracker
  }
}

trackers.TrackerName = TrackerName
```

## Element Trackers

### Description 

Element trackers push events which are relevant to a particular HTML element on a page. For example, the `form_response`
event is pushed any time a form is submitted, where the form tracker has been applied.

### Configuration

#### How to apply an existing element tracker

##### Form Tracker

The `FormTracker` is responsible for sending `form_response` events to GA4. To configure a form tracker on a form the
form element should contain `form-tracker` in its `ga4-trackers` attribute, and it should contain an additional
`ga4-data-form` attribute, with the value of the latter being a stringified JSON object with the following properties,
whose values are what should be used in the corresponding values in the `form_response` event:
- `section`
- `action`
- `type`

Hence the `form_response` event can be configured on a particular form as follows:
```
<form
  ga4-trackers="form-tracker"
  ga4-data-form='{ "type": "<type>", "section": "<section>", "action": "<action>" }'
>
  <!-- form contents -->
</form>
```

> The form tracker is currently configured to only send events for forms with radio buttons. To extend this to
> accommodate other types of input, see `src/javascript/docs/trackers/formTracker.md`.

##### Navigation Tracker

The `NavigationTracker` is responsible for sending `navigation` events to GA4. To configure the navigation tracker on an 
element, that element must contain the value `navigation-tracker` in its `ga4-trackers` attribute. It must also contain
an additional `ga4-data-navigation` attribute, which is a stringified JSON object with the following properties:
- `type`
- `text`
- `external`

Here is an example of the `navigation` event tied to a button:
```
<button
  ga4-trackers="navigation-tracker"
  ga4-data-navigation='{ "text": "<text>", "type": "<type>", "external": "<external>" }'
  <!-- button attributes -->
>
  <!-- Button text -->
</button>
```

For more information on how the `navigationTracker` works, see: `src/javascript/docs/trackers/navigationTracker.md`

#### How to create a new element tracker

Steps to define a new element tracker:
1. Define a class for the tracker whose name is in the usual `PascalCase` format. The constructor of the class should
   take an `HTMLElement` as a parameter.
   > The class name of the tracker should 
   have parity with the kebab case used in the `ga4-trackers` attribute used to configure this tracker on an HTML 
   element.
2. Define a method called `init` on the tracker class which takes no parameters and which adds the relevant event 
   listeners to the HTMLElement to listen for the user action that will push the event to GA4. 
3. Set the tracker class as a property on the `window.DI.analyticsGa4.trackers` object.

Given that an element tracker has been configured by adding it to the `ga4-trackers` attribute, when the page loads, 
the tracker will be initialised with that `HTMLElement` passed to the constructor, and the `init` function is called.

Sample code for defining an element tracker (see `formTracker.js` for an example):
```
function TrackerName (element) {
  this.element = element
}

TrackerName.prototype.init = function () {
  // code for initialising tracker
}

trackers.TrackerName = TrackerName
```