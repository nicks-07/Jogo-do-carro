// script.js
// Seleciona o elemento canvas e obtém o contexto 2D para desenhar
const canvas = document.getElementById('gameCanvas'); // canvas do jogo
const ctx = canvas.getContext('2d'); // contexto 2D para desenho

// Elementos do overlay de Game Over
const gameOverDiv = document.getElementById('gameOver'); // div do Game Over
const scoreText = document.getElementById('scoreText'); // elemento que mostra score
const restartBtn = document.getElementById('restartBtn'); // botão de reiniciar

// --- Configurações do jogo ---
const gameWidth = canvas.width; // largura do canvas
const gameHeight = canvas.height; // altura do canvas

// Propriedades do jogador (carro do jogador)
const player = {
  width: 40, //  largura do carro
  height: 70, // altura do carro 
  x: (gameWidth / 2) - 20, // posição x inicial (centralizado)
  y: gameHeight - 90, // posição y inicial (próximo à parte inferior)
  speed: 5, // velocidade de movimento lateral
  color: '#2619b5ff' // cor do carro
};

// Array que contém os obstáculos (outros carros)
let obstacles = []; // inicialmente vazio
let obstacleSpawnTimer = 0; // temporizador para gerar obstáculos
let obstacleSpawnInterval = 90; // intervalo entre obstáculos (frames)

// Variáveis de controle do jogo
let leftPressed = false; // se a seta esquerda está pressionada
let rightPressed = false; // se a seta direita está pressionada
let isRunning = true; // se o jogo está em execução
let score = 0; // pontuação do jogador (tempo sobrevivido)
let frameCount = 0; // conta frames para lógica de pontuação

// Função que cria um novo obstáculo (carro inimigo)
function createObstacle() {
  const width = 40 + Math.random() * 30; // largura aleatória
  const height = 60 + Math.random() * 30; // altura aleatória
  const x = Math.random() * (gameWidth - width); // posição x aleatória dentro do canvas
  const speed = 2 + Math.random() * 2.5; // velocidade do obstáculo
  const color = '#c62828'; // cor do obstáculo (vermelho)
  return { x, y: -height, width, height, speed, color }; // retorna objeto obstáculo
}

// Função que reinicia o estado do jogo
function resetGame() {
  obstacles = []; // limpa obstáculos
  obstacleSpawnTimer = 0; // reseta temporizador
  leftPressed = false; // reseta controles
  rightPressed = false;
  isRunning = true; // marca jogo rodando
  score = 0; // zera pontuação
  frameCount = 0; // zera contador de frames
  player.x = (gameWidth / 2) - player.width / 2; // centraliza o jogador
  gameOverDiv.classList.add('hidden'); // esconde o overlay de Game Over
  requestAnimationFrame(gameLoop); // inicia o loop do jogo novamente
}

// Função para detectar colisão entre dois retângulos (AABB)
function isColliding(a, b) {
  // Colisão se as áreas se sobrepõem em ambos os eixos
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Função para atualizar lógica do jogo em cada frame
function update() {
  if (!isRunning) return; // se o jogo acabou, não atualiza

  // Movimenta jogador conforme teclas pressionadas
  if (leftPressed) {
    player.x -= player.speed; // move para esquerda
  }
  if (rightPressed) {
    player.x += player.speed; // move para direita
  }

  // Mantém o jogador dentro dos limites do canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > gameWidth) player.x = gameWidth - player.width;

  // Gera obstáculos periodicamente
  obstacleSpawnTimer++;
  if (obstacleSpawnTimer > obstacleSpawnInterval) {
    obstacles.push(createObstacle()); // adiciona novo obstáculo
    obstacleSpawnTimer = 0; // reseta temporizador
    // reduz ligeiramente o intervalo para aumentar dificuldade com o tempo
    if (obstacleSpawnInterval > 45) obstacleSpawnInterval -= 1;
  }

  // Atualiza obstáculos: posição e checa colisão
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.y += obs.speed; // move obstáculo para baixo

    // Se o obstáculo saiu da tela, remove e aumenta pontuação
    if (obs.y > gameHeight) {
      obstacles.splice(i, 1); // remove obstáculo do array
      score += 10; // pontuação por desviar
      continue; // pula para o próximo obstáculo
    }

    // Checa colisão com o jogador
    if (isColliding(player, obs)) {
      // Se colidiu, termina o jogo
      endGame();
      return; // sai da função update
    }
  }

  // Pontuação baseada no tempo (frames)
  frameCount++;
  if (frameCount % 60 === 0) {
    // a cada +ou-60 frames (aprox 1 segundo) aumenta um ponto extra
    score += 1;
  }
}

// Função para desenhar o jogador no canvas
function drawPlayer() {
  ctx.fillStyle = player.color; // define cor do carro do jogador
  // desenha o retângulo que representa o carro
  ctx.fillRect(player.x, player.y, player.width, player.height);
  // desenha "janelas" do carro (detalhe simples)
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(player.x + 6, player.y + 12, player.width - 12, 18);
}

// Função para desenhar obstáculos
function drawObstacles() {
  for (const obs of obstacles) {
    ctx.fillStyle = obs.color; // cor do obstáculo
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height); // desenha o retângulo
    // pequeno brilho para dar profundidade
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(obs.x + 6, obs.y + 8, obs.width - 12, 12);
  }
}

// Função para desenhar a estrada (faixas) e score
function drawBackgroundAndUI() {
  // Limpa o canvas inteiro com um tom (fundo já definido no CSS do canvas)
  ctx.clearRect(0, 0, gameWidth, gameHeight);

  // Desenha faixas laterais (bordas da estrada)
  ctx.fillStyle = '#3e3e3e';
  ctx.fillRect(30, 0, gameWidth - 60, gameHeight); // área da estrada

  // Desenha linhas centrais pontilhadas da estrada
  ctx.strokeStyle = '#f5f5f5';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 18]); // traço / espaço
  ctx.beginPath();
  ctx.moveTo(gameWidth / 2, 0);
  ctx.lineTo(gameWidth / 2, gameHeight);
  ctx.stroke();
  ctx.setLineDash([]); // reseta dash

  // Desenha a borda esquerda e direita (faixa de acostamento)
  ctx.fillStyle = '#606060';
  ctx.fillRect(0, 0, 30, gameHeight); // acostamento esquerdo
  ctx.fillRect(gameWidth - 30, 0, 30, gameHeight); // acostamento direito

  // Mostra pontuação no topo
  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  ctx.fillText(`Pontuação: ${score}`, 12, 24);
}

// Função que encerra o jogo (mostra Game Over)
function endGame() {
  isRunning = false; // para o loop de atualização
  // atualiza o texto do overlay com a pontuação
  scoreText.textContent = `Pontuação: ${score}`;
  gameOverDiv.classList.remove('hidden'); // mostra o overlay de Game Over
}

// Loop principal do jogo (atualiza e desenha)
function gameLoop() {
  update(); // atualiza a lógica
  drawBackgroundAndUI(); // desenha o cenário e UI
  drawPlayer(); // desenha o jogador
  drawObstacles(); // desenha os obstáculos

  // Se o jogo ainda está rodando, pede o próximo frame
  if (isRunning) {
    requestAnimationFrame(gameLoop);
  }
}

// --- Controles de teclado ---
// Quando a tecla é pressionada
window.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowLeft' || e.key === 'Left') {
    leftPressed = true; // seta que a tecla esquerda está pressionada
  } else if (e.key === 'ArrowRight' || e.key === 'Right') {
    rightPressed = true; // seta que a tecla direita está pressionada
  }
});

// Quando a tecla é solta
window.addEventListener('keyup', function (e) {
  if (e.key === 'ArrowLeft' || e.key === 'Left') {
    leftPressed = false; // libera movimento esquerda
  } else if (e.key === 'ArrowRight' || e.key === 'Right') {
    rightPressed = false; // libera movimento direita
  }
});

// Suporte a toque: simples toque em metade esquerda/direita do canvas
canvas.addEventListener('touchstart', function (e) {
  e.preventDefault(); // evita rolagem na tela
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if (touchX < gameWidth / 2) {
    leftPressed = true; // toque esquerda -> move para esquerda
  } else {
    rightPressed = true; // toque direita -> move para direita
  }
});

// Termina toque
canvas.addEventListener('touchend', function (e) {
  leftPressed = false;
  rightPressed = false;
});

// Reiniciar quando clicar no botão de reiniciar
restartBtn.addEventListener('click', function () {
  resetGame(); // chama função para reiniciar tudo
});

// Inicia o jogo na primeira carga
requestAnimationFrame(gameLoop);