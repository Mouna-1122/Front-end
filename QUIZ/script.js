const quizData = [
    { question: "What does HTML stand for?", options: ["HyperText Markup Language", "HighText Machine Language", "Hyper Transfer Markup Language"], answer: 0 },
    { question: "Which CSS property changes text color?", options: ["background-color", "font-color", "color"], answer: 2 },
    { question: "Which tag is used for JavaScript?", options: ["<js>", "<script>", "<javascript>"], answer: 1 },
    { question: "Which HTML element is used to define the largest heading?", options: ["<head>", "<h1>", "<heading>"], answer: 1 },
    { question: "What does CSS stand for?", options: ["Cascading Style Sheets", "Creative Style System", "Colorful Style Syntax"], answer: 0 },
    { question: "Which symbol is used for IDs in CSS selectors?", options: [".", "#", "*"], answer: 1 },
    { question: "Which method is used to fetch an element by ID in JS?", options: ["getElementById()", "querySelectorAll()", "getElementsByClassName()"], answer: 0 }
];

let currentQuestion = 0;
let score = 0;
let selectedAnswers = Array(quizData.length).fill(null);

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const submitBtn = document.getElementById("submit-btn");
const resultEl = document.getElementById("result");
const scoreEl = document.getElementById("score");
const progressEl = document.getElementById("progress");
const factBtn = document.getElementById("fact-btn");
const factEl = document.getElementById("fact");

function loadQuestion() {
    let q = quizData[currentQuestion];
    questionEl.textContent = q.question;
    progressEl.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
    optionsEl.innerHTML = "";

    q.options.forEach((opt, index) => {
        let btn = document.createElement("button");
        btn.textContent = opt;
        btn.classList.add("option-btn");

        if (selectedAnswers[currentQuestion] === index) {
            btn.style.backgroundColor = "#CC66DA";
        }

        btn.onclick = () => {
            selectedAnswers[currentQuestion] = index;
            document.querySelectorAll(".option-btn").forEach(b => b.style.backgroundColor = "#9929EA");
            btn.style.backgroundColor = "#CC66DA";
        };
        optionsEl.appendChild(btn);
    });

    prevBtn.style.display = currentQuestion > 0 ? "inline-block" : "none";
    nextBtn.style.display = currentQuestion < quizData.length - 1 ? "inline-block" : "none";
    submitBtn.classList.toggle("hidden", currentQuestion !== quizData.length - 1);
}

nextBtn.addEventListener("click", () => {
    if (selectedAnswers[currentQuestion] === null) {
        alert("Please select an option before moving to the next question.");
        return;
    }
    currentQuestion++;
    loadQuestion();
});

prevBtn.addEventListener("click", () => {
    currentQuestion--;
    loadQuestion();
});

submitBtn.addEventListener("click", () => {
    if (selectedAnswers[currentQuestion] === null) {
        alert("Please select an option before submitting.");
        return;
    }
    score = selectedAnswers.reduce((acc, answer, i) => 
        answer === quizData[i].answer ? acc + 1 : acc, 0);
    showResult();
});

function showResult() {
    document.getElementById("quiz-container").classList.add("hidden");
    resultEl.classList.remove("hidden");
    scoreEl.textContent = `${score}/${quizData.length}`;
}

function restartQuiz() {
    score = 0;
    currentQuestion = 0;
    selectedAnswers.fill(null);
    resultEl.classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");
    loadQuestion();
}

//external API
factBtn.addEventListener("click", async () => {
    factEl.textContent = "Loading fact...";
    try {
        const response = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
        const data = await response.json();
        factEl.textContent = data.text;
    } catch (error) {
        factEl.textContent = "Failed to fetch fact.";
    }
});

loadQuestion();
