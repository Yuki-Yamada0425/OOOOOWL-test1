
function startGame(level) {
    play("asset/se/可愛い動作.mp3")
    setLevel(level);
    initGame();
    //シーン変更用に臨時で追加（7/31）
    setTimeout(() => {changeScene("gameScreen");}, 500);
    playBgm("game");
}


document.querySelectorAll('img').forEach(img => {
  // 右クリックを禁止
  img.addEventListener('contextmenu', e => {
    e.preventDefault();
  });
  // ドラッグを禁止
  img.addEventListener('dragstart', e => {
    e.preventDefault();
  });
});

const bgmList = {
  title: "asset/bgm/Peritune_Gentle_Brew.mp3",
  game:  "asset/bgm/Peritune_Petite_Walk.mp3",
  clear: "asset/bgm/PerituneMaterial_Sweet.mp3",
};

let currentBgm = null;
let currentSceneName = null;

function playBgm(sceneName) {
  //同じBGMが再生中なら再生しない
  if (currentBgm && !currentBgm.paused && currentSceneName === sceneName) {
    return;
  }

  // bgmを止めて最初からにする
  if (currentBgm) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
  }

  currentSceneName = sceneName;

  // 次のシーンのbgmを読み込む
  currentBgm = new Audio(bgmList[sceneName]);
  currentBgm.loop = true;
  currentBgm.volume = 0.5;
  currentBgm.play();
}

document.getElementById("title_ruleBtn").addEventListener("click", () => {
  playBgm("title");
});

document.getElementById("bgm_button").addEventListener("click", () => {
  playBgm("title");
});