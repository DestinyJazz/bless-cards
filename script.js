let blessings = [];
let currentLang = 'zh';

fetch('blessings.json')
  .then(res => res.json())
  .then(data => blessings = data);

function setLanguage(lang) {
  currentLang = lang;
  document.getElementById("blessing-card").textContent = "";
}

function drawBlessing() {
  if (blessings.length === 0) return;
  const random = blessings[Math.floor(Math.random() * blessings.length)];
  document.getElementById("blessing-card").textContent = random[currentLang];
}
