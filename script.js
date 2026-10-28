// ===============================
// STEP 1: TIMER LOGIC (Menuju 6 Des 2026)
// ===============================
const targetDate = new Date('2026-12-06T00:00:00').getTime();
const tDays = document.getElementById('t-days');
const tHours = document.getElementById('t-hours');
const tMins = document.getElementById('t-mins');
const tSecs = document.getElementById('t-secs');
let timerInterval;

function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
        clearInterval(timerInterval);
        proceedToStep2();
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    tDays.innerText = String(days).padStart(2, '0');
    tHours.innerText = String(hours).padStart(2, '0');
    tMins.innerText = String(minutes).padStart(2, '0');
    tSecs.innerText = String(seconds).padStart(2, '0');
}

timerInterval = setInterval(updateTimer, 1000);
updateTimer();

// Tombol rahasia untuk skip timer saat ngetes
document.getElementById('skipTimerBtn').addEventListener('click', () => {
    clearInterval(timerInterval);
    proceedToStep2();
});

function proceedToStep2() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    step1.classList.add('opacity-0');
    setTimeout(() => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        setTimeout(() => step2.classList.remove('opacity-0', 'translate-y-4'), 100);
    }, 1000);
}

// ===============================
// STEP 2: LOGIN LOGIC (DD / MM / YYYY)
// ===============================
const dobInput = document.getElementById('dobInput');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');

// Auto format angka menjadi DD / MM / YYYY saat diketik
dobInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 8) value = value.slice(0, 8);
    
    let formatted = '';
    if (value.length > 0) formatted += value.substring(0, 2);
    if (value.length > 2) formatted += ' / ' + value.substring(2, 4);
    if (value.length > 4) formatted += ' / ' + value.substring(4, 8);
    
    e.target.value = formatted;
});

loginBtn.addEventListener('click', () => {
    // Memastikan HANYA angka yang diambil
    const val = dobInput.value.replace(/[^0-9]/g, '');
    
    // Kunci sandinya: 06122007
    if (val === '06122007') {
        errorMsg.classList.add('hidden');
        proceedToStep3();
    } else {
        errorMsg.classList.remove('hidden');
        console.log("Angka yang terbaca sistem: '" + val + "'");
    }
});

function proceedToStep3() {
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    step2.classList.add('opacity-0');
    setTimeout(() => {
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
        setTimeout(() => step3.classList.remove('opacity-0'), 100);
    }, 1000);
}

// ===============================
// STEP 3: MIC DETECT & MUSIK OTOMATIS
// ===============================
let audioCtx, analyser, micStream;
let isBlowing = false;
let ambientSynth, happyBirthdaySynth;

const micBtn = document.getElementById('micBtn');
const micStatus = document.getElementById('micStatus');
const flames = [document.getElementById('flame1'), document.getElementById('flame2'), document.getElementById('flame3')];
const surpriseText = document.getElementById('surpriseText');
const letterArea = document.getElementById('letterArea');
const micArea = document.getElementById('micArea');

micBtn.addEventListener('click', async () => {
    await Tone.start(); 
    setupAmbientMusic();
    setupHappyBirthdayMusic();
    
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(micStream);
        analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 256;
        
        micBtn.classList.add('hidden');
        micStatus.classList.remove('hidden');
        
        detectBlow();
    } catch (err) {
        alert("Akses mikrofon dibutuhkan untuk meniup lilin!");
    }
});

// Fitur Cadangan (JALUR NINJA): Bisa klik api lilin untuk mematikan kalau mic tidak merespon
flames.forEach(f => {
    f.addEventListener('click', () => {
        if (!isBlowing) blowOutCandles();
    });
});

function setupAmbientMusic() {
    ambientSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    ambientSynth.volume.value = -15;
    const notes = ["C4", "E4", "G4", "B4"];
    let i = 0;
    Tone.Transport.scheduleRepeat((time) => {
        ambientSynth.triggerAttackRelease(notes[i % notes.length], "4n", time);
        i++;
    }, "4n");
    Tone.Transport.start();
}

function stopAmbientMusic() {
    Tone.Transport.stop();
    if (ambientSynth) ambientSynth.dispose();
}

function setupHappyBirthdayMusic() {
    happyBirthdaySynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 }
    }).toDestination();
    happyBirthdaySynth.volume.value = -5;
}

function playHappyBirthday() {
    const now = Tone.now();
    const notes = [
        {"note": "G4", "dur": "8n", "time": 0}, {"note": "G4", "dur": "8n", "time": 0.5},
        {"note": "A4", "dur": "4n", "time": 1}, {"note": "G4", "dur": "4n", "time": 1.5},
        {"note": "C5", "dur": "4n", "time": 2}, {"note": "B4", "dur": "2n", "time": 2.5},
        {"note": "G4", "dur": "8n", "time": 3.5}, {"note": "G4", "dur": "8n", "time": 4},
        {"note": "A4", "dur": "4n", "time": 4.5}, {"note": "G4", "dur": "4n", "time": 5},
        {"note": "D5", "dur": "4n", "time": 5.5}, {"note": "C5", "dur": "2n", "time": 6}
    ];
    
    notes.forEach(n => {
        happyBirthdaySynth.triggerAttackRelease(n.note, n.dur, now + n.time);
    });
}

// SENSOR SUPER SENSITIF
function detectBlow() {
    if (isBlowing) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    let maxVolume = 0;
    
    for(let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
        if (dataArray[i] > maxVolume) maxVolume = dataArray[i];
    }
    
    let average = sum / bufferLength;
    
    // Sangat sensitif: Cek rata-rata (average > 10) atau suara hentakan (maxVolume > 20)
    if (average > 10 || maxVolume > 20) { 
        blowOutCandles();
    } else {
        requestAnimationFrame(detectBlow);
    }
}

function blowOutCandles() {
    isBlowing = true;
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop()); 
    }
    
    flames.forEach(f => f.classList.add('extinguished'));
    stopAmbientMusic();
    micArea.classList.add('hidden');
    
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#C4B5D8', '#A084C6', '#C6A76B', '#FFF8F0'] });
    
    setTimeout(() => {
        surpriseText.classList.remove('hidden');
        setTimeout(() => surpriseText.classList.remove('opacity-0', 'scale-50'), 100);
        
        playHappyBirthday(); 
        
        setTimeout(() => {
            letterArea.classList.remove('hidden');
            letterArea.classList.add('flex');
        }, 1500);
    }, 500);
}

// ===============================
// STEP 4: ENVELOPE (Buka & Tutup Surat)
// ===============================
const envelopeContainer = document.getElementById('envelopeContainer');
const envelopeFlap = document.getElementById('envelopeFlap');
const paper = document.getElementById('paper');
const heartSeal = document.getElementById('heartSeal');
const clickHint = document.getElementById('clickHint');
let isEnvelopeOpen = false;

function toggleEnvelope(e) {
    if (e) e.stopPropagation();

    if (!isEnvelopeOpen) {
        // PROSES BUKA SURAT
        isEnvelopeOpen = true;
        
        heartSeal.style.opacity = '0';
        envelopeFlap.classList.add('open-flap');
        clickHint.classList.add('hidden');
        
        document.getElementById('letterArea').style.marginTop = '300px';
        
        setTimeout(() => {
            paper.classList.add('open-paper');
        }, 500); 

    } else {
        // PROSES TUTUP SURAT
        isEnvelopeOpen = false;
        
        // 1. Kertas turun duluan
        paper.classList.remove('open-paper');
        
        // 2. Tunggu kertas selesai turun (1 detik), baru tutup flap & kembalikan posisi
        setTimeout(() => {
            envelopeFlap.classList.remove('open-flap');
            document.getElementById('letterArea').style.marginTop = '0px';
            
            // 3. Munculkan segel hati dan teks petunjuk lagi
            setTimeout(() => {
                heartSeal.style.opacity = '1';
                clickHint.classList.remove('hidden');
                clickHint.innerText = "Klik amplop untuk membuka surat lagi";
            }, 500);
        }, 1000); 
    }
}

envelopeContainer.addEventListener('click', toggleEnvelope);

paper.addEventListener('click', (e) => {
    // Memastikan kita tidak menutup surat kalau cuma mau scroll teks
    if (e.target.id === 'paper') {
        toggleEnvelope(e);
    }
});
