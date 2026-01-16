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

let timerElement, logElement, questionText, levelTitle, inputField, levelIndicator, progressBar, subProgressText, gameWrapper, startScreen, gearBox, lockStateText;

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
    gameWrapper = document.getElementById('game-wrapper');
    startScreen = document.getElementById('start-screen');
    gearBox = document.getElementById('gear-box');
    lockStateText = document.getElementById('lock-state');
};

window.startGame = function(selectedDifficulty) {
    difficulty = selectedDifficulty;
    if (startScreen) startScreen.classList.remove('active');
    if (gameWrapper) gameWrapper.style.display = 'flex'; // Bruker flex for side-by-side
    startTimer();
    updateUI();
    generateQuestion();
    if (inputField) inputField.focus();
}

function activateGears() {
    // Legg til klassen som starter animasjonen
    gearBox.classList.remove('active-spin'); // Reset først
    void gearBox.offsetWidth; // Tving "reflow" for å restarte animasjon
    gearBox.classList.add('active-spin');
    
    // Oppdater status tekst
    lockStateText.innerText = "ÅPNER...";
    lockStateText.style.color = "#00ff41";

    // Fjern etter 2 sekunder
    setTimeout(() => {
        // Vi beholder klassen litt lenger eller fjerner den, 
        // men teksten settes tilbake til låst
        lockStateText.innerText = "LÅST";
        lockStateText.style.color = "red";
    }, 2000);
}

function generateQuestion() {
    let v = vars[Math.floor(Math.random() * vars.length)];
    let v2 = vars[Math.floor(Math.random() * vars.length)];
    while(v2 === v) { v2 = vars[Math.floor(Math.random() * vars.length)]; }

    function getNum(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    let q = "", a = 0;
    let n1, n2, n3, res;

    // --- REKRUTT (NIVÅ 1 - ENKLERE) ---
    if (difficulty === 1) {
        switch(currentLevel) {
            case 1: 
                levelTitle.innerText = "Nivå 1: Variabler";
                n1 = getNum(5, 20); n2 = getNum(2, 10);
                if(Math.random() > 0.5) { q = `Hvis <span style="color:white">${v} = ${n1}</span>,<br>hva er <b>${v} + ${n2}</b>?`; a = n1 + n2; } 
                else { q = `Hvis <span style="color:white">${v} = ${n1}</span>,<br>hva er <b>${v} - ${n2}</b>?`; a = n1 - n2; }
                break;
            case 2: 
                levelTitle.innerText = "Nivå 2: Koeffisienter";
                n1 = getNum(2, 6); n2 = getNum(3, 9); 
                q = `Hvis <span style="color:white">${v} = ${n2}</span>,<br>hva er <b>${n1}${v}</b>?`; a = n1 * n2;
                break;
            case 3: 
                levelTitle.innerText = "Nivå 3: Uttrykk";
                n1 = getNum(2, 5); n2 = getNum(3, 8); n3 = getNum(2, 12);
                q = `Regn ut <b>${n1}${v} + ${n3}</b><br>når <span style="color:white">${v} = ${n2}</span>`; a = (n1 * n2) + n3;
                break;
            case 4: 
                levelTitle.innerText = "Nivå 4: Likninger";
                a = getNum(3, 20); n1 = getNum(2, 15); res = a + n1;
                q = `Finn ${v}:<br><b>${v} + ${n1} = ${res}</b>`;
                break;
            case 5: 
                levelTitle.innerText = "Nivå 5: Divisjon";
                a = getNum(2, 12); n1 = getNum(2, 6); res = a * n1;
                q = `Finn ${v}:<br><b>${n1}${v} = ${res}</b>`;
                break;
        }
    } 
    // --- HACKER (NIVÅ 2 - MER VARIASJON) ---
    else {
        switch(currentLevel) {
            case 1: 
                levelTitle.innerText = "Nivå 1: Negative tall";
                n1 = getNum(-5, 15); n2 = getNum(5, 20);
                if (Math.random() > 0.5) { q = `Regn ut <b>${n2} - ${v}</b><br>når <span style="color:white">${v} = ${n1}</span>`; a = n2 - n1; } 
                else { q = `Regn ut <b>${v} - ${n2}</b><br>når <span style="color:white">${v} = ${n1}</span>`; a = n1 - n2; }
                break;
            case 2: 
                levelTitle.innerText = "Nivå 2: Avanserte Uttrykk";
                n2 = getNum(-5, 8); n3 = getNum(5, 20); 
                if (Math.random() > 0.5) { n1 = getNum(2, 6); q = `Regn ut <b>${n1}${v} - ${n3}</b><br>når <span style="color:white">${v} = ${n2}</span>`; a = (n1 * n2) - n3; } 
                else { n1 = getNum(2, 5); q = `Regn ut <b>-${n1}${v} + ${n3}</b><br>når <span style="color:white">${v} = ${n2}</span>`; a = (-n1 * n2) + n3; }
                break;
            case 3: 
                levelTitle.innerText = "Nivå 3: Parenteser";
                n1 = getNum(2, 5); n2 = getNum(2, 10); n3 = getNum(1, 8);
                if (Math.random() > 0.5) { q = `Regn ut <b>${n1}(${v} + ${n3})</b><br>når <span style="color:white">${v} = ${n2}</span>`; a = n1 * (n2 + n3); } 
                else { q = `Regn ut <b>${n1}(${v} - ${n3})</b><br>når <span style="color:white">${v} = ${n2}</span>`; a = n1 * (n2 - n3); }
                break;
            case 4: 
                levelTitle.innerText = "Nivå 4: To variabler";
                n1 = getNum(2, 10); n2 = getNum(2, 10); n3 = getNum(2, 4);
                if (Math.random() > 0.5) { q = `Hvis <span style="color:white">${v} = ${n1}</span> og <span style="color:white">${v2} = ${n2}</span><br>hva er <b>${n3}${v} + ${v2}</b>?`; a = (n3 * n1) + n2; } 
                else { q = `Hvis <span style="color:white">${v} = ${n1}</span> og <span style="color:white">${v2} = ${n2}</span><br>hva er <b>${n3}${v} - ${v2}</b>?`; a = (n3 * n1) - n2; }
                break;
            case 5: 
                levelTitle.innerText = "Nivå 5: Master Key";
                a = getNum(-5, 12); while(a === 0) { a = getNum(-5, 12); } 
                n1 = getNum(2, 6); n2 = getNum(2, 20); 
                if (Math.random() > 0.5) { res = (n1 * a) + n2; q = `Finn ${v}:<br><b>${n1}${v} + ${n2} = ${res}</b>`; } 
                else { res = (n1 * a) - n2; q = `Finn ${v}:<br><b>${n1}${v} - ${n2} = ${res}</b>`; }
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
        
        // --- START TANNHJUL ANIMASJON ---
        activateGears();

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
                setTimeout(generateQuestion, 2000); // Litt lenger pause pga animasjon
            }
        } else {
            setTimeout(generateQuestion, 1500); // Vent litt så man ser tannhjulene
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
    gameWrapper.style.display = 'none';
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
