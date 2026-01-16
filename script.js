// --- KONFIGURASJON ---
const maxLevels = 5;
const tasksPerLevel = 7;
let currentLevel = 1;
let tasksSolved = 0;
let difficulty = 1; 
let currentAnswer = 0;
let timeLeft = 1200; 
let timerInterval;
const vars = ['x', 'y', 'a', 'b', 'n', 'k', 'z']; 

let timerElement, logElement, questionText, levelTitle, inputField, levelIndicator, progressBar, subProgressText, gameTerminal, startScreen;

window.onload = function() {
    console.log("System initializing...");
    timerElement = document.getElementById('timer');
    logElement = document.getElementById('log-console');
    questionText = document.getElementById('question-text');
    levelTitle = document.getElementById('level-title');
    inputField = document.getElementById('user-input');
    levelIndicator = document.getElementById('level-indicator');
    progressBar = document.getElementById('progress-fill');
    subProgressText = document.getElementById('sub-progress-text');
    gameTerminal = document.getElementById('game-terminal');
    startScreen = document.getElementById('start-screen');
};

window.startGame = function(selectedDifficulty) {
    difficulty = selectedDifficulty;
    if (startScreen) startScreen.classList.remove('active');
    if (gameTerminal) gameTerminal.style.display = 'block';
    startTimer();
    updateUI();
    generateQuestion();
    if (inputField) inputField.focus();
}

function generateQuestion() {
    let v = vars[Math.floor(Math.random() * vars.length)];
    let v2 = vars[Math.floor(Math.random() * vars.length)];
    while(v2 === v) { v2 = vars[Math.floor(Math.random() * vars.length)]; }

    // Hjelpefunksjon for å hente tall (inkluderer negative tall for Hacker)
    function getNum(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    let q = "", a = 0;
    let n1, n2, n3, res;

    // --- REKRUTT (NIVÅ 1 - ENKLERE) ---
    if (difficulty === 1) {
        switch(currentLevel) {
            case 1: // Variabler (x + 5)
                levelTitle.innerText = "Nivå 1: Variabler";
                n1 = getNum(5, 20); // Økt variasjon
                n2 = getNum(2, 10);
                if(Math.random() > 0.5) { 
                    q = `Hvis <span style="color:white">${v} = ${n1}</span>,<br>hva er <b>${v} + ${n2}</b>?`; a = n1 + n2; 
                } else { 
                    q = `Hvis <span style="color:white">${v} = ${n1}</span>,<br>hva er <b>${v} - ${n2}</b>?`; a = n1 - n2; 
                }
                break;
            case 2: // Koeffisienter (3x)
                levelTitle.innerText = "Nivå 2: Koeffisienter";
                n1 = getNum(2, 6); 
                n2 = getNum(3, 9); // Økt variasjon
                q = `Hvis <span style="color:white">${v} = ${n2}</span>,<br>hva er <b>${n1}${v}</b>?`; a = n1 * n2;
                break;
            case 3: // Uttrykk (2x + 3)
                levelTitle.innerText = "Nivå 3: Uttrykk";
                n1 = getNum(2, 5); 
                n2 = getNum(3, 8); 
                n3 = getNum(2, 12);
                q = `Regn ut <b>${n1}${v} + ${n3}</b><br>når <span style="color:white">${v} = ${n2}</span>`; a = (n1 * n2) + n3;
                break;
            case 4: // Enkel likning (x + 5 = 12)
                levelTitle.innerText = "Nivå 4: Likninger";
                a = getNum(3, 20); // Svaret kan være større
                n1 = getNum(2, 15);
                res = a + n1;
                q = `Finn ${v}:<br><b>${v} + ${n1} = ${res}</b>`;
                break;
            case 5: // Divisjon/Faktor (3x = 21)
                levelTitle.innerText = "Nivå 5: Divisjon";
                a = getNum(2, 12); 
                n1 = getNum(2, 6); 
                res = a * n1;
                q = `Finn ${v}:<br><b>${n1}${v} = ${res}</b>`;
                break;
        }
    } 
    // --- HACKER (NIVÅ 2 - VANSKELIGERE & MER VARIASJON) ---
    else {
        switch(currentLevel) {
            case 1: // Negative tall og parenteser
                levelTitle.innerText = "Nivå 1: Negative tall";
                n1 = getNum(-5, 15); // x kan være negativ
                n2 = getNum(5, 20);
                // Vi bytter på om vi spør om (n - x) eller (x - n)
                if (Math.random() > 0.5) {
                    q = `Regn ut <b>${n2} - ${v}</b><br>når <span style="color:white">${v} = ${n1}</span>`; 
                    a = n2 - n1;
                } else {
                    q = `Regn ut <b>${v} - ${n2}</b><br>når <span style="color:white">${v} = ${n1}</span>`; 
                    a = n1 - n2;
                }
                break;
            case 2: // Uttrykk (3x - 5 eller -2x + 5)
                levelTitle.innerText = "Nivå 2: Avanserte Uttrykk";
                n2 = getNum(-5, 8); // x-verdi
                n3 = getNum(5, 20); // Konstant
                if (Math.random() > 0.5) {
                    n1 = getNum(2, 6); // Positiv koeffisient
                    q = `Regn ut <b>${n1}${v} - ${n3}</b><br>når <span style="color:white">${v} = ${n2}</span>`; 
                    a = (n1 * n2) - n3;
                } else {
                    n1 = getNum(2, 5); // Negativt uttrykk
                    q = `Regn ut <b>-${n1}${v} + ${n3}</b><br>når <span style="color:white">${v} = ${n2}</span>`; 
                    a = (-n1 * n2) + n3;
                }
                break;
            case 3: // Parenteser 3(x+2) eller 3(x-2)
                levelTitle.innerText = "Nivå 3: Parenteser";
                n1 = getNum(2, 5); // Faktor
                n2 = getNum(2, 10); // x-verdi
                n3 = getNum(1, 8); // Ledd i parentes
                if (Math.random() > 0.5) {
                    q = `Regn ut <b>${n1}(${v} + ${n3})</b><br>når <span style="color:white">${v} = ${n2}</span>`; 
                    a = n1 * (n2 + n3);
                } else {
                    q = `Regn ut <b>${n1}(${v} - ${n3})</b><br>når <span style="color:white">${v} = ${n2}</span>`; 
                    a = n1 * (n2 - n3);
                }
                break;
            case 4: // To variabler (2a + b eller 2a - b)
                levelTitle.innerText = "Nivå 4: To variabler";
                n1 = getNum(2, 10); // a
                n2 = getNum(2, 10); // b
                n3 = getNum(2, 4); // Koeffisient
                if (Math.random() > 0.5) {
                    q = `Hvis <span style="color:white">${v} = ${n1}</span> og <span style="color:white">${v2} = ${n2}</span><br>hva er <b>${n3}${v} + ${v2}</b>?`; 
                    a = (n3 * n1) + n2;
                } else {
                    q = `Hvis <span style="color:white">${v} = ${n1}</span> og <span style="color:white">${v2} = ${n2}</span><br>hva er <b>${n3}${v} - ${v2}</b>?`; 
                    a = (n3 * n1) - n2;
                }
                break;
            case 5: // Likning (2x + 4 = 14) eller (2x - 4 = 10)
                levelTitle.innerText = "Nivå 5: Master Key";
                // Vi genererer svaret (x) først for å sikre heltall, men tillater negative svar nå
                a = getNum(-5, 12); 
                while(a === 0) { a = getNum(-5, 12); } // Unngå x=0 for spenningens skyld
                
                n1 = getNum(2, 6); // Koeffisient
                n2 = getNum(2, 20); // Konstant
                
                if (Math.random() > 0.5) {
                    res = (n1 * a) + n2;
                    q = `Finn ${v}:<br><b>${n1}${v} + ${n2} = ${res}</b>`;
                } else {
                    res = (n1 * a) - n2;
                    q = `Finn ${v}:<br><b>${n1}${v} - ${n2} = ${res}</b>`;
                }
                break;
        }
    }

    currentAnswer = a;
    questionText.innerHTML = q;
    inputField.value = '';
}

window.checkAnswer = function() {
    let userVal = parseInt(inputField.value);
    if (isNaN(userVal)) {
        logElement.innerText = "> FEIL: Skriv et tall.";
        logElement.style.color = "orange";
        return;
    }
    if (userVal === currentAnswer) {
        tasksSolved++;
        logElement.innerHTML = `> KODE GODKJENT. (${tasksSolved}/${tasksPerLevel})`;
        logElement.style.color = "#00ff41";
        updateUI();
        if (tasksSolved >= tasksPerLevel) {
            logElement.innerHTML = `> NIVÅ ${currentLevel} FULLFØRT! Starter neste lag...`;
            currentLevel++;
            tasksSolved = 0;
            let totalProgress = ((currentLevel - 1) / maxLevels) * 100;
            progressBar.style.width = totalProgress + "%";
            if (currentLevel > maxLevels) {
                victory();
            } else {
                updateUI();
                setTimeout(generateQuestion, 1500);
            }
        } else {
            setTimeout(generateQuestion, 500);
        }
    } else {
        logElement.innerText = "> UGYLDIG KODE. Prøv igjen.";
        logElement.style.color = "red";
        inputField.classList.add('shake');
        setTimeout(() => {
            inputField.classList.remove('shake');
            inputField.value = '';
            generateQuestion(); 
        }, 800);
    }
}

window.handleEnter = function(event) { if (event.key === 'Enter') checkAnswer(); }

function updateUI() {
    if (subProgressText) subProgressText.innerText = `${tasksSolved}/${tasksPerLevel}`;
    if (levelIndicator && currentLevel <= maxLevels) levelIndicator.innerText = `Nivå: ${currentLevel}/${maxLevels}`;
}

function victory() {
    gameTerminal.style.display = 'none';
    document.getElementById('victory').classList.add('active');
    clearInterval(timerInterval);
}

function startTimer() {
    timerInterval = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        if(timerElement) timerElement.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        if (timeLeft < 120 && timerElement) timerElement.style.color = "red";
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Tiden er ute!");
            location.reload();
        }
        timeLeft--;
    }, 1000);
}
