@import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Orbitron:wght@900&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    user-select: none;
}

body {
    background-color: #020106;
    color: #fff;
    font-family: 'Orbitron', sans-serif;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
}

/* 3D Canvas */
#stage3d {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    display: block;
}

/* Hauptmenü Container */
.menu {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(850px, 92vw);
    text-align: center;
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* LOOGO: Wuchtig, schräg & edler Glow */
.logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: skewY(-3deg) rotate(-2deg);
    position: relative;
}

.logo-word {
    font-family: 'Black Han Sans', sans-serif;
    text-transform: uppercase;
    line-height: 0.85;
    letter-spacing: 4px;
}

.logo-word.party {
    font-size: clamp(3.8rem, 11vw, 7rem);
    color: #fff;
    text-shadow: 
        0 0 10px #ff0055,
        0 0 25px #ff0055,
        0 0 50px #ff0055,
        3px 3px 0px #000;
    animation: titleGlow 2.5s infinite alternate ease-in-out;
}

.logo-word.chaos {
    font-size: clamp(4.5rem, 14vw, 8.5rem);
    color: #00f2ff;
    text-shadow: 
        0 0 10px #00f2ff,
        0 0 30px #00f2ff,
        0 0 60px #0077ff,
        4px 4px 0px #000;
    transform: translateY(-10px) scale(1.05);
    animation: pulseChaos 2s infinite alternate ease-in-out;
}

/* Untertitel als Sleeke Cyber-Badge */
.subtitle {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85rem;
    font-weight: 900;
    letter-spacing: 6px;
    color: #ff3366;
    margin: 25px 0 35px;
    text-transform: uppercase;
    background: rgba(10, 2, 18, 0.85);
    padding: 8px 22px;
    border-left: 3px solid #ff0055;
    border-right: 3px solid #00f2ff;
    box-shadow: 0 0 25px rgba(255, 0, 85, 0.3);
    backdrop-filter: blur(8px);
}

/* BUTTONS: Modernes Cyber-Jackbox Design */
.menu-buttons {
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: min(340px, 85vw);
}

.chaos-button {
    background: rgba(15, 5, 25, 0.85);
    border: 2px solid #00f2ff;
    color: #fff;
    font-family: 'Orbitron', sans-serif;
    font-size: 1.1rem;
    font-weight: 900;
    padding: 18px 28px;
    border-radius: 12px;
    cursor: pointer;
    backdrop-filter: blur(10px);
    box-shadow: 
        0 0 20px rgba(0, 242, 255, 0.25),
        inset 0 0 15px rgba(0, 242, 255, 0.15);
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: skewX(-6deg);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.chaos-button.create {
    border-color: #00f2ff;
}

.chaos-button.join {
    border-color: #ff0055;
    box-shadow: 
        0 0 20px rgba(255, 0, 85, 0.25),
        inset 0 0 15px rgba(255, 0, 85, 0.15);
}

/* Hover & Active Effekte */
.chaos-button:hover {
    transform: scale(1.05) skewX(0deg);
}

.chaos-button.create:hover {
    background: #00f2ff;
    color: #000;
    box-shadow: 0 0 35px #00f2ff;
}

.chaos-button.join:hover {
    background: #ff0055;
    color: #fff;
    box-shadow: 0 0 35px #ff0055;
}

.version {
    margin-top: 35px;
    font-size: 0.7rem;
    color: #8a70a8;
    letter-spacing: 3px;
}

/* Animations */
@keyframes titleGlow {
    0% { filter: drop-shadow(0 0 15px rgba(255, 0, 85, 0.6)); }
    100% { filter: drop-shadow(0 0 30px rgba(255, 0, 85, 1)); }
}

@keyframes pulseChaos {
    0% { transform: translateY(-10px) scale(1.05); }
    100% { transform: translateY(-14px) scale(1.08); }
}
