const titleBtn = document.getElementById('gameTitleBtn');
const retryBtn = document.getElementById('retryBtn');
const burger = document.getElementById('burger');
const burgerBtn = document.getElementById('burgerBtn');
const burgerMenu = document.getElementById('burgerMenu');
const burger_openBtn = document.getElementById('burger_openBtn');

burgerBtn.addEventListener("click", () => {
    play("asset/se/可愛い動作.mp3")
    burger.style.display = "none";
    burgerMenu.style.display = "flex";
});

burger_openBtn.addEventListener("click", () => {
    play("asset/se/可愛い動作.mp3")
    burgerMenu.style.display = "none";
    burger.style.display = "flex";
});

titleBtn.addEventListener('click', () => {
    play("asset/se/可愛い動作.mp3")
    burgerMenu.style.display = "none";
    burger.style.display = "flex";
    changeScene("titleScreen");
    playBgm("title")
});

retryBtn.addEventListener('click', () => {
    play("asset/se/可愛い動作.mp3")
    //ステージを初期化
    initGame();

    //ゲーム画面へ
    changeScene("gameScreen");
    playBgm("game");
});

//クリア画面に遷移
function gameClear()
{
    changeScene("clearScreen");
    playBgm("clear");
}
