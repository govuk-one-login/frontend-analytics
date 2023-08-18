# Page View Tracker

This tracker pushes a GA4 page view event to Google Analytics. 

If a user has already consented to analytics when they visit a page, the page view event will be pushed to the dataLayer.

Note that if a user consents to analytics while already on a page (ie. the page has already loaded), the page view will 
still be pushed to the dataLayer when the user clicks "Accept" on the cookie banner, even though the page has not
reloaded. 