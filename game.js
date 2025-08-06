document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const playButton = document.getElementById('playButton');

    const birdImage = new Image();
    let imageLoaded = false;

    const artisticTextsList = [
        "gary.sol", "explosed.sol", "madlads.sol", "webhash.sol", "vault.sol", "troll.sol", "pepe.sol", "hodl.sol", "gm.sol", "wagmi.sol", "ngmi.sol", "degen.sol", "lfg.sol", "sns.sol", "rekt.sol", "fomo.sol", "apes.sol", "vibes.sol", "pumpit.sol", "moon.sol", "airdrop.sol", "solana.sol", "memecoin.sol", "whale.sol", "dust.sol", "flip.sol", "grind.sol", "bonk.sol", "lambo.sol", "dapps.sol", "meme.sol", "mfer.sol", "anon.sol", "bullish.sol", "bearish.sol", "ser.sol", "wagie.sol", "gmi.sol", "rugg.sol", "based.sol", "chain.sol", "onchain.sol", "offchain.sol", "staking.sol", "sniped.sol"
    ];
    let floatingTexts = [];

    // --- Variables de configuration et d'état ---
    let bird, pipes, score, gameOver, gameStarted, frameCount, finalSequenceActive;
    let birdSize, pipeWidth, pipeGap, pipeSpeed, gravity, jumpStrength;
    const FINAL_SCORE_TRIGGER = 15;

    // --- Initialisation et Configuration ---

    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function initializeGameVariables() {
        // Le `scale` est basé sur la hauteur pour une expérience de jeu constante verticalement.
        const baseHeight = 640;
        const scale = canvas.height / baseHeight;

        birdSize = { width: 50 * scale, height: 40 * scale };
        pipeWidth = 60 * scale;
        pipeGap = 180 * scale;
        pipeSpeed = 3 * scale;
        gravity = 0.15 * scale;
        jumpStrength = -3.5 * scale;

        bird = {
            x: canvas.width / 4,
            y: canvas.height / 2,
            width: birdSize.width,
            height: birdSize.height,
            velocityY: 0
        };

        pipes = [];
        score = 0;
        frameCount = 0;
        gameOver = true;
        gameStarted = false;
        finalSequenceActive = false;
        floatingTexts = [];
    }

    // --- Fonctions de Dessin ---

    function drawBird() {
        if (imageLoaded) {
            ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
        }
    }

    function drawPipes() {
        pipes.forEach(pipe => {
            ctx.fillStyle = 'red';
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        });
    }

    function drawFloatingTexts() {
        floatingTexts.forEach(text => {
            ctx.save();
            ctx.globalAlpha = text.alpha;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = `${text.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.translate(text.x, text.y);
            ctx.rotate(text.angle);
            ctx.fillText(text.content, 0, 0);
            ctx.restore();
        });
    }

    function drawScore() {
        ctx.fillStyle = 'white';
        ctx.font = `${30 * (canvas.height / 640)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(score, canvas.width / 2, 50 * (canvas.height / 640));
    }

    // --- Écrans Spécifiques ---

    function drawStartScreen() {
        ctx.fillStyle = 'rgb(19, 36, 67)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `${24 * (canvas.height / 640)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Appuyez sur "Play" pour commencer', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText('Utilisez la barre Espace ou cliquez pour sauter', canvas.width / 2, canvas.height / 2);
        playButton.textContent = 'Play';
        playButton.style.display = 'block';
    }

    function drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `${50 * (canvas.height / 640)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = `${30 * (canvas.height / 640)}px sans-serif`;
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        playButton.textContent = 'Retry';
        playButton.style.display = 'block';
    }

    function drawFinalScreen() {
        drawFloatingTexts();

        ctx.fillStyle = '#00ff88';
        const fontSize = 70 * (canvas.height / 640);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 15;
        ctx.fillText('SNSxWebHash.sol', canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;

        const scale = canvas.height / 640;
        const boxWidth = 220 * scale;
        const boxHeight = 40 * scale;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = canvas.height - boxHeight - (20 * scale);
        const borderRadius = 10 * scale;

        ctx.fillStyle = '#4A4A4A';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
        ctx.fill();

        ctx.fillStyle = 'white';
        const boxFontSize = 16 * scale;
        ctx.font = `bold ${boxFontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Built with WebHash', canvas.width / 2, boxY + boxHeight / 2);

        playButton.style.display = 'none';
    }

    // --- Logique du jeu (Update) ---

    function updateGame() {
        frameCount++;

        // Mise à jour de l'oiseau et des tuyaux
        bird.velocityY += gravity;
        bird.y += bird.velocityY;

        if (frameCount % 90 === 0) {
            const topHeight = Math.random() * (canvas.height - pipeGap - 150 * (canvas.height / 640)) + 75 * (canvas.height / 640);
            pipes.push({ x: canvas.width, topHeight: topHeight, bottomY: topHeight + pipeGap, passed: false });
        }
        pipes.forEach(pipe => { pipe.x -= pipeSpeed; });
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

        // Mise à jour du score et des collisions
        checkCollisions();
        pipes.forEach(pipe => {
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                score++;
                pipe.passed = true;
            }
        });

        // Vérification de la séquence finale
        if (score >= FINAL_SCORE_TRIGGER) {
            finalSequenceActive = true;
            endGame();
        }
    }

    function updateFloatingTexts() {
        // La logique est la même que l'update de jeu normal si la séquence finale est active
        if (finalSequenceActive) frameCount++;

        const textSpawnRate = finalSequenceActive ? 1 : Math.max(1, 5 - Math.floor(score / 3));
        const baseTextSize = finalSequenceActive ? 60 : 20 + score * 2;
        const alphaDecay = finalSequenceActive ? 0.002 : Math.max(0.001, 0.004 - score * 0.00015);

        if (frameCount % textSpawnRate === 0) {
            floatingTexts.push({
                content: artisticTextsList[Math.floor(Math.random() * artisticTextsList.length)],
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                size: Math.random() * 20 + baseTextSize,
                angle: (Math.random() - 0.5) * Math.PI, alpha: 1.0
            });
        }

        floatingTexts.forEach(text => { text.alpha -= alphaDecay; });
        floatingTexts = floatingTexts.filter(text => text.alpha > 0);
    }

    function checkCollisions() {
        if (bird.y < 0 || bird.y + bird.height > canvas.height) { endGame(); }
        pipes.forEach(pipe => {
            if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x && (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)) {
                endGame();
            }
        });
    }

    // --- Contrôle du jeu ---

    function startGame() {
        initializeGameVariables();
        gameOver = false;
        gameStarted = true;
        playButton.style.display = 'none';
        gameLoop();
    }

    function endGame() {
        if (!gameOver) {
            gameOver = true;
            gameStarted = false;
        }
    }

    function jump() {
        if (!gameOver) {
            bird.velocityY = jumpStrength;
        }
    }

    // --- Boucle de jeu principale ---

    function gameLoop() {
        if (gameOver) {
            // Gère les écrans de fin
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (finalSequenceActive) {
                updateFloatingTexts();
                drawFinalScreen();
                requestAnimationFrame(gameLoop); // Continue l'animation pour l'effet de fond
            } else {
                drawGameOver(); // Statique, pas besoin de requestAnimationFrame
            }
            return;
        }

        // Logique et dessin du jeu en cours
        updateGame();
        updateFloatingTexts();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFloatingTexts();
        drawPipes();
        drawBird();
        drawScore();

        requestAnimationFrame(gameLoop);
    }

    // --- Gestion des événements ---

    function handleResize() {
        // Réinitialise le jeu à l'écran de démarrage. C'est la méthode la plus simple et robuste.
        setupCanvas();
        initializeGameVariables();
        drawStartScreen();
    }

    playButton.addEventListener('click', startGame);
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('click', () => gameStarted && jump());
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (gameStarted) {
                jump();
            } else if (!finalSequenceActive) {
                startGame();
            }
        }
    });

    // --- Démarrage initial ---
    setupCanvas();
    initializeGameVariables();
    playButton.style.display = 'none';

    birdImage.onload = () => {
        imageLoaded = true;
        drawStartScreen();
    };
    birdImage.onerror = () => {
        console.error("L'image de l'oiseau n'a pas pu être chargée.");
        drawStartScreen();
    };
    birdImage.src = 'https://www.sns.id/assets/logo/brand.svg';
});