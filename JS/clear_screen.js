//level = localStorage.getItem("level");
const clearTitleBtn = document.getElementById('TitleBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const RetryBtn = document.getElementById('RetryBtn');

nextLevelBtn.addEventListener('click', () => {
    if (nextLevel()) {
        initGame();
        changeScene("gameScreen");
        playBgm("game");
    }
    else {
        console.log("全部クリア");
    }
});

RetryBtn.addEventListener('click', () => {
    //ステージを初期化
    initGame();

    //ゲーム画面へ
    changeScene("gameScreen");
    playBgm("game");
});

clearTitleBtn.addEventListener('click', () => {
    changeScene("titleScreen");
    playBgm("title");
});
