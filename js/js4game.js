let gameDuration = 15; // valeur par défaut du timer
let mysteryWord = " ";
const wordDisplay = document.querySelector("#word2guess");
const image = document.querySelector("#gimage");
const controls = document.querySelector("#gcontrols");
const newGameButton = document.querySelector("#newgame");
const resetGameButton = document.querySelector("#restartb");
const compteurElement = document.querySelector("#target");

let handler;
let intervalId;
let timeLeft = gameDuration;
let isGameActive = false; // booléen qui permet de lancer le jeu
let fault = 0;

window.addEventListener("load", showControl);

const durationButtons = document.querySelectorAll('input[name="gameDuration"]');  // on selectionne tous les bouton radio
durationButtons.forEach(button => {
    button.addEventListener('change', function() {
        gameDuration = parseInt(this.value); // on s'assure si la valeur donné est un entier
        if (isGameActive) return;
        timeLeft = gameDuration; 
    });
}); // on donne à gameDuration la valeur du bouton cliqué et on refresh le temps qui reste


newGameButton.addEventListener("click", function() {
    startGame(); 
    showControl();
    newGameButton.style.display = "none";
});


function dessiner(fault) {
    const dessin = document.querySelector(`#i${fault}`);
    if (dessin) {
        dessin.style.display = "block";
    }
} // fonction qui sert à cacher les 7 membre du pendus


function showControl() {
    controls.classList.toggle("notplaying");
    image.classList.toggle("notplaying");
}


async function findword() {
    try {
        let nombrelettre = document.querySelector('input[name="lettree"]:checked');
        let nombre= nombrelettre.value;

        let response = await fetch("https://trouve-mot.fr/api/size/"+nombre);

        if (!response.ok) {
            throw new Error("Erreur de récupération du mot");
        }
        let data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            return data[0].name;
        } else {
            console.log("Format de mot incorrect");
            return "TEST";
        }
    } catch (error) {
        console.error("Erreur de récupération du mot :", error);
    }
} // géneré un mot au hasards dans l'URL  avec le nombre de lettre souhaité


async function startGame() {
    let word = await findword();
    mysteryWord = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    
    if (mysteryWord) {
        setupWordDisplay(); 
        setupLettre();

        timeLeft = gameDuration; 
        compteurElement.textContent = timeLeft; 
        isGameActive = true;

        intervalId = setInterval(() => {
            timeLeft--;
            compteurElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(intervalId);
                endGame("lost");
            }
        }, 1000);
    } // on attends la reception du mot mystere avant de pouvoir jouer.
}


const letters = document.querySelectorAll("#gchars > span");
const letterList = [...letters];
let letterFound = [];

function setupWordDisplay() {
    wordDisplay.innerHTML = ""; 
    letterFound = "_".repeat(mysteryWord.length).split("");
    
    letterFound.forEach(() => {
        const span = document.createElement("span");
        span.textContent = "_";
        span.style.marginRight = "5px";
        wordDisplay.appendChild(span);
    });
} // permet de reinistialliser les "_" et les aficher.


function setupLettre() {
    letterList.forEach(letter => {
        
        letter.addEventListener("click", function() {
            if (!isGameActive || letter.classList.contains("used")) return; 
            const guessedLetter = letter.textContent.toUpperCase();

            if (mysteryWord.includes(guessedLetter)) {
                for (let i = 0; i < mysteryWord.length; i++) {
                    if (mysteryWord[i] === guessedLetter) {
                        letterFound[i] = guessedLetter;
                    }
                }
                letter.classList.add("ok");
            } else {
                fault++;
                letter.classList.add("ko");
                dessiner(fault);
                if (fault >= 7) {
                    endGame("lost");
                    return;
                }
            }
            letter.classList.add("used");
            updateWordDisplay();
        });
    });
} // permet de verifier si on a cliqué sur une lettre du clavier, et si c'est la bonne lettre du mot mystere 


function updateWordDisplay() {
    wordDisplay.innerHTML = ''; 
    letterFound.forEach(letter => {
        const span = document.createElement("span");
        span.textContent = letter;
        span.style.marginRight = "5px";
        wordDisplay.appendChild(span);
    });
    if (letterFound.join('') === mysteryWord) {
        endGame("won"); 
    }
} // reinistiallise le mot afficher à chaque fois que on trouve une lettre, et finir le jeu si toutes les lettres sont trouvés


resetGameButton.addEventListener("click", function() {
    clearTimeout(handler);
    clearInterval(intervalId);
    isGameActive = false; 
    fault = 0;

    letterFound.fill("_");
    updateWordDisplay();
    letterList.forEach(letter => {
        letter.classList.remove("ok", "ko", "used");
    });

    for (let k = 1; k <= 7; k++) {
        const dessin = document.querySelector(`#i${k}`);
        if (dessin) {
            dessin.style.display = "none"; // Cache chaque partie du pendu
        }
    } 
    
    timeLeft = gameDuration; 
    compteurElement.textContent = timeLeft; 
    isGameActive = false; 
    startGame();
});


function endGame(result) {
    clearTimeout(handler); 
    clearInterval(intervalId); 
    isGameActive = false; 
    wordDisplay.innerHTML = ''; 
    const message = document.createElement("span");
    if (result === "won") {
        message.textContent = "You won! The mystery word was " + mysteryWord + "!";
    } else if (result === "lost") {
        message.textContent = "You lost! The mystery word was " + mysteryWord + "!";
    }
    wordDisplay.appendChild(message);
} // donne un message de fin
