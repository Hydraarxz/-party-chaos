* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    width: 100%;
    height: 100%;
}

body {
    overflow: hidden;

    font-family:
        Arial Black,
        Impact,
        sans-serif;

    background:
        radial-gradient(
            circle at 50% 40%,
            #30204d 0%,
            #171225 40%,
            #090812 100%
        );

    color: white;
}


/* =========================
   NEON LICHT
========================= */

.neon-light {
    position: absolute;

    width: 600px;
    height: 600px;

    left: 50%;
    top: 40%;

    transform:
        translate(-50%, -50%)
        rotate(15deg);

    background:
        conic-gradient(
            from 180deg,
            transparent,
            rgba(255, 0, 255, 0.20),
            rgba(0, 255, 255, 0.20),
            transparent
        );

    filter: blur(70px);

    opacity: 0.8;

    animation: neonPulse 3s ease-in-out infinite;

    pointer-events: none;
}

@keyframes neonPulse {

    0% {
        transform:
            translate(-50%, -50%)
            scale(0.85)
            rotate(0deg);

        opacity: 0.45;
    }

    50% {
        transform:
            translate(-50%, -50%)
            scale(1.15)
            rotate(12deg);

        opacity: 0.9;
    }

    100% {
        transform:
            translate(-50%, -50%)
            scale(0.85)
            rotate(0deg);

        opacity: 0.45;
    }
}


/* =========================
   HAUPTMENÜ
========================= */

.menu {
    position: relative;

    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    z-index: 10;
}


/* =========================
   LOGO
========================= */

.logo {
    position: relative;

    display: flex;
    flex-direction: column;

    align-items: center;

    transform: rotate(-2deg);

    animation:
        logoFloat 2.7s ease-in-out infinite;
}


/* einzelnes Wort */

.logo-word {
    display: flex;

    font-size: clamp(55px, 12vw, 125px);

    line-height: 0.78;

    letter-spacing: -7px;

    filter:
        drop-shadow(0 12px 0 rgba(0,0,0,0.25))
        drop-shadow(0 0 15px rgba(255,255,255,0.12));
}


/* =========================
   BUCHSTABEN
========================= */

.logo-word span {

    display: inline-block;

    -webkit-text-stroke:
        clamp(3px, 0.7vw, 8px)
        #050505;

    paint-order: stroke fill;

    animation:
        letterChaos
        var(--speed)
        ease-in-out
        infinite;

    transform-origin: center bottom;
}


/* PARTY */

.party span:nth-child(1) {
    color: #ff3b30;
    --speed: 2.1s;
    transform: rotate(-7deg);
}

.party span:nth-child(2) {
    color: #ffd60a;
    --speed: 1.8s;
    transform: rotate(5deg);
}

.party span:nth-child(3) {
    color: #34c759;
    --speed: 2.3s;
    transform: rotate(-3deg);
}

.party span:nth-child(4) {
    color: #00c7ff;
    --speed: 1.7s;
    transform: rotate(7deg);
}

.party span:nth-child(5) {
    color: #bf5af2;
    --speed: 2.5s;
    transform: rotate(-5deg);
}


/* CHAOS */

.chaos {
    margin-top: 12px;
}

.chaos span:nth-child(1) {
    color: #ff2d55;
    --speed: 2.2s;
    transform: rotate(5deg);
}

.chaos span:nth-child(2) {
    color: #ff9f0a;
    --speed: 1.9s;
    transform: rotate(-6deg);
}

.chaos span:nth-child(3) {
    color: #64d2ff;
    --speed: 2.4s;
    transform: rotate(4deg);
}

.chaos span:nth-child(4) {
    color: #30d158;
    --speed: 1.6s;
    transform: rotate(-7deg);
}

.chaos span:nth-child(5) {
    color: #ff375f;
    --speed: 2.0s;
    transform: rotate(6deg);
}


/* =========================
   WACKELN
========================= */

@keyframes letterChaos {

    0%,
    100% {
        transform:
            rotate(var(--rotation, 0deg))
            translateY(0);
    }

    25% {
        transform:
            rotate(2deg)
            translateY(-5px);
    }

    50% {
        transform:
            rotate(-3deg)
            translateY(3px);
    }

    75% {
        transform:
            rotate(3deg)
            translateY(-2px);
    }
}


@keyframes logoFloat {

    0%,
    100% {
        transform:
            translateY(0)
            rotate(-2deg);
    }

    50% {
        transform:
            translateY(-8px)
            rotate(2deg);
    }
}


/* =========================
   SUBTITLE
========================= */

.subtitle {

    margin-top: 35px;

    font-family: Arial, sans-serif;

    font-size: 13px;

    font-weight: 900;

    letter-spacing: 4px;

    opacity: 0.75;

    transform: rotate(1deg);

    animation:
        subtitleFloat
        2s ease-in-out infinite;
}

@keyframes subtitleFloat {

    0%,
    100% {
        transform: rotate(1deg);
    }

    50% {
        transform: rotate(-1deg) translateY(-2px);
    }
}


/* =========================
   BUTTONS
========================= */

.menu-buttons {

    display: flex;

    flex-direction: column;

    gap: 17px;

    width: min(360px, 80vw);

    margin-top: 28px;
}


.chaos-button {

    position: relative;

    border: 5px solid #050505;

    border-radius: 18px;

    padding: 17px 20px;

    font-family: Arial Black, sans-serif;

    font-size: 17px;

    color: #080808;

    cursor: pointer;

    box-shadow:
        0 8px 0 #050505;

    transition:
        transform 0.12s,
        box-shadow 0.12s;

    animation:
        buttonWiggle
        3s
        ease-in-out
        infinite;
}


.create {
    background: #ffd60a;

    transform: rotate(-1deg);
}


.join {
    background: #64d2ff;

    transform: rotate(1.5deg);

    animation-delay: 0.5s;
}


.chaos-button span {
    margin-right: 8px;
}


.chaos-button:hover {

    transform:
        rotate(-2deg)
        scale(1.04);

    box-shadow:
        0 11px 0 #050505;
}


.chaos-button:active {

    transform:
        translateY(7px)
        rotate(1deg);

    box-shadow:
        0 2px 0 #050505;
}


@keyframes buttonWiggle {

    0%,
    90%,
    100% {
        transform: rotate(-1deg);
    }

    92% {
        transform: rotate(1.5deg);
    }

    94% {
        transform: rotate(-2deg);
    }

    96% {
        transform: rotate(1deg);
    }
}


/* =========================
   GLÜHBIRNEN
========================= */

.bulbs {

    position: absolute;

    inset: 0;

    pointer-events: none;

    z-index: 2;
}


.bulbs span {

    position: absolute;

    font-size: 24px;

    filter:
        drop-shadow(0 0 8px #ffe600);

    animation:
        bulbBlink
        1.8s
        ease-in-out
        infinite;
}


.bulbs span:nth-child(1) {
    left: 8%;
    top: 18%;
}

.bulbs span:nth-child(2) {
    right: 10%;
    top: 25%;

    animation-delay: .4s;
}

.bulbs span:nth-child(3) {
    left: 18%;
    bottom: 20%;

    animation-delay: .8s;
}

.bulbs span:nth-child(4) {
    right: 17%;
    bottom: 18%;

    animation-delay: 1.2s;
}

.bulbs span:nth-child(5) {
    left: 4%;
    top: 55%;

    animation-delay: .3s;
}

.bulbs span:nth-child(6) {
    right: 5%;
    top: 60%;

    animation-delay: .9s;
}

.bulbs span:nth-child(7) {
    left: 30%;
    top: 9%;

    animation-delay: 1.4s;
}

.bulbs span:nth-child(8) {
    right: 28%;
    top: 11%;

    animation-delay: .6s;
}


@keyframes bulbBlink {

    0%,
    100% {
        opacity: .35;
        transform: rotate(-8deg) scale(.9);
    }

    50% {
        opacity: 1;
        transform: rotate(8deg) scale(1.15);
    }
}


/* =========================
   VERSION
========================= */

.version {

    position: absolute;

    bottom: 14px;

    font-family: Arial, sans-serif;

    font-size: 10px;

    letter-spacing: 2px;

    opacity: .3;
}


/* =========================
   MOBILE
========================= */

@media (max-width: 600px) {

    .logo-word {
        font-size: 19vw;
        letter-spacing: -4px;
    }

    .subtitle {
        font-size: 10px;
        letter-spacing: 2px;
    }

    .bulbs span {
        font-size: 18px;
    }
}
