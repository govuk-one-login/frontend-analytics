# Page View Tracker

This document describes how a page view tracker works. The page view tracker pushes a `page_view_ga4` event to GA4. All
pages extending the base nunjucks template (`base.njk`) will have the page view tracker automatically configured.

## How it works

If a user has already consented to analytics when they visit a page, the page view event will be pushed to the dataLayer.

Note that if a user consents to analytics while already on a page (ie. the page has already loaded), the page view will 
still be pushed to the dataLayer when the user clicks "Accept" on the cookie banner, even though the page has not
reloaded. 