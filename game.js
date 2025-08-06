document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const playButton = document.getElementById('playButton');

    // --- NOUVEAU : Chargement de l'image de l'oiseau ---
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
    let bird, pipes, score, gameOver, gameStarted, frameCount;
    let birdSize, pipeWidth, pipeGap, pipeSpeed, gravity, jumpStrength;

    function initializeGameVariables() {
        const baseHeight = 640;
        const scale = canvas.height / baseHeight;

        // Ajustez ces valeurs pour correspondre aux dimensions de votre image
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
        floatingTexts = [];
    }


    // --- Fonctions de dessin ---

    /**
     * MODIFIÉ : Dessine l'image chargée de l'oiseau sur le canvas.
     */
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


    // --- Logique du jeu ---

    function startGame() {
        initializeGameVariables();
        bird.y = canvas.height / 2;
        bird.velocityY = 0;
        gameOver = false;
        gameStarted = true;
        playButton.style.display = 'none';
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

        if (frameCount % 5 === 0) {
            const newText = {
                content: artisticTextsList[Math.floor(Math.random() * artisticTextsList.length)],
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 30 + 20,
                angle: (Math.random() - 0.5) * Math.PI,
                alpha: 1.0
            };
            floatingTexts.push(newText);
        }
        floatingTexts.forEach(text => { text.alpha -= 0.004; });
        floatingTexts = floatingTexts.filter(text => text.alpha > 0);

        checkCollisions();
        pipes.forEach(pipe => {
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                score++;
                pipe.passed = true;
            }
        });
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
            drawGameOver();
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
            if (gameStarted) { jump(); } else { startGame(); }
        }
    });
    canvas.addEventListener('click', () => {
        if (gameStarted) { jump(); }
    });

    function handleResize() {
        setupCanvas();
        initializeGameVariables();
        drawStartScreen();
    }
    window.addEventListener('resize', handleResize);

    // --- Démarrage initial ---
    setupCanvas();
    initializeGameVariables();

    // On cache le bouton de jeu le temps que l'image charge
    playButton.style.display = 'none';

    // --- NOUVEAU : Déclenchement du chargement et affichage initial ---
    birdImage.onload = () => {
        imageLoaded = true;
        // Une fois l'image prête, on affiche l'écran de démarrage
        drawStartScreen();
    };
    birdImage.onerror = () => {
        console.error("L'image de l'oiseau n'a pas pu être chargée. Vérifiez l'URL.");
        // Gérer l'erreur, par exemple en affichant un message.
    };
    // !!! IMPORTANT : Remplacez l'URL ci-dessous par un lien direct vers votre image.
    birdImage.src = 'https://www.sns.id/assets/logo/brand.svg';

});