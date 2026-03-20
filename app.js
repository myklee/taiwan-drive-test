const LANGUAGES = [
  {
    code: "en",
    name: "English",
    filters: {
      all: "All Questions",
      "signs-true-false": "Signs True/False",
      "signs-multiple-choice": "Signs Multiple Choice",
      "regulations-true-false": "Regulations True/False",
      "regulations-multiple-choice": "Regulations Multiple Choice",
    },
    pdfs: [
      { label: "Signs T/F", file: "汽車標誌是非題-英文1131106.pdf" },
      { label: "Signs MC", file: "汽車標誌選擇題-英文1131106.pdf" },
      { label: "Regs T/F", file: "汽車法規是非題-英文1130711.pdf" },
      { label: "Regs MC", file: "汽車法規選擇題-英文1130815.pdf" },
    ],
  },
  {
    code: "zh",
    name: "中文",
    filters: {
      all: "所有題目",
      "signs-true-false": "標誌是非題",
      "signs-multiple-choice": "標誌選擇題",
      "regulations-true-false": "法規是非題",
      "regulations-multiple-choice": "法規選擇題",
    },
    pdfs: [
      { label: "Signs T/F", file: "汽車標誌是非題-中文+1131106.pdf" },
      { label: "Signs MC", file: "汽車標誌選擇題-中文1131106.pdf" },
      { label: "Regs T/F", file: "汽車法規是非題-中文1131114.pdf" },
      { label: "Regs MC", file: "汽車法規選擇題-中文1131114.pdf" },
    ],
  },
  {
    code: "ja",
    name: "日文",
    filters: {
      all: "すべての問題",
      "signs-true-false": "標識 正誤問題",
      "signs-multiple-choice": "標識 選択問題",
      "regulations-true-false": "法規 正誤問題",
      "regulations-multiple-choice": "法規 選択問題",
    },
    pdfs: [
      { label: "Signs T/F", file: "汽車標誌是非題-日文1131106.pdf" },
      { label: "Signs MC", file: "汽車標誌選擇題-日文1131106.pdf" },
      { label: "Regs T/F", file: "汽車法規是非題-日文1130319.pdf" },
      { label: "Regs MC", file: "汽車法規選擇題-日文1130815.pdf" },
    ],
  },
  {
    code: "vi",
    name: "越南文",
    filters: {
      all: "Tất cả câu hỏi",
      "signs-true-false": "Biển báo Đúng/Sai",
      "signs-multiple-choice": "Biển báo Trắc nghiệm",
      "regulations-true-false": "Luật giao thông Đúng/Sai",
      "regulations-multiple-choice": "Luật giao thông Trắc nghiệm",
    },
    pdfs: [
      { label: "Signs T/F", file: "汽車標誌是非題-越南文1131106.pdf" },
      { label: "Signs MC", file: "汽車標誌選擇題-越南文-1131106.pdf" },
      { label: "Regs T/F", file: "汽車法規是非題-越南文+1131106.pdf" },
      { label: "Regs MC", file: "汽車法規選擇題-越南文1130718.pdf" },
    ],
  },
  {
    code: "id",
    name: "印尼文",
    filters: {
      all: "Semua Soal",
      "signs-true-false": "Rambu Benar/Salah",
      "signs-multiple-choice": "Rambu Pilihan Ganda",
      "regulations-true-false": "Peraturan Benar/Salah",
      "regulations-multiple-choice": "Peraturan Pilihan Ganda",
    },
    pdfs: [
      { label: "Signs T/F", file: "汽車標誌是非題-印尼文1131106.pdf" },
      { label: "Signs MC", file: "汽車標誌選擇題-印尼文1131106.pdf" },
      { label: "Regs T/F", file: "汽車法規是非題-印尼文-1130731.pdf" },
      { label: "Regs MC", file: "汽車法規選擇題-印尼文-1131017.pdf" },
    ],
  },
  {
    code: "th",
    name: "泰文",
    filters: {
      all: "ทุกข้อ",
      "signs-true-false": "ป้ายจราจร ถูก/ผิด",
      "signs-multiple-choice": "ป้ายจราจร ปรนัย",
      "regulations-true-false": "กฎจราจร ถูก/ผิด",
      "regulations-multiple-choice": "กฎจราจร ปรนัย",
    },
    pdfs: [
      { label: "Signs T/F", file: "汽車標誌是非題-泰文1131106.pdf" },
      { label: "Signs MC", file: "汽車標誌選擇題-泰文1131106.pdf" },
      { label: "Regs T/F", file: "汽車法規是非題-泰文1130320.pdf" },
      { label: "Regs MC", file: "汽車法規選擇題-泰文1130815.pdf" },
    ],
  },
  {
    code: "my",
    name: "緬甸文",
    filters: {
      all: "မေးခွန်းအားလုံး",
      "signs-true-false": "လမ်းသင်္ကေတ မှန်/မှား",
      "signs-multiple-choice": "လမ်းသင်္ကေတ အမျိုးအစားရွေးချယ်",
      "regulations-true-false": "စည်းမျဉ်း မှန်/မှား",
      "regulations-multiple-choice": "စည်းမျဉ်း အမျိုးအစားရွေးချယ်",
    },
    pdfs: [
      { label: "Signs T/F", file: "汽車標誌是非題-緬甸文-1131106.pdf" },
      { label: "Signs MC", file: "汽車標誌選擇題-緬甸文-1131106.pdf" },
      { label: "Regs T/F", file: "汽車法規是非題-緬文1120824.pdf" },
      { label: "Regs MC", file: "汽車法規選擇題-緬文1130815.pdf" },
    ],
  },
  {
    code: "km",
    name: "柬文",
    filters: {
      all: "សំណួរទាំងអស់",
      "signs-true-false": "សញ្ញា ត្រូវ/មិនត្រូវ",
      "signs-multiple-choice": "សញ្ញា ជ្រើសរើស",
      "regulations-true-false": "បទប្បញ្ញត្តិ ត្រូវ/មិនត្រូវ",
      "regulations-multiple-choice": "បទប្បញ្ញត្តិ ជ្រើសរើស",
    },
    pdfs: [
      { label: "Signs T/F", file: "汽車標誌是非題-柬文1131106.pdf" },
      { label: "Signs MC", file: "汽車標誌選擇題-柬文1131106.pdf" },
      { label: "Regs T/F", file: "汽車法規是非題-柬文1130320.pdf" },
      { label: "Regs MC", file: "汽車法規選擇題-柬文1130815.pdf" },
    ],
  },
];

let allQuestions = [];
let filteredQuestions = [];
let currentQuestionIndex = 0;
let favorites = new Set();
let activeLanguage = "en";
let currentFetchController = null;

function favKey() {
  return `favorites_${activeLanguage}`;
}

// Load favorites from localStorage
function loadFavorites() {
  const saved = localStorage.getItem(favKey());
  if (saved) {
    favorites = new Set(JSON.parse(saved));
  } else {
    favorites = new Set();
  }
}

// Save favorites to localStorage
function saveFavorites() {
  localStorage.setItem(favKey(), JSON.stringify([...favorites]));
}

// Toggle favorite
function toggleFavorite(questionId) {
  if (favorites.has(questionId)) {
    favorites.delete(questionId);
  } else {
    favorites.add(questionId);
  }
  saveFavorites();
  renderQuestion();
  renderIndex();
}

async function loadQuestions(lang = "en") {
  // Abort any in-flight fetch
  if (currentFetchController) currentFetchController.abort();
  currentFetchController = new AbortController();
  const { signal } = currentFetchController;

  // Show loading state
  document.getElementById("question-container").innerHTML =
    '<div class="loading-state"><p>Loading questions...</p></div>';

  try {
    const response = await fetch(`./questions/${lang}.json`, { signal });
    if (!response.ok) throw new Error("Not found");
    allQuestions = await response.json();
    filteredQuestions = [...allQuestions];
    currentQuestionIndex = 0;
    // Reset filter UI to "all"
    renderFilters();
    loadFavorites();
    updateStats();
    renderQuestion();
    renderIndex();
  } catch (error) {
    if (error.name === "AbortError") return;
    document.getElementById("question-container").innerHTML = `
      <div class="empty-state">
        <h2>Questions unavailable</h2>
        <p>Questions for this language are not yet available.</p>
      </div>
    `;
  }
}

function updateStats() {
  document.getElementById("total-count").textContent = filteredQuestions.length;
}

function renderQuestion() {
  const container = document.getElementById("question-container");

  if (filteredQuestions.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><h2>No questions match your filters</h2></div>';
    return;
  }

  const question = filteredQuestions[currentQuestionIndex];
  const typeLabel = question.type === "signs" ? "Traffic Signs" : "Regulations";
  const formatLabel =
    question.format === "true-false" ? "True/False" : "Multiple Choice";
  const isFavorited = favorites.has(question.id);

  container.innerHTML = `
    <div class="question-card">
      <div class="question-header">
        <span class="question-number">Question ${question.number}</span>
        <div>
          <button class="favorite-btn ${isFavorited ? "favorited" : ""}" id="favorite-btn" title="Add to favorites">★</button>
          <span class="question-type">${typeLabel} • ${formatLabel}</span>
        </div>
      </div>
      ${question.image ? `<div class="question-image"><img src="${question.image}" alt="Question illustration"></div>` : ""}
      <div class="question-text">${question.question}</div>
      <div class="options">
        ${question.options
          .map((opt) => {
            const isTF = opt.label === "True" || opt.label === "False";
            const display =
              opt.label === "True"
                ? "〇"
                : opt.label === "False"
                  ? "✕"
                  : `<strong>${opt.label}.</strong> ${opt.text}`;
            return `
          <div class="option${isTF ? " true-false-opt" : ""}" data-answer="${opt.label}">
            ${display}
          </div>
        `;
          })
          .join("")}
      </div>
      <div id="feedback"></div>
      <div class="controls">
        <button class="btn btn-secondary" id="prev-btn" ${currentQuestionIndex === 0 ? "disabled" : ""}>Previous</button>
        <button class="btn btn-random" id="random-btn">🎲 Random</button>
        <button class="btn btn-primary" id="next-btn">Next</button>
      </div>
    </div>
  `;

  // Add favorite button listener
  document.getElementById("favorite-btn")?.addEventListener("click", () => {
    toggleFavorite(question.id);
  });

  // Add event listeners
  document.querySelectorAll(".option").forEach((opt) => {
    opt.addEventListener("click", () =>
      handleAnswer(opt.dataset.answer, question),
    );
  });

  document.getElementById("prev-btn")?.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion();
    }
  });

  document.getElementById("next-btn")?.addEventListener("click", () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    }
  });

  document.getElementById("random-btn")?.addEventListener("click", () => {
    const next = Math.floor(Math.random() * filteredQuestions.length);
    currentQuestionIndex = next;
    renderQuestion();
    renderIndex();
  });
}

function handleAnswer(selected, question) {
  const options = document.querySelectorAll(".option");
  const feedback = document.getElementById("feedback");

  options.forEach((opt) => (opt.style.pointerEvents = "none"));

  const isCorrect = selected === question.answer;

  options.forEach((opt) => {
    if (opt.dataset.answer === question.answer) {
      opt.classList.add("correct");
    } else if (opt.dataset.answer === selected && !isCorrect) {
      opt.classList.add("incorrect");
    }
  });

  if (isCorrect) {
    feedback.innerHTML = '<div class="feedback correct">✓ Correct!</div>';
  } else {
    feedback.innerHTML = `<div class="feedback incorrect">✗ Incorrect. The correct answer is ${question.answer}.</div>`;
  }
}

async function switchLanguage(langCode) {
  if (langCode === activeLanguage) return;
  activeLanguage = langCode;
  localStorage.setItem("active_language", langCode);
  renderLangSelector();
  renderFilters();
  await loadQuestions(activeLanguage);
}

function renderLangSelector() {
  const container = document.getElementById("lang-selector");
  if (!container) return;

  container.innerHTML = `
    <select id="lang-select" class="header-select">
      ${LANGUAGES.map((lang) => `<option value="${lang.code}" ${lang.code === activeLanguage ? "selected" : ""}>${lang.name}</option>`).join("")}
    </select>
    <select id="pdf-select" class="header-select">
      <option value="">PDF downloads</option>
      ${(LANGUAGES.find((l) => l.code === activeLanguage)?.pdfs ?? []).map((p) => `<option value="${p.file}">${p.file}</option>`).join("")}
    </select>
  `;

  document.getElementById("lang-select").addEventListener("change", (e) => {
    switchLanguage(e.target.value);
  });

  document.getElementById("pdf-select").addEventListener("change", (e) => {
    const file = e.target.value;
    if (!file) return;
    const a = document.createElement("a");
    a.href = `/res/${encodeURIComponent(file)}`;
    a.download = file;
    a.click();
    e.target.value = "";
  });
}

function renderFilters() {
  const lang = LANGUAGES.find((l) => l.code === activeLanguage);
  const labels = lang?.filters ?? LANGUAGES[0].filters;
  const filterKeys = Object.keys(labels);
  const activeFilter = (() => {
    const activeBtn = document.querySelector(".filter-btn.active");
    return activeBtn?.dataset.filter ?? "all";
  })();

  const filtersDiv = document.getElementById("filters");
  const filterSelect = document.getElementById("filter-select");
  if (!filtersDiv || !filterSelect) return;

  filtersDiv.innerHTML = filterKeys
    .map(
      (key) =>
        `<button class="filter-btn ${key === activeFilter ? "active" : ""}" data-filter="${key}">${labels[key]}</button>`,
    )
    .join("");

  filterSelect.innerHTML = filterKeys
    .map((key) => `<option value="${key}">${labels[key]}</option>`)
    .join("");
  filterSelect.value = activeFilter;

  filtersDiv.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });
  filterSelect.addEventListener("change", (e) => applyFilter(e.target.value));
}

function applyFilter(filter) {
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.filter === filter);
  });
  const filterSelect = document.getElementById("filter-select");
  if (filterSelect) filterSelect.value = filter;

  filteredQuestions =
    filter === "all"
      ? [...allQuestions]
      : allQuestions.filter((q) => `${q.type}-${q.format}` === filter);
  currentQuestionIndex = 0;
  updateStats();
  renderQuestion();
  renderIndex();
}

// Initialize: restore persisted language or fall back to English
{
  const persisted = localStorage.getItem("active_language");
  const validCodes = LANGUAGES.map((l) => l.code);
  activeLanguage = validCodes.includes(persisted) ? persisted : "en";
  renderLangSelector();
  renderFilters();
  loadQuestions(activeLanguage);
}

// Mobile index toggle
document.getElementById("index-toggle")?.addEventListener("click", () => {
  const panel = document.getElementById("index-panel");
  const btn = document.getElementById("index-toggle");
  const isOpen = panel.classList.toggle("open");
  btn.textContent = isOpen ? "✕ Close Index" : "☰ Question Index";
  document.body.style.overflow = isOpen ? "hidden" : "";
});

// Render question index
function renderIndex() {
  const indexContent = document.getElementById("index-content");

  if (filteredQuestions.length === 0) {
    indexContent.innerHTML =
      '<p style="color: #666;">No questions to display</p>';
    return;
  }

  indexContent.innerHTML = filteredQuestions
    .map((q, idx) => {
      const isFavorited = favorites.has(q.id);
      const isActive = idx === currentQuestionIndex;
      return `
        <div class="index-item ${isActive ? "active" : ""} ${isFavorited ? "favorite" : ""}" data-index="${idx}">
          <span class="index-item-number">${q.number}</span>
        </div>
      `;
    })
    .join("");

  // Add click listeners
  document.querySelectorAll(".index-item").forEach((item) => {
    item.addEventListener("click", () => {
      currentQuestionIndex = parseInt(item.dataset.index);
      // Close index panel on mobile
      const panel = document.getElementById("index-panel");
      const btn = document.getElementById("index-toggle");
      panel.classList.remove("open");
      btn.textContent = "☰ Question Index";
      document.body.style.overflow = "";
      renderQuestion();
      renderIndex();
    });
  });

  // Scroll active item into view
  const activeItem = document.querySelector(".index-item.active");
  if (activeItem) {
    activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
