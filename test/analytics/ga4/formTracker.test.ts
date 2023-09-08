/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import chaiModule, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
const { JSDOM } = require("jsdom");

chaiModule.use(sinonChai);

class EventDataBuilder {
  event_name;
  type;
  url;
  text;
  section;
  action;
  external;

  constructor() {
    this.event_name = "form_response";
    this.type = "type";
    this.url = undefined;
    this.text = "text";
    this.section = "section";
    this.action = "action";
    this.external = undefined;
  }

  withType(type) {
    this.type = type;
    return this;
  }

  withText(text) {
    this.text = text;
    return this;
  }

  withSection(section) {
    this.section = section;
    return this;
  }

  withAction(action) {
    this.action = action;
    return this;
  }

  build() {
    return {
      event_name: this.event_name,
      type: this.type,
      url: this.url,
      text: this.text,
      section: this.section,
      action: this.action,
      external: this.external,
    };
  }
}

describe("FormTracker", () => {
  let mockSendData;
  let formElement;
  let document;

  beforeEach(async () => {
    const dom = new JSDOM("");
    document = dom.window.document;
    formElement = document.createElement("form");

    global.window = {
      DI: {
        core: {
          sendData: () => "sent!",

          trackerFunctions: {
            findTrackingAttributes: () => formElement,
          },
        },
      },
    };
    mockSendData = sinon.stub(global.window.DI.core, "sendData");
    window.dataLayer = [];

    document.body.appendChild(formElement);

    require("../../../src/assets/javascript/analytics/ga4/formTracker.js");
  });

  afterEach(() => {
    document.body.removeChild(formElement);
    delete require.cache[
      require.resolve(
        "../../../src/assets/javascript/analytics/ga4/formTracker",
      )
    ];
  });

  describe("trackFormSubmit", () => {
    describe("Tracking information not configured", () => {
      it("Does not send form_response event", () => {
        global.window.DI.core.trackerFunctions.findTrackingAttributes = () =>
          null;
        new global.window.DI.analyticsGa4.trackers.FormTracker(
          formElement,
        ).init();
        const event = document.createEvent("CustomEvent");
        event.initEvent("submit");
        formElement.dispatchEvent(event);
        expect(mockSendData).not.to.have.been.called;
      });
    });

    describe("Invalid tracker configuration", () => {
      it("Does not send form_response event", () => {
        formElement.setAttribute("ga4-data-form", "malformedJson");
        new global.window.DI.analyticsGa4.trackers.FormTracker(
          formElement,
        ).init();
        const event = document.createEvent("CustomEvent");
        event.initEvent("submit");
        formElement.dispatchEvent(event);
        expect(mockSendData).not.to.have.been.called;
      });
    });

    describe("No labels in form", () => {
      it("Does not send form_response event", () => {
        formElement.setAttribute("ga4-data-form", "{}");
        new global.window.DI.analyticsGa4.trackers.FormTracker(
          formElement,
        ).init();
        const event = document.createEvent("CustomEvent");
        event.initEvent("submit");
        formElement.dispatchEvent(event);
        expect(mockSendData).not.to.have.been.called;
      });
    });

    describe("No inputs for labels in form", () => {
      it("Does not send form_response event", () => {
        formElement.setAttribute("ga4-data-form", "{}");
        formElement.innerHTML = "<label></label>";
        new global.window.DI.analyticsGa4.trackers.FormTracker(
          formElement,
        ).init();
        const event = document.createEvent("CustomEvent");
        event.initEvent("submit");
        formElement.dispatchEvent(event);
        expect(mockSendData).not.to.have.been.called;
      });
    });

    describe("Radio button inputs", () => {
      describe("No radio buttons selected", () => {
        it("Does not send form_response event", () => {
          formElement.setAttribute("ga4-data-form", "{}");
          formElement.innerHTML =
            "<div>" +
            '<label for="r1">r1 label</label>' +
            '<input type="radio" id="r1" name="radio-form" value="radio1"/>' +
            "</div>" +
            "<div>" +
            '<label for="r2">r2 label</label>' +
            '<input type="radio" id="r2" name="radio-form" value="radio2"/>' +
            "</div>";
          new global.window.DI.analyticsGa4.trackers.FormTracker(
            formElement,
          ).init();
          const event = document.createEvent("CustomEvent");
          event.initEvent("submit");
          formElement.dispatchEvent(event);
          expect(mockSendData).not.to.have.been.called;
        });
      });

      describe("Radio button selected", () => {
        describe("Inputs defined outside of labels", () => {
          it("Sends form_response event with label text", () => {
            formElement.setAttribute(
              "ga4-data-form",
              '{"type": "type", "section": "section", "action": "action"}',
            );
            formElement.innerHTML =
              "<div>" +
              '<label for="r1">r1 label</label>' +
              '<input type="radio" id="r1" name="radio-form" value="radio1"/>' +
              "</div>" +
              "<div>" +
              '<label for="r2">r2 label</label>' +
              '<input type="radio" id="r2" name="radio-form" value="radio2"/>' +
              "</div>";
            new global.window.DI.analyticsGa4.trackers.FormTracker(
              formElement,
            ).init();
            document.getElementById("r1").checked = true;

            const event = document.createEvent("CustomEvent");
            event.initEvent("submit");
            formElement.dispatchEvent(event);
            expect(mockSendData).to.have.been.calledWith({
              event: "event_data",
              event_data: new EventDataBuilder().withText("r1 label").build(),
            });
          });

          it("Converts label text, section name and action to lower case in form_response event", () => {
            formElement.setAttribute(
              "ga4-data-form",
              '{"type": "type", "section": "SECTION", "action": "ACTION"}',
            );
            formElement.innerHTML =
              "<div>" +
              '<label for="r1">R1 LABEL</label>' +
              '<input type="radio" id="r1" name="radio-form" value="radio1"/>' +
              "</div>" +
              "<div>" +
              '<label for="r2">r2 label</label>' +
              '<input type="radio" id="r2" name="radio-form" value="radio2"/>' +
              "</div>";
            new global.window.DI.analyticsGa4.trackers.FormTracker(
              formElement,
            ).init();
            document.getElementById("r1").checked = true;

            const event = document.createEvent("CustomEvent");
            event.initEvent("submit");
            formElement.dispatchEvent(event);
            expect(mockSendData).to.have.been.calledWith({
              event: "event_data",
              event_data: new EventDataBuilder().withText("r1 label").build(),
            });
          });

          describe("Tracker configuration missing", () => {
            it("Sends undefined values for type, section and action", () => {
              formElement.setAttribute("ga4-data-form", "{}");
              formElement.innerHTML =
                "<div>" +
                '<label for="r1">R1 LABEL</label>' +
                '<input type="radio" id="r1" name="radio-form" value="radio1"/>' +
                "</div>" +
                "<div>" +
                '<label for="r2">r2 label</label>' +
                '<input type="radio" id="r2" name="radio-form" value="radio2"/>' +
                "</div>";
              new global.window.DI.analyticsGa4.trackers.FormTracker(
                formElement,
              ).init();
              document.getElementById("r1").checked = true;

              const event = document.createEvent("CustomEvent");
              event.initEvent("submit");
              formElement.dispatchEvent(event);
              expect(mockSendData).to.have.been.calledWith({
                event: "event_data",
                event_data: new EventDataBuilder()
                  .withText("r1 label")
                  .withType(undefined)
                  .withSection(undefined)
                  .withAction(undefined)
                  .build(),
              });
            });
          });
        });

        describe("Inputs defined inside labels", () => {
          it("Sends form_response event with label text", () => {
            formElement.setAttribute(
              "ga4-data-form",
              '{"type": "type", "section": "section", "action": "action"}',
            );
            formElement.innerHTML =
              "<div>" +
              '<label><input type="radio" id="r1" name="radio-form" value="radio1"/>r1 label</label>' +
              '<label><input type="radio" id="r1" name="radio-form" value="radio1"/>r1 label</label>' +
              '<label><input type="radio" id="r2" name="radio-form" value="radio2"/>r2 label</label>' +
              "</div>";
            new global.window.DI.analyticsGa4.trackers.FormTracker(
              formElement,
            ).init();
            document.getElementById("r2").checked = true;

            const event = document.createEvent("CustomEvent");
            event.initEvent("submit");
            formElement.dispatchEvent(event);
            expect(mockSendData).to.have.been.calledWith({
              event: "event_data",
              event_data: new EventDataBuilder().withText("r2 label").build(),
            });
          });
        });
      });
    });
  });
});
