/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import chaiModule, { expect } from 'chai';
import sinon from "sinon";
import sinonChai from "sinon-chai";
const { JSDOM } = require('jsdom')

chaiModule.use(sinonChai);

describe('NavigationTracker', () => {

  let mockSendData
  let consoleWarnSpy
  let navigationElement
  let document

  beforeEach(async () => {
    const dom = new JSDOM('')
    document = dom.window.document
    navigationElement = document.createElement('button')

    global.window = {
      DI: {
        core: {
          sendData: () => 'sent!',

          trackerFunctions: {
            findTrackingAttributes: () => navigationElement
          }
        },
      }
    }
    mockSendData = sinon.stub(global.window.DI.core, 'sendData')
    consoleWarnSpy = sinon.spy(console, "warn")
    window.dataLayer = []

    document.body.appendChild(navigationElement)

    require('../../../../../../src/assets/javascript/analytics/ga4/navigationTracker.js')
  });

  afterEach(() => {
    sinon.restore()
    document.body.removeChild(navigationElement)
    delete require.cache[require.resolve('../../../../../../src/assets/javascript/analytics/ga4/navigationTracker.js')];
  });

  describe('trackButtonClick', () => {
    describe('Tracking information not configured', () => {
      it('Does not send navigation event', () => {
        global.window.DI.core.trackerFunctions.findTrackingAttributes = () => null
        new global.window.DI.analyticsGa4.trackers.NavigationTracker(navigationElement).init()
        const event = document.createEvent('CustomEvent')
        event.initEvent('click')
        navigationElement.dispatchEvent(event)
        expect(mockSendData).not.to.have.been.called
        expect(consoleWarnSpy).to.be.calledWith("Could not find the navigation tracker configuration")
      })
    })

    describe('Invalid tracker configuration', () => {
      it('Does not send navigation event', () => {
        navigationElement.setAttribute('ga4-data-navigation', 'malformedJson')
        new global.window.DI.analyticsGa4.trackers.NavigationTracker(navigationElement).init()
        const event = document.createEvent('CustomEvent')
        event.initEvent('click')
        navigationElement.dispatchEvent(event)
        expect(mockSendData).not.to.have.been.called
        expect(consoleWarnSpy).to.be.calledWith("GA4 configuration error: Unexpected token m in JSON at position 0")
      })

      describe('Missing configuration property', () => {
        it('Does not send navigation event', () => {
          navigationElement.setAttribute('ga4-data-navigation', '{ "text": "text", "external": "external" }')
          new global.window.DI.analyticsGa4.trackers.NavigationTracker(navigationElement).init()
          const event = document.createEvent('CustomEvent')
          event.initEvent('click')
          navigationElement.dispatchEvent(event)
          expect(mockSendData).not.to.have.been.called
          expect(consoleWarnSpy).to.be.calledWith("Missing ga4-data-navigation configuration properties. Expected: [text: string, type: string, external: string]")
        })
      })

      describe('Text property is not an instance of "string"', () => {
        it('Does not send navigation event', () => {
          navigationElement.setAttribute('ga4-data-navigation', '{ "text": [], "type": "type", "external": "external" }')
          new global.window.DI.analyticsGa4.trackers.NavigationTracker(navigationElement).init()
          const event = document.createEvent('CustomEvent')
          event.initEvent('click')
          navigationElement.dispatchEvent(event)
          expect(mockSendData).not.to.have.been.called
          expect(consoleWarnSpy).to.be.calledWith("Missing ga4-data-navigation configuration properties. Expected: [text: string, type: string, external: string]")
        })
      })

      describe('Type property is not an instance of "string"', () => {
        it('Does not send navigation event', () => {
          navigationElement.setAttribute('ga4-data-navigation', '{ "type": 5, "external": "external" }')
          new global.window.DI.analyticsGa4.trackers.NavigationTracker(navigationElement).init()
          const event = document.createEvent('CustomEvent')
          event.initEvent('click')
          navigationElement.dispatchEvent(event)
          expect(mockSendData).not.to.have.been.called
          expect(consoleWarnSpy).to.be.calledWith("Missing ga4-data-navigation configuration properties. Expected: [text: string, type: string, external: string]")
        })
      })

      describe('External property is not an instance of "string"', () => {
        it('Does not send navigation event', () => {
          navigationElement.setAttribute('ga4-data-navigation', '{ "type": "type", "external": true }')
          new global.window.DI.analyticsGa4.trackers.NavigationTracker(navigationElement).init()
          const event = document.createEvent('CustomEvent')
          event.initEvent('click')
          navigationElement.dispatchEvent(event)
          expect(mockSendData).not.to.have.been.called
          expect(consoleWarnSpy).to.be.calledWith("Missing ga4-data-navigation configuration properties. Expected: [text: string, type: string, external: string]")
        })
      })
    })

    describe('Missing tracker configuration', () => {
      it('Does not send navigation event', () => {
        navigationElement.setAttribute('ga4-data-navigation', '{}')
        new global.window.DI.analyticsGa4.trackers.NavigationTracker(navigationElement).init()
        const event = document.createEvent('CustomEvent')
        event.initEvent('click')
        navigationElement.dispatchEvent(event)
        expect(mockSendData).not.to.have.been.called
        expect(consoleWarnSpy).to.be.calledWith("Missing ga4-data-navigation configuration properties. Expected: [text: string, type: string, external: string]")
      })
    })

    describe('Button click event', () => {
      it('Sends navigation event with button text and additional data attributes', () => {
        navigationElement.setAttribute('ga4-data-navigation', '{ "text": "text", "type": "type", "external": "external" }')
        new global.window.DI.analyticsGa4.trackers.NavigationTracker(navigationElement).init()

        const event = document.createEvent('CustomEvent')
        event.initEvent('click')
        navigationElement.dispatchEvent(event)

        expect(mockSendData).to.have.been.calledWithExactly({
          event: 'event_data',
          event_data: {
            event_name: 'navigation',
            type: 'type',
            url: undefined,
            text: 'text',
            section: undefined,
            action: undefined,
            external: 'external'
          }
        })
      })

      it('Converts button text, type and external to lower case on navigation event', () => {
        navigationElement.setAttribute('ga4-data-navigation', '{ "text": "TEXT", "type": "TYPE", "external": "EXTERNAL" }')
        new global.window.DI.analyticsGa4.trackers.NavigationTracker(navigationElement).init()

        const event = document.createEvent('CustomEvent')
        event.initEvent('click')
        navigationElement.dispatchEvent(event)

        expect(mockSendData).to.have.been.calledWithExactly({
          event: 'event_data',
          event_data: {
            event_name: 'navigation',
            type: 'type',
            url: undefined,
            text: 'text',
            section: undefined,
            action: undefined,
            external: 'external'
          }
        })
      })
    })
  })
})