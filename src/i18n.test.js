import test from "node:test";
import assert from "node:assert/strict";

import { INDIAN_LANGUAGES, translateText } from "./i18n.js";

test("translates supported translation keys into Hindi", () => {
  assert.equal(translateText("home", "hi"), "मुखपृष्ठ");
  assert.equal(translateText("login", "hi"), "लॉग इन");
});

test("translates the main interface into Bengali and Odia", () => {
  assert.equal(translateText("home", "bn"), "হোম");
  assert.equal(translateText("aboutUs", "bn"), "আমাদের সম্পর্কে");
  assert.equal(translateText("home", "or"), "ହୋମ୍");
  assert.equal(translateText("aboutUs", "or"), "ଆମମାନେ ସମ୍ବନ୍ଧରେ");
});

test("contains every Indian scheduled language option", () => {
  assert.equal(INDIAN_LANGUAGES.length, 23);
  assert.deepEqual(
    INDIAN_LANGUAGES.map((language) => language.value),
    [
      "en",
      "hi",
      "as",
      "bn",
      "brx",
      "doi",
      "gu",
      "kn",
      "ks",
      "gom",
      "mai",
      "ml",
      "mni",
      "mr",
      "ne",
      "or",
      "pa",
      "sa",
      "sat",
      "sd",
      "ta",
      "te",
      "ur"
    ]
  );
});

test("returns English text for unsupported languages and missing keys", () => {
  assert.equal(translateText("home", "fr"), "Home");
  assert.equal(translateText("governmentOfIndiaShort", "sat"), "Government of India");
});

test("supports all configured language options", () => {
  const translated = INDIAN_LANGUAGES.map((language) => ({
    value: language.value,
    home: translateText("home", language.value),
    language: translateText("language", language.value),
    governmentOfIndiaShort: translateText("governmentOfIndiaShort", language.value)
  }));

  assert.equal(translated.length, 23);
  assert.ok(translated.every((language) => language.home));
  assert.ok(translated.every((language) => language.language));
  assert.ok(translated.every((language) => language.governmentOfIndiaShort));
});
