// script.js - simple, robust, works on GitHub Pages
document.addEventListener('DOMContentLoaded', () => {
  const drawBtn = document.getElementById('draw-btn');
  const verseEl = document.getElementById('verse');
  const refEl = document.getElementById('reference');
  const cardEl = document.getElementById('card');

  const langButtons = document.querySelectorAll('.lang-btn');
  let currentLang = 'zh';
  let blessings = [];

  // audio
  const audio = document.getElementById('bg-audio');
  const audioToggle = document.getElementById('toggle-audio');
  let audioPlaying = false;

  // try autoplay (some browsers block autoplay with sound)
  function tryAutoplay() {
    if (!audio) return;
    audio.volume = 0.28; // 温和音量
    audio.play()
      .then(() => { audioPlaying = true; updateAudioUI(); })
      .catch(() => { audioPlaying = false; updateAudioUI(); });
  }

  // update play/pause UI
  function updateAudioUI() {
    if (!audioToggle) return;
    audioToggle.textContent = audioPlaying ? '⏸️' : '▶️';
  }

  audioToggle && audioToggle.addEventListener('click', () => {
    if (!audio) return;
    if (audioPlaying) {
      audio.pause();
      audioPlaying = false;
    } else {
      audio.play().catch(()=>{/*可能被阻止，需要用户交互*/});
      audioPlaying = true;
    }
    updateAudioUI();
  });

  // language switch
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      langButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = btn.getAttribute('data-lang') || 'zh';
      // clear card when switching
      verseEl.textContent = '';
      refEl.textContent = '';
      cardEl.classList.remove('show');
    });
  });

  // draw function
  function drawBlessing() {
    if (!blessings || blessings.length === 0) {
      verseEl.textContent = '祝福语载入中，请稍等...';
      refEl.textContent = '';
      return;
    }
    const i = Math.floor(Math.random() * blessings.length);
    const item = blessings[i];
    const text = item[currentLang] || item['zh'] || '';
    // try to split verse and reference if possible (we store full string; reference shown in small text)
    // if blessing format is like "经文（书 章:节）"，attempt to split
    const refMatch = text.match(/(.*?)(?:（(.+?)）|\s\((.+?)\))$/);
    if (refMatch) {
      verseEl.textContent = refMatch[1].trim();
      refEl.textContent = (refMatch[2] || refMatch[3] || '').trim();
    } else {
      verseEl.textContent = text;
      refEl.textContent = item['ref'] || '';
    }
    // show animation
    cardEl.classList.add('show');
    setTimeout(() => cardEl.classList.remove('show'), 800);
  }

  // attach click
  drawBtn && drawBtn.addEventListener('click', drawBlessing);

  // load data
  fetch('blessings.json')
    .then(resp => {
      if (!resp.ok) throw new Error('load failed');
      return resp.json();
    })
    .then(data => {
      blessings = data;
      // optionally show a random one initially
      // drawBlessing();
    })
    .catch(err => {
      console.error('Failed to load blessings.json', err);
      verseEl.textContent = '无法载入祝福语，请检查 blessings.json 是否存在且路径正确';
    });

  // attempt autoplay
  tryAutoplay();
});
