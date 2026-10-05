document.addEventListener("DOMContentLoaded", () => {

    const letters =
        document.querySelectorAll(".logo-word span");

    let active = null;

    letters.forEach(letter => {

        letter.dataset.x = "0";
        letter.dataset.y = "0";

        letter.addEventListener(
            "pointerdown",
            startDrag,
            { passive: false }
        );

    });


    function startDrag(e) {

        e.preventDefault();

        active = e.currentTarget;

        active.classList.add("dragging");

        active.setPointerCapture(e.pointerId);

        active.startX = e.clientX;
        active.startY = e.clientY;

        active.startLetterX =
            Number(active.dataset.x);

        active.startLetterY =
            Number(active.dataset.y);
    }


    document.addEventListener(
        "pointermove",
        e => {

            if (!active) return;

            e.preventDefault();

            const dx =
                e.clientX - active.startX;

            const dy =
                e.clientY - active.startY;


            const x =
                active.startLetterX + dx;

            const y =
                active.startLetterY + dy;


            /*
             * Die Bewegung wird leicht
             * gedämpft, damit es organischer wirkt.
             */

            const rotation =
                Math.max(
                    -28,
                    Math.min(
                        28,
                        dx * 0.12
                    )
                );


            active.dataset.x = x;
            active.dataset.y = y;


            active.style.setProperty(
                "--x",
                `${x}px`
            );

            active.style.setProperty(
                "--y",
                `${y}px`
            );

            active.style.setProperty(
                "--rotation",
                `${rotation}deg`
            );

        },
        { passive: false }
    );


    document.addEventListener(
        "pointerup",
        e => {

            if (!active) return;

            active.classList.remove("dragging");


            /*
             * Kleine Partikel beim Loslassen
             */

            createBurst(
                e.clientX,
                e.clientY
            );


            const finalX =
                Number(active.dataset.x);

            const finalY =
                Number(active.dataset.y);


            /*
             * Feder-Effekt
             */

            active.style.transition =
                "transform .65s cubic-bezier(.16,1.35,.35,1)";


            active.style.setProperty(
                "--x",
                `${finalX * 0.72}px`
            );

            active.style.setProperty(
                "--y",
                `${finalY * 0.72}px`
            );

            active.style.setProperty(
                "--rotation",
                "0deg"
            );


            active.dataset.x =
                finalX * 0.72;

            active.dataset.y =
                finalY * 0.72;


            setTimeout(() => {

                if (active) {

                    active.style.transition =
                        "transform .08s linear";
                }

            }, 650);


            active = null;

        }
    );

});
function createBurst(x, y) {

    const amount = 12;

    for (let i = 0; i < amount; i++) {

        const particle =
            document.createElement("div");

        particle.className =
            "burst-particle";


        particle.style.left =
            `${x}px`;

        particle.style.top =
            `${y}px`;


        const angle =
            Math.random() * Math.PI * 2;

        const distance =
            30 + Math.random() * 70;


        particle.style.setProperty(
            "--dx",
            `${Math.cos(angle) * distance}px`
        );

        particle.style.setProperty(
            "--dy",
            `${Math.sin(angle) * distance}px`
        );


        document.body.appendChild(
            particle
        );


        setTimeout(() => {
            particle.remove();
        }, 650);
    }
}
