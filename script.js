// --- KONFIGURASJON ---
const maxLevels = 5;
const tasksPerLevel = 7;
let currentLevel = 1;
let tasksSolved = 0;
let difficulty = 1; 
let currentAnswer = 0;
let timeLeft = 1200; 
let timerInterval;
let combo = 0;
let agentName = "AGENT";
let isDebugTask = false; // Hvis true, er oppgaven "finn feilen"

// --- AUDIO MOTOR (Synthesizer) ---
// Lager lyd uten eksterne filer!
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    
    if (type === 'type') { // Tastetrykk
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0.05, now);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'correct') { // Riktig svar
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'wrong') { // Feil svar
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'alarm') { // Brannmur
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'win') { // Seier
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        osc.frequency.linearRampToValueAtTime(400, now + 0.4);
        osc.frequency.linearRampToValueAtTime(800, now + 0.6);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.5);
    }
}

// --- MATRIX BAKGRUNN ---
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const letters = "0101XYHAZK";
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);
let matrixColor = "#00ff41"; // Grønn standard

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = matrixColor;
    ctx.font = fontSize + "px monospace";
    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
    requestAnimationFrame(drawMatrix);
}

// --- SPILL LOGIKK ---
const vars = ['x', 'y', 'a', 'b', 'n']; 
let rotation = 0; // For safen

window.onload = function() {
    drawMatrix();
    // Start Matrix-låsen med tegn
    const mg = document.getElementById('matrix-grid');
    for(let i=0; i<16; i++){
        let d = document.createElement('div');
        d.className = 'matrix-char';
        d.innerText = "0";
        mg.appendChild(d);
    }
};

window.startGame = function(selectedDifficulty) {
    const nameInput = document.getElementById('avatar-input').value;
    if(nameInput.trim() !== "") agentName = nameInput.toUpperCase();
    document.getElementById('agent-name-display').innerText = agentName;
    document.getElementById('winner-name').innerText = agentName;

    difficulty = selectedDifficulty;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-wrapper').style.display = 'flex';
    
    // Aktiver lyd
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    startTimer();
    updateUI();
    updateLockVisuals(true);
    generateQuestion();
    document.getElementById('user-input').focus();
    
    // Start tilfeldige brannmurer
    startFirewallLoop();
};

function getNum(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getVar() { return vars[Math.floor(Math.random() * vars.length)]; }

function generateQuestion() {
    isDebugTask = false;
    document.getElementById('hint-text').style.display = 'none';
    
    // 20% sjanse for Feilsøking (Debugging) oppgave
    if (Math.random() < 0.2) {
        generateDebugTask();
        return;
    }

    let v = getVar();
    let q = "", a = 0;
    
    if (difficulty === 1) { // REKRUTT
        let n1 = getNum(2,10), n2 = getNum(2,10);
        switch(currentLevel) {
            case 1: q=`Hvis ${v} = ${n1}, hva er <b>${v} + ${n2}</b>?`; a=n1+n2; break;
            case 2: q=`Hvis ${v} = ${n2}, hva er <b>${n1}${v}</b>?`; a=n1*n2; break;
            case 3: q=`Regn ut: <b>${n1}${v} + ${n2}</b> når ${v}=3`; a=n1*3+n2; break;
            case 4: q=`Finn ${v}: <b>${v} + ${n1} = ${n1+n2}</b>`; a=n2; break;
            case 5: q=`Finn ${v}: <b>${n1}${v} = ${n1*n2}</b>`; a=n2; break;
        }
    } else { // HACKER
        let n1 = getNum(3,12), n2 = getNum(3,12);
        switch(currentLevel) {
            case 1: q=`Regn ut: <b>${n2} - ${v}</b> når ${v}=${n1}`; a=n2-n1; break;
            case 2: q=`Regn ut: <b>${n1}${v} - ${n2}</b> når ${v}=4`; a=n1*4-n2; break;
            case 3: q=`Regn ut: <b>2(${v} + ${n1})</b> når ${v}=5`; a=2*(5+n1); break;
            case 4: q=`Hvis x=${n1} og y=${n2}, hva er <b>2x + y</b>?`; a=2*n1+n2; break;
            case 5: q=`Finn ${v}: <b>${n1}${v} + ${n2} = ${n1*5+n2}</b>`; a=5; break;
        }
    }
    
    currentAnswer = a;
    document.getElementById('question-text').innerHTML = q;
}

// --- FEILSØKING (Debugging) ---
function generateDebugTask() {
    isDebugTask = true;
    let v = getVar();
    let wrongAns = getNum(10, 20);
    let rightAns = getNum(2, 9);
    
    // Vi lager en "logg" med feil i
    let text = `
        SYSTEM ERROR LOG:<br>
        Likning: 2${v} = ${rightAns * 2}<br>
        Systemet beregnet: ${v} = ${wrongAns} (FEIL!)<br>
        <br>
        Hva er den <b>RIKTIGE</b> verdien for ${v}?
    `;
    
    currentAnswer = rightAns;
    document.getElementById('question-text').innerHTML = text;
    document.getElementById('question-text').style.color = "#ffaa00";
}

// --- HINT SYSTEM ---
window.useHint = function() {
    timeLeft -= 60; // Kostnad
    playSound('wrong'); // Straffelyd
    let hint = "";
    
    if (isDebugTask) {
        hint = "Ignorer systemets svar. Løs likningen selv.";
    } else if (difficulty === 1) {
        if(currentLevel === 1) hint = "Bytt ut bokstaven med tallet.";
        else if(currentLevel === 4) hint = "Hva må du legge til for å få svaret?";
        else hint = "Prøv å sette inn verdien for variabelen.";
    } else {
        hint = "Husk regne-rekkefølgen: Ganging før pluss/minus.";
    }
    
    const hDiv = document.getElementById('hint-text');
    hDiv.innerText = "HINT: " + hint;
    hDiv.style.display = 'block';
}

// --- SJEKK SVAR ---
window.checkAnswer = function() {
    let userVal = parseInt(document.getElementById('user-input').value);
    
    if (userVal === currentAnswer) {
        // --- RIKTIG ---
        playSound('correct');
        tasksSolved++;
        combo++;
        
        // Combo-sjekk
        if (combo >= 3) {
            document.body.classList.add('combo-mode');
            document.getElementById('combo-badge').style.display = 'inline';
            matrixColor = "#ffcc00"; // Gull-regn
        }

        animateLock();
        
        if (tasksSolved >= tasksPerLevel) {
            nextLevel();
        } else {
            setTimeout(generateQuestion, 1000);
        }
    } else {
        // --- FEIL ---
        playSound('wrong');
        combo = 0;
        document.body.classList.remove('combo-mode');
        document.getElementById('combo-badge').style.display = 'none';
        matrixColor = "#00ff41";
        
        document.getElementById('user-input').classList.add('shake');
        setTimeout(() => document.getElementById('user-input').classList.remove('shake'), 500);
    }
    document.getElementById('user-input').value = "";
    document.getElementById('user-input').focus();
    updateUI();
}

function nextLevel() {
    playSound('win');
    document.getElementById('lock-status-text').innerText = "ACCESS GRANTED";
    document.getElementById('lock-status-text').style.color = "#00ff41";
    
    setTimeout(() => {
        currentLevel++;
        tasksSolved = 0;
        combo = 0;
        document.body.classList.remove('combo-mode');
        matrixColor = "#00ff41";
        
        if (currentLevel > maxLevels) {
            document.getElementById('game-wrapper').style.display = 'none';
            document.getElementById('victory').classList.add('active');
        } else {
            updateLockVisuals(true);
            generateQuestion();
            updateUI();
        }
    }, 2000);
}

// --- LÅS ANIMASJONER ---
function animateLock() {
    const ls = document.getElementById('lock-status-text');
    ls.innerText = "DEKRYPTERER...";
    ls.style.color = "yellow";
    
    if (currentLevel === 1) { // Keypad
        document.getElementById('keypad-screen').innerText = "CODE: " + currentAnswer;
        let keys = document.querySelectorAll('.keypad-grid div');
        keys[Math.floor(Math.random()*12)].classList.add('pressed');
        setTimeout(()=> document.querySelectorAll('.pressed').forEach(k=>k.classList.remove('pressed')), 200);
    }
    else if (currentLevel === 2) { // Safe
        rotation += 50;
        document.getElementById('safe-dial').style.transform = `rotate(${rotation}deg)`;
        if(document.getElementById(`sl-${tasksSolved}`)) document.getElementById(`sl-${tasksSolved}`).classList.add('on');
    }
    else if (currentLevel === 3) { // Server
        if(document.getElementById(`srv-${tasksSolved}`)) document.getElementById(`srv-${tasksSolved}`).classList.add('hacked');
    }
    else if (currentLevel === 4) { // Matrix
        let chars = document.querySelectorAll('.matrix-char');
        chars[Math.floor(Math.random()*chars.length)].classList.add('active');
        chars[Math.floor(Math.random()*chars.length)].innerText = currentAnswer;
    }
    else if (currentLevel === 5) { // Core
        let pct = Math.floor((tasksSolved/tasksPerLevel)*100);
        document.getElementById('core-center').innerText = pct + "%";
    }
}

function updateLockVisuals(reset) {
    document.querySelectorAll('.lock-mechanism').forEach(el => el.classList.remove('active'));
    let active = document.getElementById(`lock-level-${currentLevel}`);
    if(active) active.classList.add('active');
    
    const titles = ["KEYPAD", "SAFE_DIAL", "SERVER_RACK", "MATRIX_GRID", "CORE_REACTOR"];
    document.getElementById('lock-header').innerText = titles[currentLevel-1];
    
    if(reset) {
        document.getElementById('lock-status-text').innerText = "LÅST";
        document.getElementById('lock-status-text').style.color = "red";
        // Reset specific visuals (simplified)
        document.querySelectorAll('.led').forEach(l=>l.classList.remove('on'));
        document.querySelectorAll('.hacked').forEach(h=>h.classList.remove('hacked'));
        document.querySelectorAll('.matrix-char').forEach(c=>c.classList.remove('active'));
    }
}

// --- BRANNMUR (RANDOM EVENT) ---
let fwTimer;
function startFirewallLoop() {
    // Sjekk hvert 30. sekund, 30% sjanse for brannmur
    setInterval(() => {
        if (Math.random() < 0.3 && document.getElementById('firewall-modal').style.display !== 'flex') {
            triggerFirewall();
        }
    }, 30000);
}

function triggerFirewall() {
    playSound('alarm');
    matrixColor = "red"; // Bakgrunn blir rød
    
    const modal = document.getElementById('firewall-modal');
    const taskEl = document.getElementById('firewall-task');
    const input = document.getElementById('firewall-input');
    const bar = document.getElementById('fw-timer-bar');
    
    // Generer enkel oppgave
    let n1 = getNum(5, 10), n2 = getNum(5, 10);
    taskEl.innerText = `${n1} + ${n2}`;
    modal.style.display = 'flex';
    input.value = "";
    input.focus();
    
    // Countdown bar (10 sekunder)
    bar.style.width = "100%";
    let width = 100;
    
    fwTimer = setInterval(() => {
        width -= 1;
        bar.style.width = width + "%";
        if (width <= 0) {
            clearInterval(fwTimer);
            modal.style.display = 'none';
            timeLeft -= 60; // Straff
            playSound('wrong');
            matrixColor = "#00ff41";
            alert("BRANNMUR BRØT GJENNOM! -60 sekunder.");
        }
    }, 100); // 100 * 100ms = 10 sek
    
    window.checkFirewall = function() {
        if (parseInt(input.value) === (n1 + n2)) {
            clearInterval(fwTimer);
            modal.style.display = 'none';
            playSound('correct');
            matrixColor = document.body.classList.contains('combo-mode') ? "#ffcc00" : "#00ff41";
            document.getElementById('user-input').focus();
        } else {
            input.style.borderColor = "red";
        }
    }
}
window.handleFirewallEnter = function(e) { if(e.key === 'Enter') checkFirewall(); }

// --- DIVERSE ---
window.handleEnter = function(e) { 
    if(e.key === 'Enter') checkAnswer(); 
    else playSound('type'); // Tastetrykk lyd
}

function updateUI() {
    document.getElementById('sub-progress-text').innerText = `${tasksSolved}/${tasksPerLevel}`;
    document.getElementById('level-indicator').innerText = `Nivå: ${currentLevel}/${maxLevels}`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        document.getElementById('timer').innerText = `${m}:${s < 10 ? '0'+s : s}`;
        if (timeLeft <= 0) { clearInterval(timerInterval); alert("TIDEN ER UTE!"); location.reload(); }
        timeLeft--;
    }, 1000);
}
