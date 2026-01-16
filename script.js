// Startverdier
let timeLeft = 900; // 15 minutter i sekunder
const timerElement = document.getElementById('timer');
const logElement = document.getElementById('log-console');

// Nedtellingsfunksjon
const countdown = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    
    // Legger til en ekstra null hvis sekunder er under 10
    timerElement.innerText = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    
    if (timeLeft <= 0) {
        clearInterval(countdown);
        alert("SYSTEM CRASHED: Tiden er ute!");
        location.reload();
    }
    timeLeft--;
}, 1000);

// Hovedfunksjon for å sjekke svar
function checkLevel(level, correctAnswer) {
    // Henter verdien fra input-feltet til det gjeldende nivået
    const inputField = document.getElementById('input' + level);
    const userValue = parseInt(inputField.value);

    if (userValue === correctAnswer) {
        // Riktig svar!
        logElement.innerText = "> Nivå " + level + " dekryptert. Låser opp neste lag...";
        logElement.style.color = "#00ff41";

        // Skjul nåværende rom
        document.getElementById('level' + level).classList.remove('active');
        
        // Oppdater fremdriftslinjen
        let progress = (level / 5) * 100;
        document.getElementById('progress-fill').style.width = progress + "%";
        document.getElementById('progress-text').innerText = progress + "% fullført";

        // Vis neste rom eller seier
        if (level < 5) {
            document.getElementById('level' + (level + 1)).classList.add('active');
        } else {
            document.getElementById('victory').classList.add('active');
            clearInterval(countdown); // Stopp klokka
            logElement.innerText = "> SYSTEMET ER GJENOPPRETTET. GODT JOBBET!";
        }
    } else {
        // Feil svar
        logElement.innerText = "> KRITISK FEIL: Ugyldig kode for nivå " + level + ". Prøv igjen.";
        logElement.style.color = "red";
        
        // Rister litt på input-feltet for effekt
        inputField.style.borderColor = "red";
        setTimeout(() => {
            inputField.style.borderColor = "#00ff41";
            logElement.style.color = "#00ff41";
        }, 1000);
    }
}
