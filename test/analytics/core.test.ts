/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { expect } from 'chai';
import { beforeEach } from "mocha";
const { JSDOM } = require('jsdom')

describe('Core', () => {
  beforeEach(async () => {
    global.window = {}
    window.dataLayer = []

    require('../../src/assets/javascript/analytics/core')
  });

  afterEach(() => {
    delete require.cache[require.resolve('../../src/assets/javascript/analytics/core')];
  });

  it('Sends data to the data layer', function () {
    global.window.DI.core.sendData({foo: 'bar'})
    expect(window.dataLayer[0]).to.deep.equal({foo: 'bar'})
  })

  describe('Track functions', () => {
    let document
    beforeEach(() => {
      const dom = new JSDOM('')
      document = dom.window.document
    })

    describe('Find tracking attributes', () => {
      it('Returns clicked element if clicked element has tracking trigger', () => {
        const element = document.createElement('div')
        element.setAttribute('tracking-trigger', 'value')
        document.body.appendChild(element)

        const elementToTrack = global.window.DI.core.trackerFunctions.findTrackingAttributes(element, 'tracking-trigger')
        expect(elementToTrack).to.equal(element)
      })

      it('Returns parent of clicked element if parent element has tracking trigger', () => {
        const parentElement = document.createElement('div')
        const childElement = document.createElement('div')
        parentElement.setAttribute('tracking-trigger', 'value')
        parentElement.appendChild(childElement)
        document.body.appendChild(parentElement)

        const elementToTrack = global.window.DI.core.trackerFunctions.findTrackingAttributes(parentElement, 'tracking-trigger')
        expect(elementToTrack).to.equal(parentElement)
      })

      it('Returns null if no parent of clicked element has tracking trigger', () => {
        const parentElement = document.createElement('div')
        const childElement = document.createElement('div')
        parentElement.appendChild(childElement)
        document.body.appendChild(parentElement)

        const elementToTrack = global.window.DI.core.trackerFunctions.findTrackingAttributes(parentElement, 'tracking-trigger')
        expect(elementToTrack).to.equal(null)
      })
    })
  })

})