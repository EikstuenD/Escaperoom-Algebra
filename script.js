// Variabler for spillets tilstand
let currentLevel = 1;
const maxLevels = 5;
let currentAnswer = 0;
let timeLeft = 1200; // 20 minutter
const vars = ['x', 'y', 'a', 'b', 'n', 'k', 'z']; // Tilfeldige bokstaver

// DOM Elementer
const timerElement = document.getElementById('timer');
const logElement = document.getElementById('log-console');
const questionText = document.getElementById('question-text');
const levelTitle = document.getElementById('level-title');
const inputField = document.getElementById('user-input');
const levelIndicator = document.getElementById('level-indicator');

// Start spillet
window.onload = function() {
    generateQuestion(currentLevel);
    startTimer();
};

// Funksjon for å velge tilfeldig bokstav
function getVar() {
    return vars[Math.floor(Math.random() * vars.length)];
}

// Funksjon for å generere tilfeldig tall mellom min og max
function getNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- DEN STORE OPPGAVEGENERATOREN ---
function generateQuestion(level) {
    let v = getVar(); // Henter en tilfeldig bokstav, f.eks "x"
    let q = ""; // Spørsmålstekst
    let a = 0;  // Svaret
    let n1, n2, n3; // Hjelpetall

    switch(level) {
        case 1: 
            // Nivå 1: Enkel addisjon/subtraksjon med variabler (F.eks: Hvis x = 5, hva er x + 3?)
            levelTitle.innerText = "Nivå 1: Variabel-initiering";
            n1 = getNum(5, 15); // Verdien til variabelen
            n2 = getNum(3, 10); // Tallet vi legger til/trekker fra
            if (Math.random() > 0.5) {
                // Pluss
                q = `Hvis <span style="color:#fff">${v} = ${n1}</span>,<br>hva er verdien av <b>${v} + ${n2}</b>?`;
                a = n1 + n2;
            } else {
                // Minus
                q = `Hvis <span style="color:#fff">${v} = ${n1}</span>,<br>hva er verdien av <b>${v} - ${n2}</b>?`;
                a = n1 - n2;
            }
            break;

        case 2:
            // Nivå 2: Uttrykk med koeffisienter (F.eks: 2x + 5 når x = 3)
            levelTitle.innerText = "Nivå 2: Prosessor-kalkulasjon";
            n1 = getNum(2, 5); // Koeffisient (tallet foran x)
            n2 = getNum(2, 6); // Verdien til x
            n3 = getNum(1, 10); // Konstantledd
            
            if (Math.random() > 0.5) {
                q = `Regn ut verdien: <b>${n1}${v} + ${n3}</b><br>når <span style="color:#fff">${v} = ${n2}</span>`;
                a = (n1 * n2) + n3;
            } else {
                q = `Regn ut verdien: <b>${n1}${v} - ${n3}</b><br>når <span style="color:#fff">${v} = ${n2}</span>`;
                a = (n1 * n2) - n3;
            }
            break;

        case 3:
            // Nivå 3: Enkle likninger (Finn x: x + 5 = 12)
            levelTitle.innerText = "Nivå 3: Ukjent faktor";
            a = getNum(5, 15); // Vi bestemmer svaret først (x)
            n1 = getNum(3, 10); // Tallet vi legger til
            
            // Lager likningen basert på svaret
            if (Math.random() > 0.5) {
                let sum = a + n1;
                q = `Løs likningen for ${v}:<br><b>${v} + ${n1} = ${sum}</b>`;
            } else {
                let diff = a - n1;
                q = `Løs likningen for ${v}:<br><b>${v} - ${n1} = ${diff}</b>`;
            }
            break;

        case 4:
            // Nivå 4: Likninger med ganging (Finn x: 2x + 4 = 14)
            levelTitle.innerText = "Nivå 4: Avansert dekryptering";
            a = getNum(3, 9); // Svaret (x)
            n1 = getNum(2, 4); // Tallet foran x
            n2 = getNum(2, 8); // Tallet vi legger til
            
            let total = (n1 * a) + n2;
            q = `Finn verdien til ${v}:<br><b>${n1}${v} + ${n2} = ${total}</b>`;
            break;

        case 5:
            // Nivå 5: Geometri / Tekstoppgave
            levelTitle.innerText = "Nivå 5: Sikkerhets-geometri";
            a = getNum(4, 10); // Kortside (x)
            n1 = getNum(2, 6); // Hvor mye lengre langsiden er
            let omkrets = (a + a + (a + n1) + (a + n1));
            
            q = `En rektangulær brannmur har omkrets <b>${omkrets}</b>.<br>
                 Kortsiden er <b>${v}</b>.<br>
                 Langsiden er <b>${v} + ${n1}</b>.<br>
                 Finn verdien av <b>${v}</b>.`;
            break;
    }

    currentAnswer = a;
    questionText.innerHTML = q;
    inputField.value = '';
    inputField.focus();
}

function handleEnter(event) {
    if (event.key === 'Enter') checkAnswer();
}

function checkAnswer() {
    let userVal = parseInt(inputField.value);

    if (isNaN(userVal)) {
        logElement.innerText = "> FEIL: Vennligst skriv inn et tall.";
        logElement.style.color = "orange";
        return;
    }

    if (userVal === currentAnswer) {
        // --- RIKTIG SVAR ---
        logElement.innerHTML = `> KODE GODKJENT. Laster nivå ${currentLevel + 1}...`;
        logElement.style.color = "#00ff41";
        
        // Øk progresjonsbaren
        let progress = (currentLevel / maxLevels) * 100;
        document.getElementById('progress-fill').style.width = progress + "%";
        
        currentLevel++;
        levelIndicator.innerText = `Nivå: ${currentLevel}/${maxLevels}`;

        if (currentLevel > maxLevels) {
            victory();
        } else {
            // Vent litt før neste oppgave kommer
            setTimeout(() => {
                generateQuestion(currentLevel);
            }, 1000);
        }

    } else {
        // --- FEIL SVAR ---
        logElement.innerHTML = `> TILGANG AVSLÅTT. Re-genererer sikkerhetskode...`;
        logElement.style.color = "red";
        inputField.classList.add('shake');

        // Lag en ny oppgave på SAMME nivå (differensiering)
        setTimeout(() => {
            inputField.classList.remove('shake');
            logElement.style.color = "#00ff41";
            generateQuestion(currentLevel); // Genererer NY oppgave, samme nivå
        }, 1000);
    }
}

function victory() {
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('victory').classList.add('active');
    clearInterval(timerInterval);
    logElement.innerText = "> SYSTEM GJENOPPRETTET.";
}

let timerInterval;
function startTimer() {
    timerInterval = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        timerElement.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        
        if (timeLeft < 120) timerElement.style.color = "red";
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Tiden er ute! Systemet er låst.");
            location.reload();
        }
        timeLeft--;
    }, 1000);
}
