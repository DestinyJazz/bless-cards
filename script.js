document.addEventListener("DOMContentLoaded", () => {
  const drawBtn = document.getElementById("draw-btn");
  const shareBtn = document.getElementById("share-btn");
  const musicBtn = document.getElementById("music-btn");
  const card = document.getElementById("blessing-card");
  const bgm = document.getElementById("bgm");

  let currentBlessing = null;
  let isPlaying = true;

  // 🎵 播放控制
  musicBtn.addEventListener("click", () => {
    if (isPlaying) {
      bgm.pause();
      musicBtn.textContent = "播放音乐 | Play Music | Main Muzik";
    } else {
      bgm.play();
      musicBtn.textContent = "暂停音乐 | Pause Music | Hentikan Muzik";
    }
    isPlaying = !isPlaying;
  });

  // ✨ 抽取祝福
  drawBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("blessings.json");
      const data = await res.json();
      const randomIndex = Math.floor(Math.random() * data.length);
      currentBlessing = data[randomIndex];

      card.innerHTML = `
        <div class="blessing-text">
          <p><b>${currentBlessing.zh}</b></p>
          <p><i>${currentBlessing.en}</i></p>
          <p>${currentBlessing.ms}</p>
          <small>📖 ${currentBlessing.ref}</small>
        </div>
      `;
    } catch (e) {
      card.textContent = "加载祝福出错，请检查 blessings.json 是否存在。";
    }
  });

  // 💌 分享祝福
  shareBtn.addEventListener("click", () => {
    if (!currentBlessing) {
      alert("请先抽取一则祝福 | Please draw a blessing first | Sila dapatkan berkat dahulu");
      return;
    }
    const text = `🌸 ${currentBlessing.zh}\n${currentBlessing.en}\n${currentBlessing.ms}\n📖 ${currentBlessing.ref}`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: "每日祝福 | Blessing of the Day",
        text,
        url
      });
    } else {
      const encoded = encodeURIComponent(`${text}\n${url}`);
      const waLink = `https://wa.me/?text=${encoded}`;
      const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encoded}`;
      window.open(waLink, "_blank");
      setTimeout(() => window.open(fbLink, "_blank"), 1000);
    }
  });
});
