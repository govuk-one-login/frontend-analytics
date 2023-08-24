const path = require("path");
const express = require("express");
const app = express();

// add internationalisation support
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const i18nextMiddleware = require("i18next-http-middleware");
const { i18nextConfigurationOptions } = require("./config/i18next");

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init(
    i18nextConfigurationOptions(
      path.join(__dirname, "locales/{{lng}}/{{ns}}.json"),
    ),
  );

// add nunjucks support and configure the views folders
const nunjucks = require("nunjucks");
nunjucks.configure(["./app/views", "node_modules/govuk-frontend/"], {
  autoescape: true,
  express: app,
});

const port = 3000;

// register the folder with the static assets with express
// use a build script to copy the assets from govuk-frontend
// into the assets folder
app.use("/assets", express.static("assets"));

// Allow the app to use the internationalisation library

app.use(i18nextMiddleware.handle(i18next));
app.get("/", (req, res) => {
  console.log(`Language is set to: ${req.i18n.language}`);

  // pass current language setting through to nunjucks template for HTML source code
  // e.g. <html lang="cy" class="govuk-template">

  res.locals.htmlLang = req.i18n.language;
  res.locals.pageTitleLang = req.i18n.language;
  res.locals.mainLang = req.i18n.language;

  // translate the cookie banner content and page content from the translation .json files

  const cookieBannerContent = req.i18n.t("cookieBanner", {
    returnObjects: true,
  });
  const pageContent = req.i18n.t("examplePage", { returnObjects: true });

  // output our single page
  let data = {
    layout: "index.njk",
    pageContent: pageContent,
    general: cookieBannerContent,
  };
  // a Design System component is rendered in the nunjucks page
  res.render("index.njk", data);
});

app.listen(port, () => {
  console.log(`Page available on port ${port}`);
});
