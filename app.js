// Данните се пазят в един ключ, за да не се смесват с други сайтове.
const STORAGE_KEYS = { goals: "inforcePortfolioGoals", theme: "inforcePortfolioTheme" };

const defaultGoals = [
  { id: "default-javascript", text: "Групова разработка", description: "Да се науча да планирам и реализирам проекти съвместно с други хора, като разпределяме задачите и работим за постигането на общ резултат.", firstStep: "Участие в разработването на малък групов проект с предварително разпределени задачи.", completed: false },
  { id: "default-dom", text: "Работа в програмистки екип", description: "Да разбера как програмистите комуникират, споделят код и работят заедно при решаването на технически проблеми.", firstStep: "Да създам GitHub хранилище и да упражня основните операции с Git, включително качване и споделяне на код.", completed: false },
  { id: "default-git", text: "Самостоятелна разработка на проекти", description: "Да мога самостоятелно или в екип да планирам, разработвам и тествам проект от началото до края.", firstStep: "Създаване и тестване на малки проекти с конкретни функционалности, например настоящото интерактивно портфолио.", completed: false }
];
const previousDefaultTexts = {
  "default-javascript": "Усвояване на JavaScript – първа стъпка: създаване на малки програми с променливи, функции и условия.",
  "default-dom": "Работа с DOM и интерактивност – първа стъпка: създаване на интерактивна страница с JavaScript събития.",
  "default-git": "Работа с Git и GitHub – първа стъпка: създаване на хранилище и качване на първия проект."
};

const elements = {
  form: document.querySelector("#goal-form"), input: document.querySelector("#goal-input"), message: document.querySelector("#form-message"),
  list: document.querySelector("#goal-list"), total: document.querySelector("#total-goals"), completed: document.querySelector("#completed-goals"),
  percent: document.querySelector("#progress-percent"), progressBar: document.querySelector("#progress-bar"), filters: document.querySelectorAll(".filter-button"),
  themeToggle: document.querySelector("#theme-toggle"), themeLabel: document.querySelector(".theme-label")
};

let goals = loadGoals();
let activeFilter = "all";

function canUseStorage() {
  try { localStorage.setItem("inforceStorageCheck", "1"); localStorage.removeItem("inforceStorageCheck"); return true; } catch (error) { return false; }
}

function loadGoals() {
  if (!canUseStorage()) return defaultGoals.map((goal) => ({ ...goal }));
  const savedGoals = localStorage.getItem(STORAGE_KEYS.goals);
  if (savedGoals === null) { localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(defaultGoals)); return defaultGoals.map((goal) => ({ ...goal })); }
  try {
    const parsedGoals = JSON.parse(savedGoals);
    if (!Array.isArray(parsedGoals)) throw new Error("Saved goals are not an array.");
    return parsedGoals.filter((goal) => typeof goal.id === "string" && typeof goal.text === "string" && typeof goal.completed === "boolean").map((goal) => {
      const updatedDefault = defaultGoals.find((item) => item.id === goal.id);
      const isUnmodifiedLegacyDefault = updatedDefault && goal.text === previousDefaultTexts[goal.id];
      return isUnmodifiedLegacyDefault ? { ...updatedDefault, completed: goal.completed } : goal;
    });
  } catch (error) { return []; }
}

function saveGoals() { if (canUseStorage()) localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals)); }
function normalizeGoal(text) { return text.trim().toLocaleLowerCase("bg-BG"); }
function createGoalId() { return `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

function showMessage(message) { elements.message.textContent = message; }

function addGoal(event) {
  event.preventDefault();
  const goalText = elements.input.value.trim();
  if (!goalText) { showMessage("Моля, въведете учебна цел. Полето не може да е празно."); return; }
  if (goals.some((goal) => normalizeGoal(goal.text) === normalizeGoal(goalText))) { showMessage("Тази учебна цел вече е добавена."); return; }
  goals.push({ id: createGoalId(), text: goalText, completed: false });
  saveGoals(); elements.input.value = ""; showMessage(""); render(); elements.input.focus();
}

function updateGoalStatus(id) { goals = goals.map((goal) => goal.id === id ? { ...goal, completed: !goal.completed } : goal); saveGoals(); render(); }

function editGoal(id) {
  const goal = goals.find((item) => item.id === id);
  if (!goal) return;
  const enteredText = window.prompt("Редактирайте учебната цел:", goal.text);
  if (enteredText === null) return;
  const goalText = enteredText.trim();
  if (!goalText) { showMessage("Моля, въведете учебна цел. Полето не може да е празно."); return; }
  const duplicateExists = goals.some((item) => item.id !== id && normalizeGoal(item.text) === normalizeGoal(goalText));
  if (duplicateExists) { showMessage("Тази учебна цел вече е добавена."); return; }
  goals = goals.map((item) => item.id === id ? { ...item, text: goalText } : item);
  saveGoals(); showMessage(""); render();
}

function deleteGoal(id) {
  const goal = goals.find((item) => item.id === id);
  if (!goal) return;
  if (window.confirm(`Сигурни ли сте, че искате да изтриете целта „${goal.text}“?`)) { goals = goals.filter((item) => item.id !== id); saveGoals(); render(); }
}

function getFilteredGoals() {
  if (activeFilter === "active") return goals.filter((goal) => !goal.completed);
  if (activeFilter === "completed") return goals.filter((goal) => goal.completed);
  return goals;
}

function getEmptyMessage() {
  if (goals.length === 0) return { title: "Няма добавени учебни цели", text: "Добавете първата си цел чрез полето по-горе." };
  if (activeFilter === "active") return { title: "Няма активни цели", text: "Всички добавени цели са завършени." };
  if (activeFilter === "completed") return { title: "Няма завършени цели", text: "Отбележете цел като завършена, когато я изпълните." };
  return { title: "Няма резултати", text: "Няма цели за избрания филтър." };
}

function createGoalCard(goal) {
  const card = document.createElement("article"); card.className = `goal-card${goal.completed ? " is-completed" : ""}`;
  const content = document.createElement("div"); content.className = "goal-content";
  const title = document.createElement("h3"); title.className = "goal-title"; title.textContent = goal.text; content.append(title);
  if (goal.description) { const description = document.createElement("p"); description.className = "goal-description"; description.textContent = goal.description; content.append(description); }
  if (goal.firstStep) { const step = document.createElement("p"); step.className = "goal-first-step"; const label = document.createElement("strong"); label.textContent = "Първа стъпка: "; step.append(label, document.createTextNode(goal.firstStep)); content.append(step); }
  const status = document.createElement("span"); status.className = "status-badge"; status.textContent = goal.completed ? "Завършена" : "Активна";
  const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "icon-button"; toggle.textContent = goal.completed ? "Върни" : "Завърши"; toggle.setAttribute("aria-label", `${toggle.textContent} цел: ${goal.text}`); toggle.addEventListener("click", () => updateGoalStatus(goal.id));
  const edit = document.createElement("button"); edit.type = "button"; edit.className = "icon-button"; edit.textContent = "Редактирай"; edit.setAttribute("aria-label", `Редактирай цел: ${goal.text}`); edit.addEventListener("click", () => editGoal(goal.id));
  const remove = document.createElement("button"); remove.type = "button"; remove.className = "icon-button delete-button"; remove.textContent = "Изтрий"; remove.setAttribute("aria-label", `Изтрий цел: ${goal.text}`); remove.addEventListener("click", () => deleteGoal(goal.id));
  card.append(content, status, toggle, edit, remove); return card;
}

function renderGoals() {
  elements.list.replaceChildren(); const visibleGoals = getFilteredGoals();
  if (visibleGoals.length === 0) { const empty = getEmptyMessage(); const box = document.createElement("div"); box.className = "empty-state"; const title = document.createElement("h3"); title.textContent = empty.title; const text = document.createElement("p"); text.textContent = empty.text; box.append(title, text); elements.list.append(box); return; }
  visibleGoals.forEach((goal) => elements.list.append(createGoalCard(goal)));
}

function renderProgress() {
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const progress = goals.length === 0 ? 0 : Math.round((completedGoals / goals.length) * 100);
  elements.total.textContent = goals.length; elements.completed.textContent = completedGoals; elements.percent.textContent = `${progress}%`; elements.progressBar.style.width = `${progress}%`;
}

function renderFilters() { elements.filters.forEach((button) => { const selected = button.dataset.filter === activeFilter; button.classList.toggle("is-active", selected); button.setAttribute("aria-pressed", String(selected)); }); }
function render() { renderGoals(); renderProgress(); renderFilters(); }

function applyTheme(theme) { const darkTheme = theme === "dark"; document.body.classList.toggle("dark-theme", darkTheme); elements.themeToggle.setAttribute("aria-pressed", String(darkTheme)); elements.themeToggle.setAttribute("aria-label", darkTheme ? "Включи светла тема" : "Включи тъмна тема"); elements.themeLabel.textContent = darkTheme ? "Светла тема" : "Тъмна тема"; }
function loadTheme() { const savedTheme = canUseStorage() ? localStorage.getItem(STORAGE_KEYS.theme) : null; applyTheme(savedTheme === "dark" ? "dark" : "light"); }
function toggleTheme() { const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark"; applyTheme(nextTheme); if (canUseStorage()) localStorage.setItem(STORAGE_KEYS.theme, nextTheme); }

elements.form.addEventListener("submit", addGoal);
elements.filters.forEach((button) => button.addEventListener("click", () => { activeFilter = button.dataset.filter; render(); }));
elements.themeToggle.addEventListener("click", toggleTheme);
loadTheme(); render();
