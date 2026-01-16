// --- KONFIGURASJON ---
const maxLevels = 5;       // Totalt antall nivåer (Rom)
const tasksPerLevel = 7;   // Hvor mange oppgaver per nivå
let currentLevel = 1;
let tasksSolved = 0;       // Hvor mange oppgaver løst i NÅVÆRENDE nivå
let difficulty = 1;        // 1 = Rekrutt, 2 = Hacker (settes ved start)
let currentAnswer = 0;
let timeLeft = 1200;       // 20 minutter
let timerInterval;

const vars = ['x', 'y', 'a', 'b', 'n', 'k', 'z']; 

// HTML-elementer
let timerElement, logElement, questionText, levelTitle, inputField, levelIndicator, progressBar, subProgressText;

document.addEventListener('DOMContentLoaded', function() {
    timerElement = document.getElementById('timer');
    logElement = document.getElementById('log-console');
    questionText = document.getElementById('question-text');
    levelTitle = document.getElementById('level-title');
    inputField = document.getElementById('user-input');
    levelIndicator = document.getElementById('level-indicator');
    progressBar = document.getElementById('progress-fill');
    subProgressText = document.getElementById('sub-progress-text');
});

// --- START SPILLET ---
function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    
    // Skjul startskjerm, vis spill
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-terminal').style.display = 'block';
    
    // Start klokke og generer første oppgave
    startTimer();
    updateUI();
    generateQuestion();
}

// --- HJELPERE ---
function getVar() { return vars[Math.floor(Math.random() * vars.length)]; }
function getNum(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// --- GENERER OPPGAVE ---
function generateQuestion() {
    let v = getVar();
    let v2 = getVar();
    // Pass på at vi ikke får samme bokstav to ganger
    while(v2 === v) { v2 = getVar(); }

    let q = "";
    let a = 0;
    let n1, n2, n3, res;

    // --- REKRUTT (NIVÅ 1 - ENKLERE) ---
    if (difficulty === 1) {
        switch(currentLevel) {
            case 1: // Enkel substitusjon (x + tall)
                levelTitle.innerText = "Nivå 1: Variabler";
                n1 = getNum(2, 10); // x-verdi
                n2 = getNum(1, 10); // Tillegg
                if(Math.random() > 0.5) {
                    q = `Hvis <span style="color:white">${v} = ${n1}</span>,<br>hva er <b>${v} + ${n2}</b>?`;
                    a = n1 + n2;
                } else {
                    q = `Hvis <span style="color:white">${v} = ${n1}</span>,<br>hva er <b>${v} - ${n2}</b>?`;
                    a = n1 - n2;
                }
                break;
            case 2: // Ganging (3x)
                levelTitle.innerText = "Nivå 2: Koeffisienter";
                n1 = getNum(2, 5); // Koeffisient
                n2 = getNum(2, 6); // x-verdi
                q = `Hvis <span style="color:white">${v} = ${n2}</span>,<br>hva er <b>${n1}${v}</b>?`;
                a = n1 * n2;
                break;
            case 3: // Uttrykk (2x + 1)
                levelTitle.innerText = "Nivå 3: Uttrykk";
                n1 = getNum(2, 4);
                n2 = getNum(2, 5); // x-verdi
                n3 = getNum(1, 10);
                q = `Regn ut <b>${n1}${v} + ${n3}</b><br>når <span style="color:white">${v} = ${n2}</span>`;
                a = (n1 * n2) + n3;
                break;
            case 4: // Enkel likning (x + 5 = 10)
                levelTitle.innerText = "Nivå 4: Likninger";
                a = getNum(2, 15); // Svaret (x)
                n1 = getNum(2, 10);
                res = a + n1;
                q = `Finn ${v}:<br><b>${v} + ${n1} = ${res}</b>`;
                break;
            case 5: // Likning med ganging (2x = 10)
                levelTitle.innerText = "Nivå 5: Divisjon";
                a = getNum(2, 10); // Svaret (x)
                n1 = getNum(2, 5); // Faktor
                res = a * n1;
                q = `Finn ${v}:<br><b>${n1}${v} = ${res}</b>`;
                break;
        }
    } 
    
    // --- HACKER (NIVÅ 2 - VANSKELIGERE) ---
    else {
        switch(currentLevel) {
            case 1: // Substitusjon med minus
                levelTitle.innerText = "Nivå 1: Negative tall";
                n1 = getNum(5, 12); // x-verdi
                n2 = getNum(2, 8); 
                q = `Regn ut <b>${n2} - ${v}</b><br>når <span style="color:white">${v} = ${n1}</span>`;
                a = n2 - n1;
                break;
            case 2: // Uttrykk med to ledd (3x - 2)
                levelTitle.innerText = "Nivå 2: Uttrykk";
                n1 = getNum(3, 6);
                n2 = getNum(2, 5); // x-verdi
                n3 = getNum(5, 15);
                q = `Regn ut <b>${n1}${v} - ${n3}</b><br>når <span style="color:white">${v} = ${n2}</span>`;
                a = (n1 * n2) - n3;
                break;
            case 3: // Parenteser 2(x + 1)
                levelTitle.innerText = "Nivå 3: Parenteser";
                n1 = getNum(2, 4); // Foran parentes
                n2 = getNum(2, 6); // x-verdi
                n3 = getNum(1, 5); // Inni parentes
                q = `Regn ut <b>${n1}(${v} + ${n3})</b><br>når <span style="color:white">${v} = ${n2}</span>`;
                a = n1 * (n2 + n3);
                break;
            case 4: // To variabler (2a + b)
                levelTitle.innerText = "Nivå 4: To variabler";
                n1 = getNum(2, 5); // a-verdi
                n2 = getNum(2, 5); // b-verdi
                q = `Hvis <span style="color:white">${v} = ${n1}</span> og <span style="color:white">${v2} = ${n2}</span><br>hva er <b>2${v} + ${v2}</b>?`;
                a = (2 * n1) + n2;
                break;
            case 5: // To-trinns likning (2x + 4 = 14)
                levelTitle.innerText = "Nivå 5: Avansert likning";
                a = getNum(3, 10); // Svaret (x)
                n1 = getNum(2, 5); // Koeffisient
                n2 = getNum(2, 10); // Konstant
                res = (n1 * a) + n2;
                q = `Finn ${v}:<br><b>${n1}${v} + ${n2} = ${res}</b>`;
                break;
        }
    }

    currentAnswer = a;
    questionText.innerHTML = q;
    inputField.value = '';
    setTimeout(() => inputField.focus(), 100);
}

// --- SJEKK SVAR ---
function handleEnter(event) { if (event.key === 'Enter') checkAnswer(); }

function checkAnswer() {
    let userVal = parseInt(inputField.value);

    if (isNaN(userVal)) {
        logElement.innerText = "> FEIL: Skriv et tall.";
        logElement.style.color = "orange";
        return;
    }

    if (userVal === currentAnswer) {
        // RIKTIG
        tasksSolved++;
        logElement.innerHTML = `> KODE GODKJENT. (${tasksSolved}/${tasksPerLevel})`;
        logElement.style.color = "#00ff41";
        
        // Oppdater under-progress (x av 7)
        updateUI();

        // Sjekk om nivået er ferdig
        if (tasksSolved >= tasksPerLevel) {
            logElement.innerHTML = `> NIVÅ ${currentLevel} FULLFØRT! Starter neste lag...`;
            currentLevel++;
            tasksSolved = 0; // Nullstill for neste nivå
            
            // Oppdater hoved-progress bar
            let totalProgress = ((currentLevel - 1) / maxLevels) * 100;
            progressBar.style.width = totalProgress + "%";

            if (currentLevel > maxLevels) {
                victory();
            } else {
                updateUI();
                setTimeout(generateQuestion, 1500); // Litt lengre pause ved nivåbytte
            }
        } else {
            // Ikke ferdig med nivået ennå, neste oppgave
            setTimeout(generateQuestion, 500);
        }

    } else {
        // FEIL
        logElement.innerText = "> UGYLDIG KODE. Genererer ny kryptering...";
        logElement.style.color = "red";
        inputField.classList.add('shake');
        setTimeout(() => {
            inputField.classList.remove('shake');
            inputField.value = '';
            generateQuestion(); // Ny oppgave ved feil (så man ikke bare gjetter)
        }, 800);
    }
}

function updateUI() {
    subProgressText.innerText = `${tasksSolved}/${tasksPerLevel}`;
    if(currentLevel <= maxLevels) {
        levelIndicator.innerText = `Nivå: ${currentLevel}/${maxLevels}`;
    }
}

function victory() {
    document.getElementById('game-terminal').style.display = 'none';
    document.getElementById('victory').classList.add('active');
    clearInterval(timerInterval);
}

function startTimer() {
    timerInterval = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        timerElement.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        
        if (timeLeft < 120) timerElement.style.color = "red";
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Tiden er ute!");
            location.reload();
        }
        timeLeft--;
    }, 1000);
}
