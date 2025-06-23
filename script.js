const addPlayerBtn = document.getElementById("addPlayer");
const playerForm = document.getElementById("playerForm");
const playersInput = document.getElementById("playersInput");
const gameSection = document.getElementById("game");
const playerList = document.getElementById("playerList");
const drawBtn = document.getElementById("drawBtn");
const drawResult = document.getElementById("drawResult");
const winnerScreen = document.getElementById("winnerScreen");
const winnerName = document.getElementById("winnerName");

let players = [];

addPlayerBtn.addEventListener("click", () => {
  const index = playersInput.children.length + 1;
  const div = document.createElement("div");
  div.innerHTML = `
    <input type="text" placeholder="Nombre jugador ${index}" required />
    <input type="number" placeholder="Número (1-30)" min="1" max="30" required />
  `;
  playersInput.appendChild(div);
});

// Agrega 3 jugadores por defecto
for (let i = 0; i < 3; i++) addPlayerBtn.click();

playerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputs = playersInput.querySelectorAll("div");
  players = [];

  for (let div of inputs) {
    const name = div.children[0].value.trim();
    const number = parseInt(div.children[1].value);
    if (!name || isNaN(number)) continue;

    players.push({
      name,
      number,
      strikes: 0,
      eliminated: false
    });
  }

  if (players.length < 2) {
    alert("Mínimo 2 jugadores.");
    return;
  }

  document.getElementById("setup").classList.add("hidden");
  gameSection.classList.remove("hidden");
  renderPlayers();
});

function renderPlayers() {
  playerList.innerHTML = "";
  players.forEach(player => {
    const div = document.createElement("div");
    div.className = "player-card" + (player.eliminated ? " eliminated" : "");
    
    const emoji = player.strikes >= 4 ? "💀" : ["🙂", "😐", "😣", "😵"][player.strikes] || "🙂";

    div.innerHTML = `
      <div class="emoji">${emoji}</div>
      <h3>${player.name}</h3>
      <p>🎯 N° ${player.number}</p>
      <span>❌ ${player.strikes}/4</span>
    `;
    playerList.appendChild(div);
  });
}

drawBtn.addEventListener("click", () => {
  const activePlayers = players.filter(p => !p.eliminated);
  if (activePlayers.length <= 1) return;

  const availableNumbers = [...new Set(activePlayers.map(p => p.number))];
  const randomNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

  drawResult.innerText = `🎱 ${randomNumber}`;

  players.forEach(player => {
    if (!player.eliminated && player.number === randomNumber) {
      player.strikes += 1;
      if (player.strikes >= 4) {
        player.eliminated = true;
      }
    }
  });

  renderPlayers();

  const stillActive = players.filter(p => !p.eliminated);
  if (stillActive.length === 1) {
    gameSection.classList.add("hidden");
    winnerScreen.classList.remove("hidden");
    winnerName.innerText = `🏆 Ganador: ${stillActive[0].name}`;
  }
});
