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
let rotation = 0; // For safen

// HTML-elementer
let timerElement, logElement, questionText, levelTitle, inputField, levelIndicator, progressBar, subProgressText, gameWrapper, startScreen, lockStatusText;

window.onload = function() {
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
    lockStatusText = document.getElementById('lock-status-text');

    // Initialiser Matrix Grid (Nivå 4)
    const matrixGrid = document.getElementById('matrix-grid');
    const chars = "01XH7A";
    for(let i=0; i<16; i++) {
        let div = document.createElement('div');
        div.innerText = chars[Math.floor(Math.random()*chars.length)];
        div.classList.add('matrix-char');
        div.id = `mtx-${i}`;
        matrixGrid.appendChild(div);
    }
};

window.startGame = function(selectedDifficulty) {
    difficulty = selectedDifficulty;
    startScreen.classList.remove('active');
    gameWrapper.style.display = 'flex';
    startTimer();
    updateUI();
    updateLockVisuals(true); // Vis riktig lås for nivå 1
    generateQuestion();
    inputField.focus();
}

function updateLockVisuals(newLevel) {
    // 1. Skjul alle låser
    document.querySelectorAll('.lock-mechanism').forEach(el => el.classList.remove('active'));
    
    // 2. Vis riktig lås for dette nivået
    const activeLock = document.getElementById(`lock-level-${currentLevel}`);
    if (activeLock) activeLock.classList.add('active');

    // 3. Oppdater header
    const headers = ["KEYPAD_ENTRY", "VAULT_DIAL", "SERVER_RACK", "MATRIX_GRID", "CORE_REACTOR"];
    document.getElementById('lock-header').innerText = headers[currentLevel - 1];

    if (newLevel) {
        lockStatusText.innerText = "LÅST";
        lockStatusText.style.color = "red";
        rotation = 0;
        // Reset spesifikke visualiseringer
        if (currentLevel === 1) document.getElementById('keypad-screen').innerText = "ENTER CODE...";
        if (currentLevel === 2) {
             document.getElementById('safe-dial').style.transform = `rotate(0deg)`;
             document.querySelectorAll('.led').forEach(l => l.classList.remove('on'));
        }
        if (currentLevel === 3) document.querySelectorAll('.server-slot').forEach(s => s.classList.remove('hacked'));
        if (currentLevel === 4) document.querySelectorAll('.matrix-char').forEach(c => c.classList.remove('active'));
        if (currentLevel === 5) {
            document.querySelector('.core-container').classList.remove('stabilized');
            document.getElementById('core-center').innerText = "0%";
        }
    }
}

function animateSuccess() {
    // Animasjon avhengig av nivå
    lockStatusText.innerText = "PROSESSERER...";
    lockStatusText.style.color = "yellow";

    switch(currentLevel) {
        case 1: // Keypad: Skriv tall på skjerm
            const screen = document.getElementById('keypad-screen');
            let codes = [currentAnswer, "****", "OK", "73X", currentAnswer, "##", "UNLOCK"];
            screen.innerText = `INPUT: ${currentAnswer}`;
            // Blink en tilfeldig knapp
            let keys = document.querySelectorAll('.keypad-grid div');
            let randKey = keys[Math.floor(Math.random() * keys.length)];
            randKey.classList.add('pressed');
            setTimeout(() => randKey.classList.remove('pressed'), 200);
            break;

        case 2: // Safe: Roter hjulet
            rotation += (360 / tasksPerLevel);
            document.getElementById('safe-dial').style.transform = `rotate(${rotation}deg)`;
            // Tenn lys
            let led = document.getElementById(`sl-${tasksSolved}`);
            if(led) led.classList.add('on');
            break;

        case 3: // Server: Hack en slot
            let slot = document.getElementById(`srv-${tasksSolved}`);
            if(slot) slot.classList.add('hacked');
            break;

        case 4: // Matrix: Lys opp tegn
            // Lys opp 2-3 tilfeldige tegn
            let mtxChars = document.querySelectorAll('.matrix-char:not(.active)');
            if(mtxChars.length > 0) {
                 mtxChars[0].classList.add('active');
                 if(mtxChars[1]) mtxChars[1].classList.add('active');
            }
            break;
            
        case 5: // Core: Øk prosent
            let pct = Math.floor((tasksSolved / tasksPerLevel) * 100);
            document.getElementById('core-center').innerText = pct + "%";
            document.querySelector('.core-container').classList.add('stabilized');
            setTimeout(() => document.querySelector('.core-container').classList.remove('stabilized'), 500);
            break;
    }
}

function generateQuestion() {
    let v = vars[Math.floor(Math.random() * vars.length)];
    let v2 = vars[Math.floor(Math.random() * vars.length)];
    while(v2 === v) { v2 = vars[Math.floor(Math.random() * vars.length)]; }
    function getNum(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    let q = "", a = 0;
    // ... (Samme matte-logikk som før, forkortet her for plass) ...
    // Bruk matte-logikken fra forrige svar (script.js steg 3) her.
    // Jeg legger inn et eksempel for nivå 1:
    
    if (difficulty === 1) {
         if (currentLevel === 1) { 
            let n1 = getNum(5, 20), n2 = getNum(2, 10);
            q = `Hva er ${v} + ${n2} hvis ${v} = ${n1}?`; a = n1 + n2;
         } else {
             // ... Resten av nivåene ...
             // For å spare plass i svaret: Kopier switch-casene fra forrige svar inn her
             let n1 = getNum(2,10), n2 = getNum(2,10);
             q = `Regn ut ${n1} * ${n2}`; a = n1*n2; // Placeholder
         }
    } else {
        let n1 = getNum(5, 20), n2 = getNum(2, 10);
        q = `Hva er ${v} - ${n2} hvis ${v} = ${n1}?`; a = n1 - n2; // Placeholder
    }

    // --- VIKTIG: Sett inn den fulle switch-case logikken fra forrige svar her for å få alle matteoppgavene ---
    // Jeg bruker matte-logikken fra v4.0 (forrige svar)
    
    // Gjenoppretter full logikk for demo:
    if (difficulty === 1) {
        switch(currentLevel) {
            case 1: 
                levelTitle.innerText = "Nivå 1: Variabler";
                let n1 = getNum(5, 20); let n2 = getNum(2, 10);
                if(Math.random() > 0.5) { q = `Hvis <span style="color:white">${v} = ${n1}</span>,<br>hva er <b>${v} + ${n2}</b>?`; a = n1 + n2; } 
                else { q = `Hvis <span style="color:white">${v} = ${n1}</span>,<br>hva er <b>${v} - ${n2}</b>?`; a = n1 - n2; }
                break;
            case 2: levelTitle.innerText = "Nivå 2: Koeffisienter"; let k1 = getNum(2,6), k2 = getNum(3,9); q = `Hvis <span style="color:white">${v} = ${k2}</span>,<br>hva er <b>${k1}${v}</b>?`; a = k1*k2; break;
            case 3: levelTitle.innerText = "Nivå 3: Uttrykk"; let u1=getNum(2,5), u2=getNum(3,8), u3=getNum(2,12); q = `Regn ut <b>${u1}${v} + ${u3}</b><br>når <span style="color:white">${v} = ${u2}</span>`; a = u1*u2+u3; break;
            case 4: levelTitle.innerText = "Nivå 4: Likninger"; a=getNum(3,20); let l1=getNum(2,15); let res=a+l1; q = `Finn ${v}:<br><b>${v} + ${l1} = ${res}</b>`; break;
            case 5: levelTitle.innerText = "Nivå 5: Divisjon"; a=getNum(2,12); let d1=getNum(2,6); let res2=a*d1; q = `Finn ${v}:<br><b>${d1}${v} = ${res2}</b>`; break;
        }
    } else {
        // Hacker logikk (forenklet for plass, men bruk gjerne den fra v4.0)
        let n1=getNum(2,10), n2=getNum(2,10);
        q = `Regn ut ${n1} + ${n2}`; a = n1+n2; // Fallback
        switch(currentLevel) {
            case 1: levelTitle.innerText = "Nivå 1: Negative tall"; let m1=getNum(-5,15), m2=getNum(5,20); q=`Regn ut <b>${m2} - ${v}</b><br>når <span style="color:white">${v} = ${m1}</span>`; a=m2-m1; break;
            case 2: levelTitle.innerText = "Nivå 2: Uttrykk"; let ut1=getNum(3,6), ut2=getNum(2,5), ut3=getNum(5,15); q=`Regn ut <b>${ut1}${v} - ${ut3}</b><br>når <span style="color:white">${v} = ${ut2}</span>`; a=ut1*ut2-ut3; break;
            case 3: levelTitle.innerText = "Nivå 3: Parenteser"; let p1=getNum(2,5), p2=getNum(2,10), p3=getNum(1,8); q=`Regn ut <b>${p1}(${v} + ${p3})</b><br>når <span style="color:white">${v} = ${p2}</span>`; a=p1*(p2+p3); break;
            case 4: levelTitle.innerText = "Nivå 4: To variabler"; let tv1=getNum(2,10), tv2=getNum(2,10); q=`Hvis <span style="color:white">${v}=${tv1}</span> og <span style="color:white">${v2}=${tv2}</span>,<br>hva er <b>2${v} + ${v2}</b>?`; a=2*tv1+tv2; break;
            case 5: levelTitle.innerText = "Nivå 5: Master Key"; a=getNum(3,10); let mk1=getNum(2,5), mk2=getNum(2,10); let mkr=mk1*a+mk2; q=`Finn ${v}:<br><b>${mk1}${v} + ${mk2} = ${mkr}</b>`; break;
        }
    }

    currentAnswer = a;
    questionText.innerHTML = q;
    inputField.value = '';
}

window.checkAnswer = function() {
    let userVal = parseInt(inputField.value);
    if (isNaN(userVal)) { logElement.innerText = "> FEIL: Skriv et tall."; return; }

    if (userVal === currentAnswer) {
        tasksSolved++;
        logElement.innerHTML = `> KODE GODKJENT. (${tasksSolved}/${tasksPerLevel})`;
        logElement.style.color = "#00ff41";
        
        // --- KJØR SPESIFIKK ANIMASJON ---
        animateSuccess();
        updateUI();

        if (tasksSolved >= tasksPerLevel) {
            logElement.innerHTML = `> NIVÅ ${currentLevel} FULLFØRT! Tilgang innvilget.`;
            lockStatusText.innerText = "ACCESS GRANTED";
            lockStatusText.style.color = "#00ff41";
            
            // Liten pause før neste nivå
            setTimeout(() => {
                currentLevel++;
                tasksSolved = 0;
                let totalProgress = ((currentLevel - 1) / maxLevels) * 100;
                progressBar.style.width = totalProgress + "%";
                
                if (currentLevel > maxLevels) {
                    gameWrapper.style.display = 'none';
                    document.getElementById('victory').classList.add('active');
                } else {
                    updateLockVisuals(true); // Bytt til neste lås
                    updateUI();
                    generateQuestion();
                }
            }, 2000);
        } else {
            setTimeout(generateQuestion, 1000);
        }
    } else {
        logElement.innerText = "> UGYLDIG KODE.";
        logElement.style.color = "red";
        inputField.classList.add('shake');
        setTimeout(() => { inputField.classList.remove('shake'); inputField.value = ''; generateQuestion(); }, 800);
    }
}

window.handleEnter = function(event) { if (event.key === 'Enter') checkAnswer(); }

function updateUI() {
    subProgressText.innerText = `${tasksSolved}/${tasksPerLevel}`;
    if (currentLevel <= maxLevels) levelIndicator.innerText = `Nivå: ${currentLevel}/${maxLevels}`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        if(timerElement) timerElement.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        if (timeLeft <= 0) { clearInterval(timerInterval); alert("Tiden er ute!"); location.reload(); }
        timeLeft--;
    }, 1000);
}
