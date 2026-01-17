// --- KONFIGURASJON ---
const maxLevels = 5;
const tasksPerLevel = 12; 
let currentLevel = 1;
let tasksSolved = 0;
let difficulty = 1; 
let currentAnswer = 0;
let timeLeft = 1500; // 25 minutter
let timerInterval;
let combo = 0;
let agentName = "AGENT";
let isDebugTask = false; 

// Variabler for lyd og grafikk
let audioCtx = null; // Starter som null, opprettes ved klikk
const vars = ['x', 'y', 'a', 'b', 'n', 'z', 'k']; 
let rotation = 0; 

// --- OPPSTART ---
window.onload = function() {
    console.log("System loaded. Waiting for user input...");
    
    // Start Matrix-effekten
    if(document.getElementById('matrix-bg')) drawMatrix();
    
    // Fyll Matrix-låsen med nuller
    const mg = document.getElementById('matrix-grid');
    if(mg) {
        for(let i=0; i<16; i++){ 
            let d = document.createElement('div'); 
            d.className = 'matrix-char'; 
            d.innerText = "0"; 
            mg.appendChild(d); 
        }
    }
};

// --- START-FUNKSJON (Koblet til knappene) ---
window.startGame = function(selectedDifficulty) {
    console.log("StartGame clicked with difficulty: " + selectedDifficulty);

    // 1. Initialiser lydmotoren NÅ (når brukeren klikker)
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.warn("Web Audio API ikke støttet i denne nettleseren.");
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // 2. Hent navn
    const nameInput = document.getElementById('avatar-input');
    if(nameInput && nameInput.value.trim() !== "") agentName = nameInput.value.toUpperCase();
    
    const agentDisplay = document.getElementById('agent-name-display');
    if(agentDisplay) agentDisplay.innerText = agentName;
    
    const winnerName = document.getElementById('winner-name');
    if(winnerName) winnerName.innerText = agentName;

    // 3. Sett spillmodus
    difficulty = selectedDifficulty;
    
    // 4. Bytt skjerm
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-wrapper').style.display = 'flex';
    
    // 5. Start spill-loopen
    startTimer(); 
    updateUI(); 
    updateLockVisuals(true); 
    generateQuestion();
    
    // 6. Sett fokus
    setTimeout(() => {
        const input = document.getElementById('user-input');
        if(input) input.focus();
    }, 100);

    // 7. Start random events
    startFirewallLoop();
};

// --- AUDIO MOTOR ---
function playSound(type) {
    if (!audioCtx) return; // Ingen lyd hvis context ikke finnes
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    
    if (type === 'type') { 
        osc.type = 'square'; osc.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0.05, now); osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'correct') { 
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'wrong') { 
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'alarm') { 
        osc.type = 'square'; osc.frequency.setValueAtTime(800, now); osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now); osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'win') { 
        osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.linearRampToValueAtTime(0, now + 1.5); osc.start(now); osc.stop(now + 1.5);
    }
}

// --- MATRIX BAKGRUNN ---
const canvas = document.getElementById('matrix-bg');
let ctx;
let drops = [];
const letters = "0101XYHAZK"; 
const fontSize = 16;
let matrixColor = "#00ff41"; 

if (canvas) {
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;
    const columns = canvas.width / fontSize;
    drops = Array(Math.floor(columns)).fill(1);
}

function drawMatrix() {
    if (!ctx) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = matrixColor; ctx.font = fontSize + "px monospace";
    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
    requestAnimationFrame(drawMatrix);
}

// --- HJELPEFUNKSJONER ---
function getNum(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getVar() { return vars[Math.floor(Math.random() * vars.length)]; }

// --- NY MATEMATIKKMOTOR ---
function generateQuestion() {
    isDebugTask = false;
    const hintText = document.getElementById('hint-text');
    if(hintText) hintText.style.display = 'none';
    
    // 15% sjanse for Feilsøking
    if (Math.random() < 0.15) { generateDebugTask(); return; }

    let v = getVar();
    let q = "", a = 0;
    
    // Vi velger en "type" oppgave basert på nivået for å skape variasjon
    let type = getNum(1, 4); 

    // --- REKRUTT (Positive heltall, enklere) ---
    if (difficulty === 1) { 
        switch(currentLevel) {
            case 1: // Variabler (+ og -)
                let n1 = getNum(2, 30);
                if (type === 1) { a = getNum(5, 50); q = `Hvis ${v} = ${a}, hva er <b>${v} + ${n1}</b>?`; a = a + n1; }
                else if (type === 2) { a = getNum(n1 + 5, 50); q = `Hvis ${v} = ${a}, hva er <b>${v} - ${n1}</b>?`; a = a - n1; }
                else if (type === 3) { let val = getNum(5, 20); q = `Hvis ${v} = ${val}, hva er <b>${n1} + ${v}</b>?`; a = n1 + val; }
                else { let val = getNum(2, 10); q = `Hvis ${v} = ${val}, hva er <b>${val + n1} - ${v}</b>?`; a = n1; }
                break;
            case 2: // Ganging og enkle uttrykk
                let k = getNum(2, 5); let val2 = getNum(2, 10);
                if (type === 1) { q = `Hvis ${v} = ${val2}, hva er <b>${k}${v}</b>?`; a = k * val2; }
                else if (type === 2) { q = `Regn ut <b>${k} · ${v}</b> når ${v} = ${val2}`; a = k * val2; }
                else if (type === 3) { let add = getNum(1, 10); q = `Hva er <b>${k}${v} + ${add}</b> når ${v} = ${val2}?`; a = (k * val2) + add; }
                else { let sub = getNum(1, 10); q = `Hva er <b>${k}${v} - ${sub}</b> når ${v} = ${val2 + 2}?`; a = (k * (val2 + 2)) - sub; }
                break;
            case 3: // Parenteser og dele
                let p1 = getNum(2, 5); let pVal = getNum(2, 8);
                if (type === 1) { let pAdd = getNum(1, 5); q = `Regn ut: <b>${p1}(${v} + ${pAdd})</b> når ${v}=${pVal}`; a = p1 * (pVal + pAdd); }
                else if (type === 2) { let pSub = getNum(1, pVal-1); q = `Regn ut: <b>${p1}(${v} - ${pSub})</b> når ${v}=${pVal}`; a = p1 * (pVal - pSub); }
                else if (type === 3) { q = `Hvis ${v} = ${p1 * pVal}, hva er <b>${v} / ${p1}</b>?`; a = pVal; } // Dele
                else { q = `Regn ut: <b>(${v} + ${pVal}) · 2</b> når ${v} = ${p1}`; a = (p1 + pVal) * 2; }
                break;
            case 4: // To variabler / substitusjon
                let x = getNum(2, 10); let y = getNum(2, 10);
                if (type === 1) { q = `Hvis x=${x} og y=${y}, hva er <b>x + y</b>?`; a = x + y; }
                else if (type === 2) { q = `Hvis a=${x} og b=${y}, hva er <b>2a + b</b>?`; a = 2 * x + y; }
                else if (type === 3) { q = `Hvis x=${x}, hva er <b>x · x</b>?`; a = x * x; }
                else { q = `Hvis n=${x} og k=${y}, hva er <b>n · k + 2</b>?`; a = x * y + 2; }
                break;
            case 5: // Likninger (Finn x)
                let ans = getNum(2, 15);
                if (type === 1) { let add = getNum(2, 20); q = `Finn ${v}: <b>${v} + ${add} = ${ans + add}</b>`; a = ans; }
                else if (type === 2) { let sub = getNum(2, 10); q = `Finn ${v}: <b>${v} - ${sub} = ${ans}</b>`; a = ans + sub; }
                else if (type === 3) { let fac = getNum(2, 5); q = `Finn ${v}: <b>${fac}${v} = ${fac * ans}</b>`; a = ans; }
                else { let fac = getNum(2, 4); let add = getNum(1, 10); q = `Finn ${v}: <b>${fac}${v} + ${add} = ${fac * ans + add}</b>`; a = ans; }
                break;
        }
    } 
    // --- HACKER (Negative tall, større tall, mer kompleks) ---
    else { 
        switch(currentLevel) {
            case 1: // Negative tall og variabler
                let start = getNum(-10, 20); let diff = getNum(5, 20);
                if (type === 1) { q = `Regn ut: <b>${start} - ${diff}</b>`; a = start - diff; }
                else if (type === 2) { q = `Regn ut: <b>${v} - ${diff}</b> når ${v}=${start}`; a = start - diff; }
                else if (type === 3) { q = `Regn ut: <b>${diff} - ${v}</b> når ${v}=${start}`; a = diff - start; }
                else { q = `Regn ut: <b>-${v} + ${diff}</b> når ${v}=${start}`; a = -start + diff; }
                break;
            case 2: // Uttrykk med negative koeffisienter
                let c = getNum(2, 6); let val = getNum(-5, 10); let constant = getNum(5, 20);
                if (type === 1) { q = `Regn ut: <b>-${c}${v} + ${constant}</b> når ${v}=${val}`; a = (-c * val) + constant; }
                else if (type === 2) { q = `Regn ut: <b>${c}${v} - ${constant}</b> når ${v}=${val}`; a = (c * val) - constant; }
                else if (type === 3) { q = `Regn ut: <b>${constant} - ${c}${v}</b> når ${v}=${val}`; a = constant - (c * val); }
                else { q = `Hva er kvadratet av ${v} (altså ${v}²)? (La ${v}=${val})`; a = val * val; }
                break;
            case 3: // Avanserte parenteser
                let f = getNum(2, 5); let inner = getNum(1, 10); let xVal = getNum(2, 8);
                if (type === 1) { q = `Regn ut: <b>${f}(${v} + ${inner}) - 5</b> når ${v}=${xVal}`; a = f * (xVal + inner) - 5; }
                else if (type === 2) { q = `Regn ut: <b>${f}(${inner} - ${v})</b> når ${v}=${xVal}`; a = f * (inner - xVal); }
                else if (type === 3) { q = `Regn ut: <b>${v}(${v} + ${f})</b> når ${v}=${xVal}`; a = xVal * (xVal + f); }
                else { q = `Regn ut: <b>(${v} + ${f}) · (${v} - 1)</b> når ${v}=${xVal}`; a = (xVal + f) * (xVal - 1); }
                break;
            case 4: // To variabler + potenser
                let x = getNum(2, 6); let y = getNum(2, 6);
                if (type === 1) { q = `Hvis x=${x} og y=${y}, hva er <b>x² + y</b>?`; a = (x*x) + y; }
                else if (type === 2) { q = `Hvis a=${x} og b=${y}, hva er <b>2a - 3b</b>?`; a = (2*x) - (3*y); }
                else if (type === 3) { q = `Hvis x=${x} og y=${y}, hva er <b>x · y - x</b>?`; a = (x*y) - x; }
                else { q = `Hvis ${v}=${x}, hva er <b>${v}³</b> (${v}·${v}·${v})?`; a = x*x*x; }
                break;
            case 5: // Likninger med x på begge sider eller divisjon
                let ans = getNum(3, 12);
                if (type === 1) { let c1=getNum(3,5); let c2=getNum(1,2); let diff=c1-c2; let rest=(c1*ans)-(c2*ans); q=`Finn ${v}: <b>${c1}${v} = ${c2}${v} + ${rest}</b>`; a=ans; }
                else if (type === 2) { let add=getNum(10,30); q=`Finn ${v}: <b>${v}/2 + 5 = ${ans/2 + 5}</b> (Hint: Svaret er ${ans})`; a=ans; }
                else if (type === 3) { let fac=getNum(2,4); let sub=getNum(5,15); q=`Finn ${v}: <b>${fac}${v} - ${sub} = ${fac*ans - sub}</b>`; a=ans; }
                else { let tot = ans + 10; q = `Jeg tenker på et tall. Hvis jeg legger til 10 får jeg ${tot}. Hva er tallet?`; a = ans; }
                break;
        }
    }
    
    currentAnswer = a;
    const qt = document.getElementById('question-text');
    if(qt) {
        qt.innerHTML = q;
        qt.style.color = "#00ff41"; // Reset farge fra debug-mode
    }
}

// --- FEILSØKING (Debugging) ---
function generateDebugTask() {
    isDebugTask = true;
    let v = getVar();
    let wrongAns = getNum(10, 50);
    let rightAns = getNum(2, 9);
    let eqResult = rightAns * 3 + 5;
    
    let msgType = getNum(1, 3);
    let logMsg = "";
    
    if (msgType === 1) {
        logMsg = `SYSTEM ERROR:<br>Likning: 3${v} + 5 = ${eqResult}<br>Systemet beregnet: ${v} = ${wrongAns}<br>Hva er RIKTIG verdi?`;
    } else if (msgType === 2) {
        logMsg = `BUG DETECTED:<br>Kode: if (${v} + 10 == ${rightAns + 10})<br>Output: ${v} is ${wrongAns} (False)<br>Hva må ${v} være?`;
    } else {
        logMsg = `CRASH REPORT:<br>Forventet: ${v} * ${v} = ${rightAns * rightAns}<br>Mottatt: ${v} = ${wrongAns}<br>Korrigér verdien til ${v}.`;
    }
    
    currentAnswer = rightAns;
    const qt = document.getElementById('question-text');
    if(qt) {
        qt.innerHTML = logMsg;
        qt.style.color = "#ffaa00";
    }
}

// --- HINT SYSTEM ---
window.useHint = function() {
    timeLeft -= 60; 
    playSound('wrong'); 
    let hint = "";
    
    if (isDebugTask) {
        hint = "Sett inn 'Systemet beregnet' tallet i likningen. Stemmer det? Nei. Regn ut selv.";
    } else if (difficulty === 1) {
        if(currentLevel <= 2) hint = "Bytt ut bokstaven med tallet som er oppgitt.";
        else if(currentLevel === 5) hint = "Tenk: Hvilket tall må stå i stedet for bokstaven for at svaret skal bli riktig?";
        else hint = "Følg reglene: Ganging gjøres før pluss og minus.";
    } else {
        hint = "Husk fortegnsregler: Minus ganger minus blir pluss.";
    }
    
    const hDiv = document.getElementById('hint-text');
    if(hDiv) {
        hDiv.innerText = "HINT: " + hint; 
        hDiv.style.display = 'block';
    }
}

// --- SJEKK SVAR ---
window.checkAnswer = function() {
    const inputField = document.getElementById('user-input');
    let userVal = parseInt(inputField.value);
    
    if (isNaN(userVal)) {
        // Enkel sjekk for tom input
        inputField.focus();
        return;
    }

    if (userVal === currentAnswer) {
        playSound('correct'); 
        tasksSolved++; 
        combo++;
        
        if (combo >= 3) { 
            document.body.classList.add('combo-mode'); 
            const comboBadge = document.getElementById('combo-badge');
            if(comboBadge) comboBadge.style.display = 'inline'; 
            matrixColor = "#ffcc00"; 
        }

        animateLock();
        
        if (tasksSolved >= tasksPerLevel) {
            nextLevel();
        } else {
            setTimeout(generateQuestion, 1000);
        }
    } else {
        playSound('wrong'); 
        combo = 0; 
        document.body.classList.remove('combo-mode'); 
        const comboBadge = document.getElementById('combo-badge');
        if(comboBadge) comboBadge.style.display = 'none'; 
        matrixColor = "#00ff41";
        
        inputField.classList.add('shake'); 
        setTimeout(() => inputField.classList.remove('shake'), 500);
    }
    inputField.value = ""; 
    inputField.focus(); 
    updateUI();
}

function nextLevel() {
    playSound('win');
    const lockText = document.getElementById('lock-status-text');
    if(lockText) {
        lockText.innerText = "ACCESS GRANTED";
        lockText.style.color = "#00ff41";
    }
    
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

// --- VISUELLE EFFEKTER & LÅSER ---
function animateLock() {
    const ls = document.getElementById('lock-status-text'); 
    if(ls) {
        ls.innerText = "DEKRYPTERER..."; 
        ls.style.color = "yellow";
    }

    if (currentLevel === 1) { 
        const screen = document.getElementById('keypad-screen');
        if(screen) screen.innerText = "CODE: " + currentAnswer; 
        let keys = document.querySelectorAll('.keypad-grid div'); 
        if(keys.length > 0) {
            keys[Math.floor(Math.random()*keys.length)].classList.add('pressed'); 
            setTimeout(()=> document.querySelectorAll('.pressed').forEach(k=>k.classList.remove('pressed')), 200);
        }
    }
    else if (currentLevel === 2) { 
        rotation += (360/tasksPerLevel); 
        const dial = document.getElementById('safe-dial');
        if(dial) dial.style.transform = `rotate(${rotation}deg)`; 
        const led = document.getElementById(`sl-${Math.ceil((tasksSolved/tasksPerLevel)*7)}`);
        if(led) led.classList.add('on'); 
    }
    else if (currentLevel === 3) { 
        const slot = document.getElementById(`srv-${Math.ceil((tasksSolved/tasksPerLevel)*7)}`);
        if(slot) slot.classList.add('hacked'); 
    }
    else if (currentLevel === 4) { 
        let chars = document.querySelectorAll('.matrix-char'); 
        if(chars.length > 0) chars[Math.floor(Math.random()*chars.length)].classList.add('active'); 
    }
    else if (currentLevel === 5) { 
        let pct = Math.floor((tasksSolved/tasksPerLevel)*100); 
        const core = document.getElementById('core-center');
        if(core) core.innerText = pct + "%"; 
    }
}

function updateLockVisuals(reset) {
    document.querySelectorAll('.lock-mechanism').forEach(el => el.classList.remove('active'));
    let active = document.getElementById(`lock-level-${currentLevel}`); 
    if(active) active.classList.add('active');
    
    const titles = ["KEYPAD", "SAFE_DIAL", "SERVER_RACK", "MATRIX_GRID", "CORE_REACTOR"];
    const header = document.getElementById('lock-header');
    if(header) header.innerText = titles[currentLevel-1];
    
    if(reset) {
        const status = document.getElementById('lock-status-text');
        if(status) {
            status.innerText = "LÅST"; 
            status.style.color = "red";
        }
        document.querySelectorAll('.led').forEach(l=>l.classList.remove('on'));
        document.querySelectorAll('.hacked').forEach(h=>h.classList.remove('hacked'));
        document.querySelectorAll('.matrix-char').forEach(c=>c.classList.remove('active'));
        if (currentLevel === 2) rotation = 0;
    }
}

// --- BRANNMUR ---
let fwTimer;
function startFirewallLoop() {
    setInterval(() => { 
        const fwModal = document.getElementById('firewall-modal');
        if (Math.random() < 0.25 && fwModal && fwModal.style.display !== 'flex') triggerFirewall(); 
    }, 40000);
}

function triggerFirewall() {
    playSound('alarm'); 
    matrixColor = "red";
    
    const modal = document.getElementById('firewall-modal'); 
    const taskEl = document.getElementById('firewall-task'); 
    const input = document.getElementById('firewall-input'); 
    const bar = document.getElementById('fw-timer-bar');
    
    if(!modal) return;

    let n1 = getNum(5, 15), n2 = getNum(5, 15); 
    taskEl.innerText = `${n1} + ${n2}`;
    modal.style.display = 'flex'; 
    input.value = ""; 
    input.focus();
    
    bar.style.width = "100%"; 
    let width = 100;
    
    fwTimer = setInterval(() => { 
        width -= 1; 
        bar.style.width = width + "%"; 
        if (width <= 0) { 
            clearInterval(fwTimer); 
            modal.style.display = 'none'; 
            timeLeft -= 60; 
            playSound('wrong'); 
            matrixColor = "#00ff41"; 
            alert("BRANNMUR BRØT GJENNOM! -60 sekunder."); 
        } 
    }, 100);
    
    window.checkFirewall = function() { 
        if (parseInt(input.value) === (n1 + n2)) { 
            clearInterval(fwTimer); 
            modal.style.display = 'none'; 
            playSound('correct'); 
            matrixColor = document.body.classList.contains('combo-mode') ? "#ffcc00" : "#00ff41"; 
            const mainInput = document.getElementById('user-input');
            if(mainInput) mainInput.focus(); 
        } else {
            input.style.borderColor = "red"; 
        }
    }
}
window.handleFirewallEnter = function(e) { if(e.key === 'Enter') checkFirewall(); }

// --- UI & TIMER ---
window.handleEnter = function(e) { if(e.key === 'Enter') checkAnswer(); else playSound('type'); }

function updateUI() { 
    const sub = document.getElementById('sub-progress-text');
    if(sub) sub.innerText = `${tasksSolved}/${tasksPerLevel}`; 
    
    const lvl = document.getElementById('level-indicator');
    if(lvl) lvl.innerText = `Nivå: ${currentLevel}/${maxLevels}`; 
    
    const fill = document.getElementById('progress-fill');
    if(fill) {
        let totalProgress = ((currentLevel - 1) / maxLevels) * 100;
        fill.style.width = totalProgress + "%";
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        let m = Math.floor(timeLeft / 60); 
        let s = timeLeft % 60;
        const tEl = document.getElementById('timer');
        if(tEl) tEl.innerText = `${m}:${s < 10 ? '0'+s : s}`;
        
        if (timeLeft <= 0) { 
            clearInterval(timerInterval); 
            alert("TIDEN ER UTE!"); 
            location.reload(); 
        }
        timeLeft--;
    }, 1000);
}
