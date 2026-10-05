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
