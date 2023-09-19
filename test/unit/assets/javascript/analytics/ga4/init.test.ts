/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import chaiModule, { expect } from 'chai';
import sinon from "sinon";
import sinonChai from "sinon-chai";
const { JSDOM } = require('jsdom')

chaiModule.use(sinonChai);

describe('Init', () => {

  let document

  let globalTrackerAInitialiser
  let globalTrackerBInitialiser
  let elementTrackerAInitialiser
  let elementTrackerBInitialiser
  let mockLoad
  let mockAddEventListener

  beforeEach(() => {
    globalTrackerAInitialiser = sinon.stub()
    globalTrackerBInitialiser = sinon.stub()
    elementTrackerAInitialiser = sinon.stub()
    elementTrackerBInitialiser = sinon.stub()

    const GlobalTrackerA = {
      init: function () {
        globalTrackerAInitialiser()
      }
    }

    const GlobalTrackerB = {
      init: function () {
        globalTrackerBInitialiser()
      }
    }

    function ElementTrackerA (element) {
      this.element = element
    }
    ElementTrackerA.prototype.init = function () {
      elementTrackerAInitialiser(this.element)
    }

    function ElementTrackerB (element) {
      this.element = element
    }
    ElementTrackerB.prototype.init = function () {
      elementTrackerBInitialiser(this.element)
    }

    const dom = new JSDOM('')
    document = dom.window.document

    global.window = {
      DI: {
        analyticsGa4: {
          trackers: {
            GlobalTrackerA,
            GlobalTrackerB,
            ElementTrackerA,
            ElementTrackerB
          }
        },

        core: {
          load: () => 'core module loaded'
        },

        analytics: {
          vars: {
            ga4ContainerId: 'gtmContainerId'
          }
        },

        cookies: {
          hasConsentForAnalytics: () => true
        }
      },

      addEventListener: () => 'Event listener added'
    }

    mockLoad = sinon.stub(global.window.DI.core, 'load')
    mockAddEventListener = sinon.stub(global.window, 'addEventListener')

    require('../../../../../../src/assets/javascript/analytics/ga4/init')
  })

  afterEach(() => {
    delete require.cache[require.resolve('../../../../../../src/assets/javascript/analytics/ga4/init')];
  });

  describe('Analytics consent not given', () => {
    describe('Document does not contain elements to track', () => {
      it('Does not initialise trackers', () => {
        global.window.DI.cookies.hasConsentForAnalytics = () => false
        global.window.DI.analyticsGa4.init(document)
        expect(mockLoad).not.to.have.been.called
        expect(mockAddEventListener).to.have.been.calledWith('cookie-consent', sinon.match.any)
        expect(globalTrackerAInitialiser).not.to.have.been.called
        expect(globalTrackerBInitialiser).not.to.have.been.called
        expect(elementTrackerAInitialiser).not.to.have.been.called
        expect(elementTrackerBInitialiser).not.to.have.been.called
      })
    })

    describe('Document does contain elements to track', () => {
      it('Does not initialise trackers', () => {
        global.window.DI.cookies.hasConsentForAnalytics = () => false
        const element = document.createElement('div')
        element.setAttribute('ga4-trackers', 'element-tracker-a')
        document.body.appendChild(element)

        global.window.DI.analyticsGa4.init(document)
        expect(mockLoad).not.to.have.been.called
        expect(mockAddEventListener).to.have.been.calledWith('cookie-consent', sinon.match.any)
        expect(globalTrackerAInitialiser).not.to.have.been.called
        expect(globalTrackerBInitialiser).not.to.have.been.called
        expect(elementTrackerAInitialiser).not.to.have.been.called
        expect(elementTrackerBInitialiser).not.to.have.been.called
      })
    })
  })

  describe('Analytics consent given', () => {
    describe('Document does not contain elements to track', () => {
      it('Initialises global trackers', () => {
        global.window.DI.analyticsGa4.init(document)
        expect(mockLoad).to.have.been.calledWith('gtmContainerId')
        expect(mockAddEventListener).to.not.have.been.called
        expect(globalTrackerAInitialiser).to.have.callCount(1)
        expect(globalTrackerBInitialiser).to.have.callCount(1)
        expect(elementTrackerAInitialiser).not.to.have.been.called
        expect(elementTrackerBInitialiser).not.to.have.been.called
      })

      describe('Error in initialising global tracker', () => {
        it('Initialises other global trackers successfully', () => {
          global.window.DI.analyticsGa4.trackers.ErroringGlobalTracker = {
            init: () => { throw new Error('Error initialising tracker') }
          }
          global.window.DI.analyticsGa4.init(document)
          expect(mockLoad).to.have.been.calledWith('gtmContainerId')
          expect(mockAddEventListener).to.not.have.been.called
          expect(globalTrackerAInitialiser).to.have.callCount(1)
          expect(globalTrackerBInitialiser).to.have.callCount(1)
          expect(elementTrackerAInitialiser).not.to.have.been.called
          expect(elementTrackerBInitialiser).not.to.have.been.called
        })
      })
    })

    describe('Document does contain elements to track', () => {
      describe('Tracker with invalid name', () => {
        it('Initialises other element trackers', () => {
          const element = document.createElement('div')
          element.setAttribute('ga4-trackers', 'not-a-tracker')
          document.body.appendChild(element)

          global.window.DI.analyticsGa4.init(document)
          expect(mockLoad).to.have.been.calledWith('gtmContainerId')
          expect(mockAddEventListener).to.not.have.been.called
          expect(globalTrackerAInitialiser).to.have.callCount(1)
          expect(globalTrackerBInitialiser).to.have.callCount(1)
          expect(elementTrackerAInitialiser).not.to.have.been.called
          expect(elementTrackerBInitialiser).not.to.have.been.called
        })
      })

      describe('Single element to track', () => {
        describe('Single tracker', () => {
          it('Initialises element tracker', () => {
            const element = document.createElement('div')
            element.setAttribute('ga4-trackers', 'element-tracker-a')
            document.body.appendChild(element)

            global.window.DI.analyticsGa4.init(document)
            expect(mockLoad).to.have.been.calledWith('gtmContainerId')
            expect(mockAddEventListener).to.not.have.been.called
            expect(globalTrackerAInitialiser).to.have.callCount(1)
            expect(globalTrackerBInitialiser).to.have.callCount(1)
            expect(elementTrackerAInitialiser).to.have.callCount(1)
            expect(elementTrackerAInitialiser).to.have.been.calledWith(element)
          })
        })

        describe('Multiple trackers', () => {
          it('Initialises element trackers', () => {
            const element = document.createElement('div')
            element.setAttribute('ga4-trackers', 'element-tracker-a element-tracker-b')
            document.body.appendChild(element)

            global.window.DI.analyticsGa4.init(document)
            expect(mockLoad).to.have.been.calledWith('gtmContainerId')
            expect(mockAddEventListener).to.not.have.been.called
            expect(globalTrackerAInitialiser).to.have.callCount(1)
            expect(globalTrackerBInitialiser).to.have.callCount(1)
            expect(elementTrackerAInitialiser).to.have.callCount(1)
            expect(elementTrackerAInitialiser).to.have.been.calledWith(element)
            expect(elementTrackerBInitialiser).to.have.callCount(1)
            expect(elementTrackerBInitialiser).to.have.been.calledWith(element)
          })
        })
      })

      describe('Multiple elements to track', () => {
        describe('Single tracker on different elements', () => {
          it('Initialises element trackers', () => {
            const elementA = document.createElement('p')
            elementA.setAttribute('ga4-trackers', 'element-tracker-a')
            document.body.appendChild(elementA)
            const elementB = document.createElement('p')
            elementB.setAttribute('ga4-trackers', 'element-tracker-b')
            document.body.appendChild(elementB)

            global.window.DI.analyticsGa4.init(document)
            expect(mockLoad).to.have.been.calledWith('gtmContainerId')
            expect(mockAddEventListener).to.not.have.been.called
            expect(globalTrackerAInitialiser).to.have.callCount(1)
            expect(globalTrackerBInitialiser).to.have.callCount(1)
            expect(elementTrackerAInitialiser).to.have.callCount(1)
            expect(elementTrackerAInitialiser).to.have.been.calledWith(elementA)
            expect(elementTrackerBInitialiser).to.have.callCount(1)
            expect(elementTrackerBInitialiser).to.have.been.calledWith(elementB)
          })
        })

        describe('Multiple trackers on different elements', () => {
          it('Initialises element trackers', () => {
            const elementA = document.createElement('div')
            elementA.setAttribute('ga4-trackers', 'element-tracker-a element-tracker-b')
            document.body.appendChild(elementA)
            const elementB = document.createElement('p')
            elementB.setAttribute('ga4-trackers', 'element-tracker-a element-tracker-b')
            document.body.appendChild(elementB)

            global.window.DI.analyticsGa4.init(document)
            expect(mockLoad).to.have.been.calledWith('gtmContainerId')
            expect(mockAddEventListener).to.not.have.been.called

            expect(globalTrackerAInitialiser).to.have.callCount(1)
            expect(globalTrackerBInitialiser).to.have.callCount(1)
            expect(elementTrackerAInitialiser).to.have.callCount(2)
            expect(elementTrackerAInitialiser).to.have.been.calledWith(elementA)
            expect(elementTrackerAInitialiser).to.have.been.calledWith(elementB)
            expect(elementTrackerBInitialiser).to.have.callCount(2)
            expect(elementTrackerBInitialiser).to.have.been.calledWith(elementA)
            expect(elementTrackerBInitialiser).to.have.been.calledWith(elementB)
          })
        })

        describe('Error in starting element tracker', () => {
          it('Initialises other element trackers successfully', () => {
            function ErroringElementTracker (tracker) {
              this.tracker = tracker
            }
            ErroringElementTracker.prototype.init = () => { throw new Error('Error initialising tracker') }
            global.window.DI.analyticsGa4.trackers.ErroringModule = ErroringElementTracker

            const element = document.createElement('div')
            element.setAttribute('ga4-trackers', 'element-tracker-a element-tracker-b erroring-element-tracker')
            document.body.appendChild(element)

            global.window.DI.analyticsGa4.init(document)
            expect(mockLoad).to.have.been.calledWith('gtmContainerId')
            expect(mockAddEventListener).to.not.have.been.called

            expect(globalTrackerAInitialiser).to.have.callCount(1)
            expect(globalTrackerBInitialiser).to.have.callCount(1)
            expect(elementTrackerAInitialiser).to.have.callCount(1)
            expect(elementTrackerAInitialiser).to.have.been.calledWith(element)
            expect(elementTrackerBInitialiser).to.have.callCount(1)
            expect(elementTrackerBInitialiser).to.have.been.calledWith(element)
          })
        })
      })
    })
  })
})