/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import chaiModule, { expect } from 'chai';
import sinon from "sinon";
import sinonChai from "sinon-chai";
const { JSDOM } = require('jsdom')

chaiModule.use(sinonChai);

describe('FormTracker', () => {

  let mockSendData
  let consoleWarnSpy
  let formElement
  let document

  beforeEach(async () => {
    const dom = new JSDOM('')
    document = dom.window.document
    formElement = document.createElement('form')

    global.window = {
      DI: {
        core: {
          sendData: () => 'sent!',

          trackerFunctions: {
            findTrackingAttributes: () => formElement
          }
        },
      }
    }
    mockSendData = sinon.stub(global.window.DI.core, 'sendData')
    consoleWarnSpy = sinon.spy(console, 'warn')
    window.dataLayer = []

    document.body.appendChild(formElement)

    require('../../../../../../src/assets/javascript/analytics/ga4/formTracker.js')
  });

  afterEach(() => {
    sinon.restore();
    document.body.removeChild(formElement)
    delete require.cache[require.resolve('../../../../../../src/assets/javascript/analytics/ga4/formTracker.js')];
  });

  describe('trackFormSubmit', () => {
    describe('Tracking information not configured', () => {
      it('Does not send form_response event', () => {
        global.window.DI.core.trackerFunctions.findTrackingAttributes = () => null
        new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
        const event = document.createEvent('CustomEvent')
        event.initEvent('submit')
        formElement.dispatchEvent(event)
        expect(mockSendData).not.to.have.been.called
        expect(consoleWarnSpy).to.be.calledWith("Could not find the form tracker configuration")
      })
    })

    describe('Invalid tracker configuration', () => {
      it('Does not send form_response event', () => {
        formElement.setAttribute('ga4-data-form', 'malformedJson')
        new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
        const event = document.createEvent('CustomEvent')
        event.initEvent('submit')
        formElement.dispatchEvent(event)
        expect(mockSendData).not.to.have.been.called
        expect(consoleWarnSpy).to.be.calledWith("GA4 configuration error: Unexpected token m in JSON at position 0")
      })

      describe('Missing configuration property', () => {
        it('Does not send form_response event', () => {
          formElement.setAttribute('ga4-data-form', '{ "type": "type", "section": "section" }')
          new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
          const event = document.createEvent('CustomEvent')
          event.initEvent('submit')
          formElement.dispatchEvent(event)
          expect(mockSendData).not.to.have.been.called
          expect(consoleWarnSpy).to.be.calledWith("Missing ga4-data-form configuration properties. Expected: [type: string, section: string, action: string]")
        })
      })

      describe('Type property is not an instance of "string"', () => {
        it('Does not send form_response event', () => {
          formElement.setAttribute('ga4-data-form', '{ "type": [], "section": "section", "action": "action" }')
          new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
          const event = document.createEvent('CustomEvent')
          event.initEvent('submit')
          formElement.dispatchEvent(event)
          expect(mockSendData).not.to.have.been.called
          expect(consoleWarnSpy).to.be.calledWith("Missing ga4-data-form configuration properties. Expected: [type: string, section: string, action: string]")
        })
      })

      describe('Section property is not an instance of "string"', () => {
        it('Does not send form_response event', () => {
          formElement.setAttribute('ga4-data-form', '{ "type": "type", "section": {}, "action": "action" }')
          new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
          const event = document.createEvent('CustomEvent')
          event.initEvent('submit')
          formElement.dispatchEvent(event)
          expect(mockSendData).not.to.have.been.called
          expect(consoleWarnSpy).to.be.calledWith("Missing ga4-data-form configuration properties. Expected: [type: string, section: string, action: string]")
        })
      })

      describe('Action property is not an instance of "string"', () => {
        it('Does not send form_response event', () => {
          formElement.setAttribute('ga4-data-form', '{ "type": "type", "section": "section", "action": true }')
          new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
          const event = document.createEvent('CustomEvent')
          event.initEvent('submit')
          formElement.dispatchEvent(event)
          expect(mockSendData).not.to.have.been.called
          expect(consoleWarnSpy).to.be.calledWith("Missing ga4-data-form configuration properties. Expected: [type: string, section: string, action: string]")
        })
      })
    })

    describe('No labels in form', () => {
      it('Does not send form_response event', () => {
        formElement.setAttribute('ga4-data-form', '{ "type": "type", "section": "section", "action": "action" }')
        new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
        const event = document.createEvent('CustomEvent')
        event.initEvent('submit')
        formElement.dispatchEvent(event)
        expect(mockSendData).not.to.have.been.called
      })
    })

    describe('No inputs for labels in form', () => {
      it('Does not send form_response event', () => {
        formElement.setAttribute('ga4-data-form', '{ "type": "type", "section": "section", "action": "action" }')
        formElement.innerHTML = '<label></label>'
        new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
        const event = document.createEvent('CustomEvent')
        event.initEvent('submit')
        formElement.dispatchEvent(event)
        expect(mockSendData).not.to.have.been.called
      })
    })

    describe('Radio button inputs', () => {
      describe('No radio buttons selected', () => {
        it('Does not send form_response event', () => {
          formElement.setAttribute('ga4-data-form', '{ "type": "type", "section": "section", "action": "action" }')
          formElement.innerHTML =
            '<div>' +
            '<label for="r1">r1 label</label>' +
            '<input type="radio" id="r1" name="radio-form" value="radio1"/>' +
            '</div>' +
            '<div>' +
            '<label for="r2">r2 label</label>' +
            '<input type="radio" id="r2" name="radio-form" value="radio2"/>' +
            '</div>'
          new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
          const event = document.createEvent('CustomEvent')
          event.initEvent('submit')
          formElement.dispatchEvent(event)
          expect(mockSendData).not.to.have.been.called
        })
      })

      describe('Radio button selected', () => {
        describe('Inputs defined outside of labels', () => {
          it('Sends form_response event with label text', () => {
            formElement.setAttribute('ga4-data-form', '{ "type": "type", "section": "section", "action": "action" }')
            formElement.innerHTML =
              '<div>' +
              '<label for="r1">r1 label</label>' +
              '<input type="radio" id="r1" name="radio-form" value="radio1"/>' +
              '</div>' +
              '<div>' +
              '<label for="r2">r2 label</label>' +
              '<input type="radio" id="r2" name="radio-form" value="radio2"/>' +
              '</div>'
            new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
            document.getElementById('r1').checked = true

            const event = document.createEvent('CustomEvent')
            event.initEvent('submit')
            formElement.dispatchEvent(event)
            expect(mockSendData).to.have.been.calledWith({
              event: 'event_data',
              event_data: {
                event_name: 'form_response',
                type: 'type',
                url: undefined,
                text: 'r1 label',
                section: 'section',
                action: 'action',
                external: undefined
              }
            })
          })

          it('Converts label text, event type, section name and action to lower case in form_response event', () => {
            formElement.setAttribute('ga4-data-form', '{ "type": "TYPE", "section": "SECTION", "action": "ACTION" }')
            formElement.innerHTML =
              '<div>' +
              '<label for="r1">R1 LABEL</label>' +
              '<input type="radio" id="r1" name="radio-form" value="radio1"/>' +
              '</div>' +
              '<div>' +
              '<label for="r2">r2 label</label>' +
              '<input type="radio" id="r2" name="radio-form" value="radio2"/>' +
              '</div>'
            new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
            document.getElementById('r1').checked = true

            const event = document.createEvent('CustomEvent')
            event.initEvent('submit')
            formElement.dispatchEvent(event)
            expect(mockSendData).to.have.been.calledWith({
              event: 'event_data',
              event_data: {
                event_name: 'form_response',
                type: 'type',
                url: undefined,
                text: 'r1 label',
                section: 'section',
                action: 'action',
                external: undefined
              }
            })
          })
        })

        describe('Inputs defined inside labels', () => {
          it('Sends form_response event with label text', () => {
            formElement.setAttribute('ga4-data-form', '{ "type": "type", "section": "section", "action": "action" }')
            formElement.innerHTML =
              '<div>' +
              '<label><input type="radio" id="r1" name="radio-form" value="radio1"/>r1 label</label>' +
              '<label><input type="radio" id="r1" name="radio-form" value="radio1"/>r1 label</label>' +
              '<label><input type="radio" id="r2" name="radio-form" value="radio2"/>r2 label</label>' +
              '</div>'
            new global.window.DI.analyticsGa4.trackers.FormTracker(formElement).init()
            document.getElementById('r2').checked = true

            const event = document.createEvent('CustomEvent')
            event.initEvent('submit')
            formElement.dispatchEvent(event)
            expect(mockSendData).to.have.been.calledWith({
              event: 'event_data',
              event_data: {
                event_name: 'form_response',
                type: 'type',
                url: undefined,
                text: 'r2 label',
                section: 'section',
                action: 'action',
                external: undefined
              }
            })
          })
        })
      })
    })
  })
})