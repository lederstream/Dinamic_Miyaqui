// 🎵 Sonidos
const soundDraw = new Audio("sounds/draw.mp3");
const soundEliminate = new Audio("sounds/eliminate.mp3");
const soundWin = new Audio("sounds/win.mp3");

const addPlayerModalBtn = document.getElementById("addPlayerModalBtn");
const playerCards = document.getElementById("playerCards");
const playerModal = document.getElementById("playerModal");
const modalName = document.getElementById("modalName");
const modalNumber = document.getElementById("modalNumber");
const savePlayer = document.getElementById("savePlayer");
const cancelModal = document.getElementById("cancelModal");
const modalError = document.getElementById("modalError");
const numberTable = document.getElementById("numberTable");
const startGameBtn = document.getElementById("startGameBtn");
const gameSection = document.getElementById("game");
const playerList = document.getElementById("playerList");
const drawBtn = document.getElementById("drawBtn");
const drawResult = document.getElementById("drawResult");
const historyContainer = document.getElementById("history");
const winnerScreen = document.getElementById("winnerScreen");
const winnerName = document.getElementById("winnerName");
const playAgainBtn = document.getElementById("playAgain");
const rankingList = document.getElementById("rankingList");
const themeToggle = document.getElementById("themeToggle");

let players = [];
let history = [];

function saveGame() {
  localStorage.setItem("pina_players", JSON.stringify(players));
  localStorage.setItem("pina_history", JSON.stringify(history));
}

function loadGame() {
  const saved = localStorage.getItem("pina_players");
  if (saved) {
    players = JSON.parse(saved);
    history = JSON.parse(localStorage.getItem("pina_history")) || [];
    renderPlayers();
    history.forEach(n => updateHistory(n));
    document.getElementById("setup").classList.add("hidden");
    gameSection.classList.remove("hidden");
  }
}

function renderPlayers() {
  playerList.innerHTML = "";
  const sortedPlayers = [...players].sort((a, b) => a.number - b.number);
  sortedPlayers.forEach(p => {
    const card = document.createElement("div");
    card.className = "player-card" + (p.eliminated ? " eliminated" : "");
    const emoji = p.strikes >= 4 ? "💀" : ["🙂", "😐", "😣", "😵"][p.strikes] || "🙂";

    card.innerHTML = `
      <div class="emoji">${emoji}</div>
      <h3>${p.name}</h3>
      <p>🎯 N° ${p.number}</p>
      <div class="strikes">❌ ${p.strikes}/4</div>
    `;
    playerList.appendChild(card);
  });
  saveGame();
}

function updateHistory(num) {
  history.push(num);
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = num;
  historyContainer.appendChild(bubble);
  saveGame();
}

function updateRanking(winnerName) {
  const key = "pina_ranking";
  const ranking = JSON.parse(localStorage.getItem(key)) || {};
  ranking[winnerName] = (ranking[winnerName] || 0) + 1;
  localStorage.setItem(key, JSON.stringify(ranking));
  renderRanking();
}

function renderRanking() {
  const data = JSON.parse(localStorage.getItem("pina_ranking")) || {};
  rankingList.innerHTML = "";
  const sorted = Object.entries(data).sort((a,b) => b[1] - a[1]);
  sorted.forEach(([name, wins]) => {
    const li = document.createElement("li");
    li.textContent = `${name} - 🏆 ${wins}`;
    rankingList.appendChild(li);
  });
}

drawBtn.addEventListener("click", () => {
  const active = players.filter(p => !p.eliminated);
  if (active.length <= 1) return;

  const nums = [...new Set(active.map(p => p.number))];

  let counter = 0;
  const maxSpins = 20;
  soundDraw.currentTime = 0;
  soundDraw.play();

  const interval = setInterval(() => {
    const fake = Math.floor(Math.random() * 30) + 1;
    drawResult.innerText = `🎱 ${fake}`;
    counter++;

    if (counter >= maxSpins) {
      clearInterval(interval);
      soundDraw.pause();

      const real = nums[Math.floor(Math.random() * nums.length)];
      drawResult.innerText = `🎱 ${real}`;
      updateHistory(real);

      players.forEach(p => {
        if (!p.eliminated && p.number === real) {
          p.strikes++;
          if (p.strikes >= 4) {
            p.eliminated = true;
            soundEliminate.play();
          }
        }
      });

      renderPlayers();

      const alive = players.filter(p => !p.eliminated);
      if (alive.length === 1) {
        gameSection.classList.add("hidden");
        winnerScreen.classList.remove("hidden");
        winnerName.textContent = `🏆 Ganador: ${alive[0].name}`;
        updateRanking(alive[0].name);
        soundWin.play();
        localStorage.removeItem("pina_players");
        localStorage.removeItem("pina_history");
      }
    }
  }, 80);
});

// Modal open/close
addPlayerModalBtn.addEventListener("click", () => {
  modalName.value = "";
  modalNumber.value = "";
  modalError.textContent = "";
  playerModal.classList.remove("hidden");
  modalName.focus();
});

cancelModal.addEventListener("click", () => {
  playerModal.classList.add("hidden");
});

function updatePlayerCards() {
  playerCards.innerHTML = "";
  players.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "player-card";
    div.innerHTML = `
      <p>🧍 ${p.name}</p>
      <p>🎯 ${p.number}</p>
      <button class="remove-btn" onclick="removePlayer(${i})">🗑</button>
    `;
    playerCards.appendChild(div);
  });
  updateNumberTable();
}

function removePlayer(index) {
  players.splice(index, 1);
  updatePlayerCards();
}

savePlayer.addEventListener("click", () => {
  const name = modalName.value.trim();
  const number = parseInt(modalNumber.value);

  if (!name || isNaN(number) || number < 1 || number > 30) {
    modalError.textContent = "Completa los datos correctamente.";
    return;
  }

  if (players.some(p => p.number === number)) {
    modalError.textContent = "Ese número ya fue elegido.";
    return;
  }

  players.push({ name, number, strikes: 0, eliminated: false });
  updatePlayerCards();
  playerModal.classList.add("hidden");
});

function updateNumberTable() {
  numberTable.innerHTML = "";
  for (let i = 1; i <= 30; i++) {
    const div = document.createElement("div");
    div.textContent = i;
    if (players.some(p => p.number === i)) {
      div.classList.add("taken");
    }
    numberTable.appendChild(div);
  }
}

startGameBtn.addEventListener("click", () => {
  if (players.length < 2) {
    alert("Debes tener mínimo 2 jugadores.");
    return;
  }
  saveGame();
  document.getElementById("setup").classList.add("hidden");
  gameSection.classList.remove("hidden");
  renderPlayers();
});

playAgainBtn.addEventListener("click", () => {
  location.reload();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("pina_theme", document.body.classList.contains("dark") ? "dark" : "light");
});

(function init() {
  if (localStorage.getItem("pina_theme") === "dark") {
    document.body.classList.add("dark");
  }
  loadGame();
  renderRanking();

  // Estilo para el historial en varias filas
  historyContainer.style.display = "grid";
  historyContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(40px, 1fr))";
  historyContainer.style.gap = "5px";

  // Burbujas con estilo circular
  const style = document.createElement("style");
  style.innerHTML = `
    #history .bubble {
      width: 40px;
      height: 40px;
      background-color: var(--highlight);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1rem;
    }
  `;
  document.head.appendChild(style);
})();
