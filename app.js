let allQuestions = [];
let filteredQuestions = [];
let currentQuestionIndex = 0;
let favorites = new Set();

// Load favorites from localStorage
function loadFavorites() {
  const saved = localStorage.getItem("favorites");
  if (saved) {
    favorites = new Set(JSON.parse(saved));
  }
}

// Save favorites to localStorage
function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify([...favorites]));
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

async function loadQuestions() {
  try {
    const response = await fetch("./questions.json");
    allQuestions = await response.json();
    filteredQuestions = [...allQuestions];
    loadFavorites();
    updateStats();
    renderQuestion();
    renderIndex();
  } catch (error) {
    document.getElementById("question-container").innerHTML = `
      <div class="empty-state">
        <h2>No questions found</h2>
        <p>Run <code>npm run extract</code> to extract questions from PDFs</p>
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
          .map(
            (opt) => `
          <div class="option" data-answer="${opt.label}">
            <strong>${opt.label}.</strong> ${opt.text}
          </div>
        `,
          )
          .join("")}
      </div>
      <div id="feedback"></div>
      <div class="controls">
        <button class="btn btn-secondary" id="prev-btn" ${currentQuestionIndex === 0 ? "disabled" : ""}>Previous</button>
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

// Filter handling
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    if (filter === "all") {
      filteredQuestions = [...allQuestions];
    } else {
      // Filter by exact type-format combination
      filteredQuestions = allQuestions.filter((q) => {
        const questionKey = `${q.type}-${q.format}`;
        return questionKey === filter;
      });
    }

    currentQuestionIndex = 0;
    updateStats();
    renderQuestion();
    renderIndex();
  });
});

loadQuestions();

// Mobile index toggle
document.getElementById("index-toggle")?.addEventListener("click", () => {
  const panel = document.getElementById("index-panel");
  const btn = document.getElementById("index-toggle");
  const isOpen = panel.classList.toggle("open");
  btn.textContent = isOpen ? "✕ Close Index" : "☰ Question Index";
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
