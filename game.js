document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const playButton = document.getElementById('playButton');

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

    // NOUVEAU : Score à atteindre pour déclencher la fin spéciale
    const FINAL_SCORE_TRIGGER = 15; // Vous pouvez ajuster cette valeur

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
        finalSequenceActive = false; // NOUVEAU
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
        if (finalSequenceActive) return; // Ne pas afficher le score sur l'écran final
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

    // NOUVEAU : Fonction pour dessiner l'écran final
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

        // --- SECTION MODIFIÉE ---
        const scale = canvas.height / 640;
        const boxWidth = 220 * scale;
        const boxHeight = 40 * scale;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = canvas.height - boxHeight - (20 * scale);
        const borderRadius = 10 * scale;

        // Dessine le rectangle avec un fond gris opaque
        ctx.fillStyle = '#4A4A4A'; // MODIFIÉ : Couleur grise opaque
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
        ctx.fill();

        // Écrit le texte en gras et blanc
        ctx.fillStyle = 'white';
        const boxFontSize = 16 * scale;
        ctx.font = `bold ${boxFontSize}px sans-serif`; // MODIFIÉ : Texte en gras
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Built with WebHash', canvas.width / 2, boxY + boxHeight / 2);
        // --- FIN DE LA SECTION MODIFIÉE ---

        playButton.style.display = 'none';
    }

    function drawStartScreen() {
        ctx.fillStyle = 'rgb(19, 36, 67)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `${24 * (canvas.height / 640)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Press “Play” to start', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText('Use the space bar or click to jump', canvas.width / 2, canvas.height / 2);
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
        // --- Logique principale de l'oiseau et des tuyaux ---
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

        // --- MODIFIÉ : Logique des textes flottants ---
        updateFloatingTexts();

        // NOUVEAU : Déclencheur pour la séquence finale
        if (score >= FINAL_SCORE_TRIGGER && !finalSequenceActive) {
            finalSequenceActive = true;
            endGame(); // Met fin au jeu pour lancer l'écran final
        }
    }

    // NOUVEAU : Fonction dédiée à la mise à jour des textes pour plus de clarté
    function updateFloatingTexts() {
        // La fréquence d'apparition et la taille des textes augmentent avec le score
        const textSpawnRate = finalSequenceActive ? 1 : Math.max(1, 5 - Math.floor(score / 3));
        const baseTextSize = finalSequenceActive ? 60 : 20 + score * 2;

        // Le texte s'efface plus lentement à mesure que le score augmente
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
        // MODIFIÉ : Gestion de la boucle de jeu
        if (gameOver) {
            if (finalSequenceActive) {
                // Si la séquence finale est active, on continue d'animer
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                updateFloatingTexts(); // Continue de générer et faire bouger les textes
                drawFinalScreen();
                requestAnimationFrame(gameLoop); // Continue l'animation de l'écran final
            } else {
                // Sinon, on affiche l'écran Game Over normal et on arrête la boucle
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
        drawStartScreen();
    }
    window.addEventListener('resize', handleResize);

    // --- Démarrage initial ---
    setupCanvas();
    initializeGameVariables();

    playButton.style.display = 'none';

    birdImage.onload = () => {
        imageLoaded = true;
        drawStartScreen();
    };
    birdImage.onerror = () => {
        console.error("L'image de l'oiseau n'a pas pu être chargée. Vérifiez l'URL.");
        // Gérer l'erreur, par exemple en dessinant un carré à la place
        imageLoaded = false; // On indique que l'image n'est pas chargée
        drawStartScreen(); // On peut quand même démarrer
    };
    birdImage.src = 'https://www.sns.id/assets/logo/brand.svg';
});