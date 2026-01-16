// --- KONFIGURASJON ---
const maxLevels = 5;
let currentLevel = 1;
let currentAnswer = 0;
let timeLeft = 1200; // 20 minutter
let timerInterval;

// Variabler vi bruker til matteoppgavene
const vars = ['x', 'y', 'a', 'b', 'n', 'k', 'z']; 

// Referanser til HTML-elementer (Hentes når siden er lastet)
let timerElement, logElement, questionText, levelTitle, inputField, levelIndicator, progressBar;

// --- OPPSTART ---
// Vi venter til hele nettsiden er ferdig lastet før vi kjører koden
document.addEventListener('DOMContentLoaded', function() {
    // 1. Koble variabler til HTML-elementene
    timerElement = document.getElementById('timer');
    logElement = document.getElementById('log-console');
    questionText = document.getElementById('question-text');
    levelTitle = document.getElementById('level-title');
    inputField = document.getElementById('user-input');
    levelIndicator = document.getElementById('level-indicator');
    progressBar = document.getElementById('progress-fill');

    // 2. Sjekk at vi fant alt (for debugging)
    if (!inputField || !questionText) {
        console.error("Fant ikke HTML-elementene! Sjekk at ID-ene i HTML stemmer.");
        return;
    }

    // 3. Start spillet
    console.log("System initializing...");
    startTimer();
    generateQuestion(currentLevel);
});

// --- HJELPEFUNKSJONER ---
function getVar() {
    return vars[Math.floor(Math.random() * vars.length)];
}

function getNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- HOVEDFUNKSJON: GENERER OPPGAVE ---
function generateQuestion(level) {
    let v = getVar(); // Tilfeldig bokstav
    let q = "";       // Spørsmålstekst
    let a = 0;        // Svaret
    
    // Hjelpevariabler (deklareres her for å unngå krasj)
    let n1, n2, n3, sum, diff, total, omkrets;

    switch(level) {
        case 1: 
            // Nivå 1: Enkel addisjon/subtraksjon
            levelTitle.innerText = "Nivå 1: Variabel-initiering";
            n1 = getNum(5, 15);
            n2 = getNum(3, 10);
            if (Math.random() > 0.5) {
                q = `Hvis <span style="color:white">${v} = ${n1}</span>,<br>hva er verdien av <b>${v} + ${n2}</b>?`;
                a = n1 + n2;
            } else {
                q = `Hvis <span style="color:white">${v} = ${n1}</span>,<br>hva er verdien av <b>${v} - ${n2}</b>?`;
                a = n1 - n2;
            }
            break;

        case 2:
            // Nivå 2: Uttrykk (2x + 5)
            levelTitle.innerText = "Nivå 2: Prosessor-kalkulasjon";
            n1 = getNum(2, 5); // Koeffisient
            n2 = getNum(2, 6); // x-verdi
            n3 = getNum(1, 10); // Konstant
            
            if (Math.random() > 0.5) {
                q = `Regn ut: <b>${n1}${v} + ${n3}</b><br>når <span style="color:white">${v} = ${n2}</span>`;
                a = (n1 * n2) + n3;
            } else {
                q = `Regn ut: <b>${n1}${v} - ${n3}</b><br>når <span style="color:white">${v} = ${n2}</span>`;
                a = (n1 * n2) - n3;
            }
            break;

        case 3:
            // Nivå 3: Enkel likning (x + 5 = 12)
            levelTitle.innerText = "Nivå 3: Ukjent faktor";
            a = getNum(5, 15); // Vi bestemmer at svaret (x) er dette
            n1 = getNum(3, 10); // Tallet vi legger til
            
            if (Math.random() > 0.5) {
                sum = a + n1;
                q = `Løs likningen for ${v}:<br><b>${v} + ${n1} = ${sum}</b>`;
            } else {
                diff = a - n1;
                q = `Løs likningen for ${v}:<br><b>${v} - ${n1} = ${diff}</b>`;
            }
            break;

        case 4:
            // Nivå 4: Likning med ganging (2x + 4 = 14)
            levelTitle.innerText = "Nivå 4: Avansert dekryptering";
            a = getNum(3, 9);  // Svaret (x)
            n1 = getNum(2, 4); // Tallet foran x
            n2 = getNum(2, 8); // Tallet vi legger til
            
            total = (n1 * a) + n2;
            q = `Finn verdien til ${v}:<br><b>${n1}${v} + ${n2} = ${total}</b>`;
            break;

        case 5:
            // Nivå 5: Geometri
            levelTitle.innerText = "Nivå 5: Sikkerhets-geometri";
            a = getNum(4, 10); // Kortside (x)
            n1 = getNum(2, 6); // Differanse
            omkrets = (a + a + (a + n1) + (a + n1));
            
            q = `En rektangulær serverpark har omkrets <b>${omkrets}</b>.<br>
                 Kortsiden er <b>${v}</b>.<br>
                 Langsiden er <b>${v} + ${n1}</b>.<br>
                 Finn verdien av <b>${v}</b>.`;
            break;
            
        default:
            q = "Ingen data funnet.";
    }

    // Sett variablene og oppdater skjermen
    currentAnswer = a;
    questionText.innerHTML = q;
    inputField.value = '';
    
    // Vi setter fokus på input-feltet så man slipper å klikke
    setTimeout(() => inputField.focus(), 100);
}

// --- HÅNDTERING AV SVAR ---
function handleEnter(event) {
    if (event.key === 'Enter') checkAnswer();
}

function checkAnswer() {
    let userVal = parseInt(inputField.value);

    // Sjekk om input er tomt eller ugyldig
    if (isNaN(userVal)) {
        logElement.innerHTML = "> FEIL: Skriv inn et tall. <span class='cursor'>_</span>";
        logElement.style.color = "orange";
        inputField.classList.add('shake');
        setTimeout(() => inputField.classList.remove('shake'), 500);
        return;
    }

    if (userVal === currentAnswer) {
        // --- RIKTIG SVAR ---
        logElement.innerHTML = `> KODE GODKJENT. Laster nivå ${currentLevel + 1}... <span class='cursor'>_</span>`;
        logElement.style.color = "#00ff41";
        
        // Oppdater progress bar
        let progress = (currentLevel / maxLevels) * 100;
        progressBar.style.width = progress + "%";
        
        currentLevel++;
        levelIndicator.innerText = `Nivå: ${currentLevel}/${maxLevels}`;

        if (currentLevel > maxLevels) {
            victory();
        } else {
            // Vent litt før neste oppgave kommer for effekt
            setTimeout(() => {
                generateQuestion(currentLevel);
            }, 800);
        }

    } else {
        // --- FEIL SVAR ---
        logElement.innerHTML = `> TILGANG AVSLÅTT. Re-genererer oppgave... <span class='cursor'>_</span>`;
        logElement.style.color = "red";
        inputField.classList.add('shake');

        setTimeout(() => {
            inputField.classList.remove('shake');
            inputField.value = '';
            logElement.style.color = "#00ff41";
            // Generer NY oppgave på SAMME nivå
            generateQuestion(currentLevel);
        }, 1000);
    }
}

function victory() {
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('victory').classList.add('active');
    clearInterval(timerInterval);
    logElement.innerHTML = "> SYSTEM GJENOPPRETTET. <span class='cursor'>_</span>";
}

// --- TIMER FUNKSJON ---
function startTimer() {
    timerInterval = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        
        timerElement.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        
        if (timeLeft < 120) {
            timerElement.style.color = "red";
            timerElement.style.textShadow = "0 0 10px red";
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Tiden er ute! Systemet er låst.");
            location.reload();
        }
        timeLeft--;
    }, 1000);
}
