let timeLeft = 900; // 15 minutter
const timerElement = document.getElementById('timer');
const logElement = document.getElementById('log-console');

// Timer-funksjon
const countdown = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    timerElement.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    if (timeLeft <= 0) {
        clearInterval(countdown);
        alert("SYSTEM CRASHED: Tiden er ute!");
        location.reload();
    }
    timeLeft--;
}, 1000);

function updateProgress(level) {
    const percent = (level / 5) * 100;
    document.getElementById('progress-fill').style.width = percent + "%";
    document.getElementById('progress-text').innerText = percent + "% fullført";
}

function checkLevel(level, correctAnswer) {
    const input = document.getElementById('input' + level).value;
    
    if (input == correctAnswer) {
        logElement.innerText = `> Nivå ${level} brutt! Dekrypterer neste lag...`;
        
        document.getElementById('level' + level).classList.remove('active');
        updateProgress(level);

        if (level < 5) {
            document.getElementById('level' + (level + 1)).classList.add('active');
        } else {
            finishGame();
        }
    } else {
        logElement.innerText = `> ADVARSEL: Feil kode tastet inn. Systemet sporer deg...`;
        logElement.style.color = "red";
        setTimeout(() => logElement.style.color = "#00ff41", 1000);
    }
}

function finishGame() {
    clearInterval(countdown);
    document.getElementById('victory').classList.add('active');
    document.getElementById('final-time').innerText = `Tid brukt: ${900 - timeLeft} sekunder.`;
}
