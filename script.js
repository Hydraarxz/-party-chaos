/* =========================
   SPIEL ERSTELLEN
========================= */

function createGame() {

    const code =
        Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

    document.getElementById("game").innerHTML = `

        <div class="game-popup">

            <h2>🎉 ROOM CREATED!</h2>

            <div class="room-code">
                ${code}
            </div>

            <p>
                Gib diesen Code deinen Freunden!
            </p>

        </div>
    `;
}


/* =========================
   SPIEL BEITRETEN
========================= */

function joinGame() {

    document.getElementById("game").innerHTML = `

        <div class="game-popup">

            <h2>🚪 JOIN GAME</h2>

            <input
                id="roomCode"
                maxlength="4"
                placeholder="ABCD"
                autocomplete="off"
            >

            <button
                class="chaos-button"
                onclick="joinRoom()"
            >
                LOS GEHT'S!
            </button>

        </div>
    `;
}


/* =========================
   RAUM BEITRETEN
========================= */

function joinRoom() {

    const input =
        document.getElementById("roomCode");

    const code =
        input.value
        .trim()
        .toUpperCase();

    if (code.length !== 4) {

        input.classList.add("shake");

        setTimeout(() => {
            input.classList.remove("shake");
        }, 400);

        return;
    }

    alert(
        "Du trittst Raum " +
        code +
        " bei!"
    );
}


/* =========================
   KONFETTI / PARTIKEL
========================= */

const particleContainer =
    document.getElementById("particles");


const particleSymbols = [
    "◆",
    "●",
    "✦",
    "■",
    "★"
];


function createParticle() {

    const particle =
        document.createElement("div");

    particle.className =
        "particle";

    particle.innerText =
        particleSymbols[
            Math.floor(
                Math.random() *
                particleSymbols.length
            )
        ];

    particle.style.left =
        Math.random() * 100 + "%";

    particle.style.top =
        Math.random() * 100 + "%";

    particle.style.fontSize =
        Math.random() * 12 + 6 + "px";

    particle.style.animationDuration =
        Math.random() * 4 + 3 + "s";

    particle.style.animationDelay =
        Math.random() * 2 + "s";

    particleContainer.appendChild(
        particle
    );


    setTimeout(() => {

        particle.remove();

    }, 8000);
}


/* ständig neue Partikel */

setInterval(
    createParticle,
    250
);
/* =====================================
   INTERAKTIVE PARTY-CHAOS BUCHSTABEN
===================================== */

const letters =
    document.querySelectorAll(".logo-word span");

let draggedLetter = null;

let startX = 0;
let startY = 0;

let currentX = 0;
let currentY = 0;


/* Buchstabe wird angefasst */

letters.forEach(letter => {

    letter.addEventListener(
        "pointerdown",
        startDrag
    );

});


function startDrag(event) {

    event.preventDefault();

    draggedLetter = event.currentTarget;

    draggedLetter.setPointerCapture(
        event.pointerId
    );

    startX = event.clientX;
    startY = event.clientY;

    currentX =
        parseFloat(
            draggedLetter.dataset.x || 0
        );

    currentY =
        parseFloat(
            draggedLetter.dataset.y || 0
        );

    draggedLetter.style.transition =
        "none";

    draggedLetter.addEventListener(
        "pointermove",
        dragLetter
    );

    draggedLetter.addEventListener(
        "pointerup",
        stopDrag
    );

    draggedLetter.addEventListener(
        "pointercancel",
        stopDrag
    );
}


/* Buchstabe bewegen */

function dragLetter(event) {

    if (!draggedLetter) return;

    const movementX =
        event.clientX - startX;

    const movementY =
        event.clientY - startY;


    const newX =
        currentX + movementX;

    const newY =
        currentY + movementY;


    /*
       Je schneller/weiter man zieht,
       desto stärker dreht sich der Buchstabe
    */

    const rotation =
        Math.max(
            -25,
            Math.min(
                25,
                movementX * 0.18
            )
        );


    draggedLetter.style.setProperty(
        "--drag-x",
        newX + "px"
    );

    draggedLetter.style.setProperty(
        "--drag-y",
        newY + "px"
    );

    draggedLetter.style.setProperty(
        "--drag-rotation",
        rotation + "deg"
    );


    draggedLetter.dataset.x =
        newX;

    draggedLetter.dataset.y =
        newY;
}


/* Loslassen */

function stopDrag(event) {

    if (!draggedLetter) return;


    draggedLetter.releasePointerCapture(
        event.pointerId
    );


    draggedLetter.style.transition =
        "transform 0.55s cubic-bezier(.2,1.6,.4,1)";


    /*
       leicht zurückfedern,
       aber nicht komplett auf
       die ursprüngliche Position
    */

    const x =
        parseFloat(
            draggedLetter.dataset.x || 0
        );

    const y =
        parseFloat(
            draggedLetter.dataset.y || 0
        );


    draggedLetter.style.setProperty(
        "--drag-x",
        (x * 0.45) + "px"
    );

    draggedLetter.style.setProperty(
        "--drag-y",
        (y * 0.45) + "px"
    );

    draggedLetter.style.setProperty(
        "--drag-rotation",
        "0deg"
    );


    draggedLetter.removeEventListener(
        "pointermove",
        dragLetter
    );

    draggedLetter.removeEventListener(
        "pointerup",
        stopDrag
    );

    draggedLetter.removeEventListener(
        "pointercancel",
        stopDrag
    );

    draggedLetter = null;
}
