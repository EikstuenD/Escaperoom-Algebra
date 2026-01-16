// Konfigurasjon og fasit (litt tryggere enn å ha det rett i HTML)
const answers = {
    1: 26,
    2: 13,
    3: 10,
    4: 15,
    5: 5
};

// Startverdier
let timeLeft = 900; // 15 minutter
const timerElement = document.getElementById('timer');
const logElement = document.getElementById('log-console');

// Nedtellingsfunksjon
const countdown = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    
    // Formaterer tid (09:05 osv)
    timerElement.innerText = 
        (minutes < 10 ? '0' : '') + minutes + ":" + 
        (seconds < 10 ? '0' : '') + seconds;
    
    // Endre farge til rød hvis det er lite tid igjen (under 2 min)
    if (timeLeft < 120) {
        timerElement.style.color = "red";
        timerElement.style.textShadow = "0 0 5px red";
    }

    if (timeLeft <= 0) {
        clearInterval(countdown);
        alert("SYSTEM CRASHED: Tiden er ute!");
        location.reload();
    }
    timeLeft--;
}, 1000);

// Funksjon for å håndtere Enter-tast
function handleEnter(event, level) {
    if (event.key === 'Enter') {
        checkLevel(level);
    }
}

// Hovedfunksjon for å sjekke svar
function checkLevel(level) {
    const inputField = document.getElementById('input' + level);
    const userValue = parseInt(inputField.value);
    const correctAnswer = answers[level];

    // Sjekker om input er tomt eller ikke et tall
    if (isNaN(userValue)) {
        logElement.innerHTML = "> FEIL: Vennligst skriv inn et tall. <span class='cursor'>_</span>";
        logElement.style.color = "orange";
        return;
    }

    if (userValue === correctAnswer) {
        // --- RIKTIG SVAR ---
        logElement.innerHTML = "> Nivå " + level + " dekryptert. Låser opp neste lag... <span class='cursor'>_</span>";
        logElement.style.color = "#00ff41";

        // Fjern feil-styling hvis den henger igjen
        inputField.classList.remove('shake');
        inputField.style.borderColor = "#00ff41";

        // Skjul nåværende rom
        document.getElementById('level' + level).classList.remove('active');
        
        // Oppdater fremdriftslinjen
        let progress = (level / 5) * 100;
        document.getElementById('progress-fill').style.width = progress + "%";
        document.getElementById('progress-text').innerText = progress + "% fullført";

        // Vis neste rom eller seier
        if (level < 5) {
            const nextLevel = document.getElementById('level' + (level + 1));
            nextLevel.classList.add('active');
            
            // Sett fokus på det nye input-feltet automatisk
            setTimeout(() => {
                document.getElementById('input' + (level + 1)).focus();
            }, 100);
        } else {
            document.getElementById('victory').classList.add('active');
            clearInterval(countdown); // Stopp klokka
            logElement.innerHTML = "> SYSTEMET ER GJENOPPRETTET. GODT JOBBET! <span class='cursor'>_</span>";
        }
    } else {
        // --- FEIL SVAR ---
        logElement.innerHTML = "> KRITISK FEIL: Ugyldig kode for nivå " + level + ". Prøv igjen. <span class='cursor'>_</span>";
        logElement.style.color = "red";
        
        // Legg til shake-animasjon klasse
        inputField.classList.add('shake');
        
        // Fjern klassen etter animasjonen er ferdig (så den kan kjøres igjen)
        setTimeout(() => {
            inputField.classList.remove('shake');
            inputField.value = ''; // Tømmer feltet (valgfritt, fjern denne linjen om du vil beholde svaret)
            inputField.focus();
        }, 500);
    }
}
