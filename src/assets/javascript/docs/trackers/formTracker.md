# Form Tracker

This document describes how a form tracker works. The form tracker pushes a `form_response` event to GA4. For details on
how to configure a form tracker on a particular form, see `src/assets/javascript/docs/ga4/configuration.md`. 

If a user has consented to analytics cookies and the form tracker has been configured on a form, then the 
`form_response` event is pushed when the user submits this form. The event is only pushed provided the user has selected
something; otherwise, no event is pushed.

## How it works

The form tracker works by adding an event listener to the form which listens for the `submit` event dispatched by the
form's continue (or submission) button. The event listener invokes the `trackFormSubmit` function with the submit event.

The data required for the `form_response` event is parsed from the form's `ga4-data-form` attribute. Next, the 
`getFormInputs` function gets all the `label` elements in the form, along with their associated `input` elements, and an
array of pairs of label and input elements is returned. The function `getInputValues` takes each label-input pair and
identifies firstly which type of input it is (radio button, checkbox, etc.) and, secondly, based on the input type, 
what the value of the input is (e.g. the text of a radio button). If an input had no value (e.g. radio button not 
selected) then this is filtered out of the inputs. The user inputs are converted to a comma-separated string and are 
pushed in the `form_response` event in the `text` field.

> The `ga4-data-form` attribute is mandatory and must be of the format `{ type: string, section: string, action: string }`.
> If any of the properties are missing or are in the wrong format, the event will not be sent.
> If a user has not selected any options, then the form_response event is not sent.

## Currently supported input types

Inputs of the following type will be included in the `form_response` event pushed to GA4:
- Radio buttons

## Tracking a new input type

Support for a new type of form input can be added to the form tracker as follows.

First, an input value mapper needs to be defined for the input type, such as `get<InputType>Input` (c.f. 
`getRadioButtonInput`). This is a function that takes as a parameter an object with a `label` and an `input` property,
which are the label and input elements, respectively, associated with that input. The function returns the value for 
that input that should be included in the `form_response` event, if this input was selected or has a value; otherwise,
the function should return `null`.

Second, the `getInputValueMapper` function should be updated and add new logic to determine if the input is of the new 
type to be added and, if so, to return the new input value mapper that has just been defined (see how this has been done
by checking the input's `type` attribute to determine if it is a radio button, for example).