document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const playButton = document.getElementById('playButton');

    // --- NOUVEAU : Références aux éléments HTML des écrans ---
    const startScreenInfo = document.getElementById('startScreenInfo');
    const finalScreenInfo = document.getElementById('finalScreenInfo');

    // --- Chargement de l'image de l'oiseau ---
    const birdImage = new Image();
    let imageLoaded = false;

    // --- Liste des textes à afficher ---
    const artisticTextsList = [
        "gary.sol", "explosed.sol", "madlads.sol", "webhash.sol", "vault.sol",
        "troll.sol", "pepe.sol", "hodl.sol", "gm.sol", "wagmi.sol", "ngmi.sol",
        "degen.sol", "lfg.sol", "sns.sol", "rekt.sol", "fomo.sol", "apes.sol",
        "vibes.sol", "pumpit.sol", "moon.sol", "airdrop.sol", "solana.sol",
        "memecoin.sol", "whale.sol", "dust.sol", "flip.sol", "grind.sol",
        "bonk.sol", "lambo.sol", "dapps.sol", "meme.sol", "mfer.sol", "anon.sol",
        "bullish.sol", "bearish.sol", "ser.sol", "wagie.sol", "gmi.sol", "rugg.sol",
        "based.sol", "chain.sol", "onchain.sol", "offchain.sol", "staking.sol", "sniped.sol"
    ];
    let floatingTexts = [];

    // --- Fonctions de configuration ---
    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // --- Variables du jeu ---
    let bird, pipes, score, gameOver, gameStarted, frameCount, finalSequenceActive;
    let birdSize, pipeWidth, pipeGap, pipeSpeed, gravity, jumpStrength;

    const FINAL_SCORE_TRIGGER = 15;

    function initializeGameVariables() {
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

    // --- Fonctions de dessin ---
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
        if (finalSequenceActive) return;
        ctx.fillStyle = 'white';
        ctx.font = `${30 * (canvas.height / 640)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(score, canvas.width / 2, 50 * (canvas.height / 640));
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

        // On s'assure que les écrans HTML sont cachés
        finalScreenInfo.style.display = 'none';
        startScreenInfo.style.display = 'none';

        playButton.textContent = 'Retry';
        playButton.style.display = 'block';
    }

    // --- MODIFIÉ : La fonction ne dessine plus de texte, elle gère l'affichage des éléments HTML ---
    function drawFinalScreen() {
        drawFloatingTexts(); // On continue de dessiner les mots qui flottent
        finalScreenInfo.style.display = 'flex'; // Affiche l'écran final HTML
        playButton.style.display = 'none';
    }

    // --- MODIFIÉ : La fonction ne dessine plus de texte, elle gère l'affichage des éléments HTML ---
    function drawStartScreen() {
        ctx.fillStyle = 'rgb(19, 36, 67)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Affiche les éléments HTML de l'écran de démarrage
        startScreenInfo.style.display = 'block';
        finalScreenInfo.style.display = 'none'; // S'assure que l'écran final est caché

        playButton.textContent = 'Play';
        playButton.style.display = 'block';
    }


    // --- Logique du jeu ---
    function startGame() {
        initializeGameVariables();
        bird.y = canvas.height / 2;
        bird.velocityY = 0;
        gameOver = false;
        gameStarted = true;

        // Cache le bouton et les textes de l'écran de démarrage
        playButton.style.display = 'none';
        startScreenInfo.style.display = 'none';

        gameLoop();
    }

    function jump() {
        if (!gameOver) {
            bird.velocityY = jumpStrength;
        }
    }

    function update() {
        bird.velocityY += gravity;
        bird.y += bird.velocityY;

        frameCount++;
        if (frameCount % 90 === 0) {
            const topHeight = Math.random() * (canvas.height - pipeGap - 150 * (canvas.height / 640)) + 75 * (canvas.height / 640);
            pipes.push({ x: canvas.width, topHeight: topHeight, bottomY: topHeight + pipeGap, passed: false });
        }
        pipes.forEach(pipe => { pipe.x -= pipeSpeed; });
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

        checkCollisions();
        pipes.forEach(pipe => {
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                score++;
                pipe.passed = true;
            }
        });

        updateFloatingTexts();

        if (score >= FINAL_SCORE_TRIGGER && !finalSequenceActive) {
            finalSequenceActive = true;
            endGame();
        }
    }

    function updateFloatingTexts() {
        const textSpawnRate = finalSequenceActive ? 1 : Math.max(1, 5 - Math.floor(score / 3));
        const baseTextSize = finalSequenceActive ? 60 : 20 + score * 2;
        const alphaDecay = finalSequenceActive ? 0.002 : Math.max(0.001, 0.004 - score * 0.00015);

        if (frameCount % textSpawnRate === 0) {
            const newText = {
                content: artisticTextsList[Math.floor(Math.random() * artisticTextsList.length)],
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 20 + baseTextSize,
                angle: (Math.random() - 0.5) * Math.PI,
                alpha: 1.0
            };
            floatingTexts.push(newText);
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

    function endGame() {
        if (!gameOver) {
            gameOver = true;
            gameStarted = false;
        }
    }

    function gameLoop() {
        if (gameOver) {
            if (finalSequenceActive) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                updateFloatingTexts();
                drawFinalScreen();
                requestAnimationFrame(gameLoop);
            } else {
                drawGameOver();
            }
            return;
        }

        update();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBird();
        drawPipes();
        drawScore();
        drawFloatingTexts();
        requestAnimationFrame(gameLoop);
    }

    // --- Écouteurs d'événements ---
    playButton.addEventListener('click', startGame);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (gameStarted) { jump(); } else if (!finalSequenceActive) { startGame(); }
        }
    });
    canvas.addEventListener('click', () => {
        if (gameStarted) { jump(); }
    });

    function handleResize() {
        setupCanvas();
        initializeGameVariables();
        // Redessine l'écran de démarrage qui s'adapte à la nouvelle taille
        if (!gameStarted && !finalSequenceActive) {
            drawStartScreen();
        }
    }
    window.addEventListener('resize', handleResize);

    // --- Démarrage initial ---
    setupCanvas();
    initializeGameVariables();

    // Cache les éléments au cas où ils seraient visibles
    playButton.style.display = 'none';
    startScreenInfo.style.display = 'none';
    finalScreenInfo.style.display = 'none';

    birdImage.onload = () => {
        imageLoaded = true;
        drawStartScreen();
    };
    birdImage.onerror = () => {
        console.error("L'image de l'oiseau n'a pas pu être chargée. Vérifiez l'URL.");
        imageLoaded = false;
        drawStartScreen();
    };
    birdImage.src = 'https://www.sns.id/assets/logo/brand.svg';
});