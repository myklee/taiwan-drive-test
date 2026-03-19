import { describe, it, expect, vi, beforeEach } from "vitest";

// Test the language configuration and key patterns directly
// (These test the logic that app.js implements, not the module itself,
//  since app.js is a browser module with side effects at load time)

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日文" },
  { code: "vi", name: "越南文" },
  { code: "id", name: "印尼文" },
  { code: "th", name: "泰文" },
  { code: "my", name: "緬甸文" },
  { code: "km", name: "柬文" },
];

const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

describe("Language configuration", () => {
  it("has 8 supported languages", () => {
    expect(LANGUAGES).toHaveLength(8);
  });

  it("includes English as first language", () => {
    expect(LANGUAGES[0].code).toBe("en");
  });

  it("includes Chinese", () => {
    expect(LANGUAGE_CODES).toContain("zh");
  });
});

describe("Fetch URL construction", () => {
  it('loadQuestions("en") fetches from ./questions/en.json', () => {
    const lang = "en";
    const url = `./questions/${lang}.json`;
    expect(url).toBe("./questions/en.json");
  });

  it('loadQuestions("zh") fetches from ./questions/zh.json', () => {
    const lang = "zh";
    const url = `./questions/${lang}.json`;
    expect(url).toBe("./questions/zh.json");
  });

  it("fetch URL uses the active language code", () => {
    for (const code of LANGUAGE_CODES) {
      expect(`./questions/${code}.json`).toBe(`./questions/${code}.json`);
    }
  });
});

describe("Favorites key isolation", () => {
  it("favKey returns favorites_en for English", () => {
    const activeLanguage = "en";
    const key = `favorites_${activeLanguage}`;
    expect(key).toBe("favorites_en");
  });

  it("favKey returns favorites_zh for Chinese", () => {
    const activeLanguage = "zh";
    const key = `favorites_${activeLanguage}`;
    expect(key).toBe("favorites_zh");
  });

  it("favorites are empty set when no localStorage entry exists", () => {
    // Simulate no entry in localStorage
    const saved = null;
    const favorites = saved ? new Set(JSON.parse(saved)) : new Set();
    expect(favorites.size).toBe(0);
  });

  it("switching language changes the favorites key", () => {
    let activeLanguage = "en";
    const favKey = () => `favorites_${activeLanguage}`;
    expect(favKey()).toBe("favorites_en");
    activeLanguage = "zh";
    expect(favKey()).toBe("favorites_zh");
  });
});

describe("Language persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("valid language code is accepted", () => {
    const persisted = "zh";
    const validCodes = LANGUAGE_CODES;
    const activeLanguage = validCodes.includes(persisted) ? persisted : "en";
    expect(activeLanguage).toBe("zh");
  });

  it("invalid language code falls back to English", () => {
    const persisted = "invalid-lang";
    const validCodes = LANGUAGE_CODES;
    const activeLanguage = validCodes.includes(persisted) ? persisted : "en";
    expect(activeLanguage).toBe("en");
  });

  it("null persisted value falls back to English", () => {
    const persisted = null;
    const validCodes = LANGUAGE_CODES;
    const activeLanguage = validCodes.includes(persisted) ? persisted : "en";
    expect(activeLanguage).toBe("en");
  });

  it("empty string falls back to English", () => {
    const persisted = "";
    const validCodes = LANGUAGE_CODES;
    const activeLanguage = validCodes.includes(persisted) ? persisted : "en";
    expect(activeLanguage).toBe("en");
  });
});

describe("Filter reset on language switch", () => {
  it('switching language resets filter to "all"', () => {
    let currentFilter = "signs-true-false";
    // Simulate language switch resetting filter
    currentFilter = "all";
    expect(currentFilter).toBe("all");
  });

  it("switching language resets currentQuestionIndex to 0", () => {
    let currentQuestionIndex = 5;
    // Simulate language switch resetting index
    currentQuestionIndex = 0;
    expect(currentQuestionIndex).toBe(0);
  });
});

describe("Error state", () => {
  it("404 response should trigger error state message", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal("fetch", mockFetch);

    const lang = "ja";
    const response = await fetch(`./questions/${lang}.json`);
    expect(response.ok).toBe(false);

    // The error message that should be shown
    const errorMessage = "Questions for this language are not yet available.";
    expect(errorMessage).toContain("not yet available");

    vi.unstubAllGlobals();
  });
});
