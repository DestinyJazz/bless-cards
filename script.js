// script.js — robust version with fallback when blessings.json can't be loaded
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM elements (IDs must match those in index.html) ---
  const drawBtn = document.getElementById('draw-btn');
  const shareBtn = document.getElementById('share-btn');
  const musicBtn = document.getElementById('music-btn');
  const card = document.getElementById('blessing-card');
  const bgm = document.getElementById('bgm'); // <audio id="bgm" ...>

  // --- state ---
  let blessings = [];            // loaded from blessings.json (or fallback)
  let currentBlessing = null;
  let audioPlaying = true;

  // --- fallback data (used if fetch fails) ---
  const FALLBACK = [
    {
      "zh": "耶和华是我的牧者，我必不致缺乏。",
      "en": "The Lord is my shepherd; I shall not want.",
      "ms": "Tuhan ialah gembalaku, aku tidak kekurangan apa-apa.",
      "ref": "诗篇 Psalm 23:1"
    },
    {
      "zh": "你要专心仰赖耶和华，不可倚靠自己的聪明。",
      "en": "Trust in the Lord with all your heart and lean not on your own understanding.",
      "ms": "Percayalah kepada Tuhan dengan segenap hatimu dan janganlah bersandar kepada pengertianmu sendiri.",
      "ref": "箴言 Proverbs 3:5"
    },
    {
      "zh": "凡你们所做的，都要凭爱心而做。",
      "en": "Do everything in love.",
      "ms": "Lakukan segala sesuatu dengan kasih.",
      "ref": "哥林多前书 1 Corinthians 16:14"
    }
  ];

  // --- helper: render blessing into card ---
  function renderBlessing(item) {
    if (!item) return;
    currentBlessing = item;
    card.innerHTML = `
      <div class="blessing-text">
        <p style="margin-bottom:.6em;"><b>${item.zh}</b></p>
        <p style="margin-bottom:.4em;"><i>${item.en}</i></p>
        <p style="margin-bottom:.6em;">${item.ms}</p>
        <small style="color:#666">📖 ${item.ref || ''}</small>
      </div>
    `;
    // small visual pulse
    card.classList.add('pulse-temp');
    setTimeout(()=> card.classList.remove('pulse-temp'), 600);
  }

  // --- draw logic ---
  function drawRandom() {
    if (!Array.isArray(blessings) || blessings.length === 0) {
      card.textContent = '祝福语载入中或无法载入，请稍后再试。';
      return;
    }
    const idx = Math.floor(Math.random() * blessings.length);
    renderBlessing(blessings[idx]);
  }

  // --- share logic (navigator.share or WA + FB fallback) ---
  function shareCurrent() {
    if (!currentBlessing) {
      alert('请先抽取祝福 / Please draw a blessing first / Sila dapatkan berkat dahulu');
      return;
    }
    const text = `🌸 ${currentBlessing.zh}\n\n${currentBlessing.en}\n\n${currentBlessing.ms}\n\n📖 ${currentBlessing.ref || ''}`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: '每日祝福 | Blessing of the Day',
        text,
        url
      }).catch(()=>{/*可能被取消*/});
    } else {
      const encoded = encodeURIComponent(`${text}\n${url}`);
      const wa = `https://wa.me/?text=${encoded}`; // WhatsApp
      const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encoded}`; // Facebook
      window.open(wa, '_blank');
      // open fb after a short delay so the two windows don't fight pop-up blockers
      setTimeout(()=> window.open(fb, '_blank'), 800);
    }
  }

  // --- audio control UI update ---
  function updateMusicBtn() {
    if (!musicBtn) return;
    // text in three languages as per your requirement
    musicBtn.textContent = audioPlaying
      ? '暂停音乐 | Pause Music | Hentikan Muzik'
      : '播放音乐 | Play Music | Main Muzik';
  }

  // --- try autoplay (may be blocked on some browsers) ---
  function tryAutoPlay() {
    if (!bgm) return;
    bgm.volume = 0.28;
    bgm.play()
      .then(() => { audioPlaying = true; updateMusicBtn(); })
      .catch(() => { audioPlaying = false; updateMusicBtn(); });
  }

  // --- event bindings (safe: DOM loaded) ---
  if (drawBtn) drawBtn.addEventListener('click', drawRandom);
  if (shareBtn) shareBtn.addEventListener('click', shareCurrent);
  if (musicBtn && bgm) {
    musicBtn.addEventListener('click', () => {
      if (audioPlaying) {
        bgm.pause();
        audioPlaying = false;
      } else {
        bgm.play().catch(()=>{/*如果被阻止*/});
        audioPlaying = true;
      }
      updateMusicBtn();
    });
  }

  // --- load blessings.json, otherwise use fallback ---
  fetch('blessings.json')
    .then(resp => {
      if (!resp.ok) throw new Error('load failed');
      return resp.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) throw new Error('invalid json');
      blessings = data;
      // optional: show a random blessing on load
      // drawRandom();
    })
    .catch(err => {
      console.warn('Failed to load blessings.json — using fallback. Error:', err);
      blessings = FALLBACK.slice();
      // show one so user sees something immediately
      renderBlessing(blessings[0]);
    })
    .finally(() => {
      // attempt autoplay after data loaded
      tryAutoPlay();
      updateMusicBtn();
    });

  // --- small CSS pulse helper class for card (in case you want to tweak visual) ---
  // ensure pulse-temp style exists or add it dynamically
  (function ensurePulseStyle(){
    const id = 'script-pulse-style';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      .pulse-temp { transform: translateY(-6px) scale(1.01); box-shadow: 0 18px 40px rgba(0,0,0,0.12); transition: all .25s ease; }
    `;
    document.head.appendChild(style);
  })();
});
