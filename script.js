let totalSeconds = 7200; // 2 horas
let pomodoroSeconds = 1500; // 25 minutos
let breakSeconds = 300; // 5 minutos
let currentPomodoroTime = pomodoroSeconds;
let isStudyTime = true;
let timerStarted = false;

// Variables para calcular tiempo real
let sessionStartTime = null;
let pomodoroStartTime = null;
let pomodoroPhaseStartTime = null;
let accumulatedPomodoroTime = 0;

// Configuración de música
// Configuración de música
const musicPlaylist = [
    'music/505_M4A_128K_.mp3',
    'music/Jósean-Log-Pruébame-a-Ti-_video-oficial__M4A_128K_.mp3',
    'music/Mon-Laferte-Tu-Falta-De-Querer_M4A_128K_.mp3',
    'music/Mon Laferte - Si Tu Me Quisieras (Audio Oficial)(MP3_160K).mp3',
    'music/The-Rolling-Stones-Paint-It_-Black-_Official-Lyric-Video__M4A_128K_.mp3',
    'music/Ya-No-Hay-Verano-Depresión-Sonora_M4A_128K_.mp3',
    'music/Wind(MP3_160K).mp3'
];
let currentTrackIndex = 0;
const audioPlayer = document.getElementById('audioPlayer');

// Cargar la primera canción
audioPlayer.src = musicPlaylist[currentTrackIndex];
audioPlayer.volume = 0.7; // Volumen al 70%

// Evento cuando termina una canción
audioPlayer.addEventListener('ended', () => {
    // Pasar a la siguiente canción
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    audioPlayer.src = musicPlaylist[currentTrackIndex];
    
    // Si estamos en descanso, seguir reproduciendo
    if (!isStudyTime) {
        audioPlayer.play().catch(err => console.log('Error al reproducir:', err));
    }
    
    updateMusicInfo();
});

// Actualizar información de música
audioPlayer.addEventListener('loadedmetadata', () => {
    updateMusicInfo();
});

function updateMusicInfo() {
    const musicInfo = document.getElementById('musicInfo');
    const trackName = musicPlaylist[currentTrackIndex].split('/').pop().replace('.mp3', '');
    
    if (!isStudyTime && !audioPlayer.paused) {
        musicInfo.innerHTML = `🎵 Reproduciendo: ${trackName} (${currentTrackIndex + 1}/${musicPlaylist.length})`;
    } else if (!isStudyTime && audioPlayer.paused) {
        musicInfo.innerHTML = `⏸️ Pausado: ${trackName} (${currentTrackIndex + 1}/${musicPlaylist.length})`;
    } else {
        musicInfo.innerHTML = `🎵 Música lista para descanso`;
    }
}

function playMusic() {
    // Intentar reproducir y manejar el error de autoplay
    const playPromise = audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('Música iniciada correctamente');
                updateMusicInfo();
            })
            .catch(err => {
                console.log('Error al reproducir música (probablemente política de autoplay):', err);
                // Mostrar mensaje al usuario
                const musicInfo = document.getElementById('musicInfo');
                musicInfo.innerHTML = `🔇 Haz clic aquí para activar música`;
                musicInfo.style.cursor = 'pointer';
                musicInfo.onclick = () => {
                    audioPlayer.play();
                    musicInfo.style.cursor = 'default';
                    musicInfo.onclick = null;
                };
            });
    }
}

function pauseMusic() {
    audioPlayer.pause();
    updateMusicInfo();
}

function getPeriod() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'morning';
    if (hour >= 14 && hour < 18) return 'afternoon';
    return 'night';
}

function highlightCurrentSchedule() {
    const now = new Date();
    const day = now.getDay();
    const period = getPeriod();

    document.querySelectorAll('td[data-day]').forEach(td => {
        td.classList.remove('current-slot', 'current-day');
    });

    document.querySelectorAll(`td[data-day="${day}"]`).forEach(td => {
        td.classList.add('current-day');
    });

    const currentSlot = document.querySelector(`td[data-day="${day}"][data-period="${period}"]`);
    if (currentSlot) {
        currentSlot.classList.add('current-slot');
    }
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimer() {
    if (!sessionStartTime) return;
    
    // Calcular tiempo real transcurrido
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - sessionStartTime) / 1000);
    totalSeconds = Math.max(0, 7200 - elapsedSeconds);
    
    document.getElementById('timer').textContent = formatTime(totalSeconds);
    
    // Si llegamos a 0, reiniciar
    if (totalSeconds === 0) {
        sessionStartTime = Date.now();
    }
}

function updatePomodoroTimer() {
    if (!pomodoroPhaseStartTime) return;
    
    const now = Date.now();
    const elapsedInPhase = Math.floor((now - pomodoroPhaseStartTime) / 1000);
    
    if (isStudyTime) {
        currentPomodoroTime = Math.max(0, pomodoroSeconds - elapsedInPhase);
        
        if (currentPomodoroTime === 0) {
            switchToBreak();
        }
    } else {
        currentPomodoroTime = Math.max(0, breakSeconds - elapsedInPhase);
        
        if (currentPomodoroTime === 0) {
            switchToStudy();
        }
    }
    
    updatePomodoroStatus();
}

function updatePomodoroStatus() {
    const statusEl = document.getElementById('pomodoroStatus');
    const pomodoroTime = formatTime(currentPomodoroTime).substring(3);
    
    if (isStudyTime) {
        statusEl.innerHTML = `📚 <strong>TIEMPO DE ESTUDIO</strong><br>Pomodoro: ${pomodoroTime}`;
        statusEl.style.background = 'rgba(76, 175, 80, 0.3)';
    } else {
        statusEl.innerHTML = `☕ <strong>TIEMPO DE DESCANSO</strong><br>Descanso: ${pomodoroTime}`;
        statusEl.style.background = 'rgba(255, 152, 0, 0.3)';
    }
}

function switchToBreak() {
    isStudyTime = false;
    pomodoroPhaseStartTime = Date.now();
    currentPomodoroTime = breakSeconds;
    updatePomodoroStatus();
    playMusic(); // Iniciar música en el descanso
}

function switchToStudy() {
    isStudyTime = true;
    pomodoroPhaseStartTime = Date.now();
    currentPomodoroTime = pomodoroSeconds;
    updatePomodoroStatus();
    pauseMusic(); // Pausar música cuando vuelve al estudio
}

function startTimer() {
    timerStarted = true;
    sessionStartTime = Date.now();
    pomodoroStartTime = Date.now();
    pomodoroPhaseStartTime = Date.now();
    
    // Actualizar cada 100ms para mayor precisión
    setInterval(() => {
        updateTimer();
        updatePomodoroTimer();
    }, 100);
}

// Manejar visibilidad de la página
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && timerStarted) {
        // Cuando vuelve a estar visible, verificar si debe estar sonando música
        if (!isStudyTime && audioPlayer.paused) {
            playMusic();
        }
    }
});

// Inicializar
highlightCurrentSchedule();
updateTimer();
updatePomodoroStatus();
updateMusicInfo();

// Iniciar temporizador después de 50 segundos
setTimeout(() => {
    startTimer();
    document.getElementById('pomodoroStatus').textContent = '⏱️ Temporizador iniciado';
}, 30000);

// Actualizar el resaltado cada minuto
setInterval(highlightCurrentSchedule, 60000);

// Actualizar info de música cada segundo
setInterval(updateMusicInfo, 1000);