function openRuleModal() {
  play("asset/se/可愛い動作.mp3")
  document.getElementById("ruleModal").classList.remove("hidden");
  openRuleSlideshow();
}

// ボタンがあるときだけ、クリックの処理をつける
const game_ruleBtn = document.getElementById("game_ruleBtn");
if (game_ruleBtn) {
  game_ruleBtn.addEventListener("click", openRuleModal);
}

const title_ruleBtn = document.getElementById("title_ruleBtn");
if (title_ruleBtn) {
  title_ruleBtn.addEventListener("click", openRuleModal);
}

document.getElementById("ruleCloseBtn").addEventListener("click", () => {
  play("asset/se/可愛い動作.mp3")
  document.getElementById("ruleModal").classList.add("hidden");
});

//ルール画像のスライドショー表示

const ruleImages = [
  "asset/rule/rule_1.png",
  "asset/rule/rule_2.png",
  "asset/rule/rule_3.png",
  "asset/rule/rule_4.png",
  "asset/rule/rule_5.png",
  "asset/rule/rule_6.png",
];

//スマホ画面用画像パス
//const ruleImages_sp = [
  //"asset/rule/rule_1.png",
  //"asset/rule/rule_2.png",
  //"asset/rule/rule_3.png",
  //"asset/rule/rule_4.png",
  //"asset/rule/rule_5.png",
  //"asset/rule/rule_6.png",
//];

let ruleCurrentPage = 1;

function openRuleSlideshow() {
  ruleCurrentPage = 1;
  renderRulePage(ruleCurrentPage);
}

function renderRulePage(num) {
  //if (window.matchMedia("(max-width: 600px)").matches) {
  //  document.getElementById("ruleImage").src = ruleImages_sp[num - 1];
  //  document.getElementById("rulePageIndicator").textContent =
  //  `${num} / ${ruleImages_sp.length}`;
  //}
  document.getElementById("ruleImage").src = ruleImages[num - 1];
  document.getElementById("rulePageIndicator").textContent =
    `${num} / ${ruleImages.length}`;
}

document.getElementById("rulePrevBtn").addEventListener("click", () => {
  if (ruleCurrentPage > 1) {
    play("asset/se/可愛い動作.mp3")
    ruleCurrentPage--;
    renderRulePage(ruleCurrentPage);
  }
});

document.getElementById("ruleNextBtn").addEventListener("click", () => {
  if (ruleCurrentPage < ruleImages.length) {
    play("asset/se/可愛い動作.mp3")
    ruleCurrentPage++;
    renderRulePage(ruleCurrentPage);
  }
});