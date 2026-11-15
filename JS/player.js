// プレイヤー配列（将来的に複数体を扱うため配列）
//let players = [];
// 初期プレイヤーを1体配置
// players.push({
//   x: 6,
//   y: 2,
//   //color: "red"
// });

let isInputed = false; // 入力フラグ
let currentButton = null; // 現在押されているボタン

// 長押し制御用の変数を追加
let moveInterval = null;

// 間隔を250(0.25秒)に設定
const MOVE_SPEED_MS = 250;

// 移動処理
// dx, dyは1マス単位の移動量
function movePlayer(dx, dy) {
    // ゴール後は入力を無効化
    if (isClear) return;

    // 全員動けるか判定
    if (!canMove(dx, dy)) {
        //console.log("動けないです");
        return;
    }

    //移動前の状態を保存
    saveGameState();

    // 移動方向を更新
    if (dx === 0 && dy === -1) {
        player.direction = "up";
    }
    else if (dx === 0 && dy === 1) {
        player.direction = "down";
    }
    else if (dx === -1 && dy === 0) {
        player.direction = "left";
    }
    else if (dx === 1 && dy === 0) {
        player.direction = "right";
    }

    //チェックが通ったので実際に位置を更新
    for (let block of player.blocks) {
        block.x += dx;
        block.y += dy;
    }
    //SE再生
    let moveSound = new Audio("asset/se/ペタッ.mp3");
    moveSound.play().catch(error => {
        console.log("SE再生エラー:", error);
    });

    //ジャンプ移動アニメーション
    startJump();

    //回転ギミック判定
    judgeRotate();

    //ゴールマス判定
    if (checkGoal(player, goals)) {
        isClear = true;
    }
}

// キーボード入力（WASD）で移動
window.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    // Kキー(戻る処理導入後削除予定)
    if (e.key.toLowerCase() === "k") {
        undoGame();
        return;
    }

    if (!isInputed) {
        isInputed = true; // 入力フラグを立てる
        currentButton = e.key.toLowerCase();// 現在押されているボタンを記録
    }

    switch (e.key.toLowerCase()) {
        case "w":
            if (isInputed && currentButton === "w") {
                moveEventListener("up");
                if (!moveInterval) {
                    moveInterval = setInterval(() => {
                        moveEventListener("up");
                    }, MOVE_SPEED_MS);
                }
            }
            break;
        case "s":
            if (isInputed && currentButton === "s") {
                moveEventListener("down");
                if (!moveInterval) {
                    moveInterval = setInterval(() => {
                        moveEventListener("down");
                    }, MOVE_SPEED_MS);
                }
            }
            break;
        case "a":
            if (isInputed && currentButton === "a") {
                moveEventListener("left");
                if (!moveInterval) {
                    moveInterval = setInterval(() => {
                        moveEventListener("left");
                    }, MOVE_SPEED_MS);
                }
            }
            break;
        case "d":
            if (isInputed && currentButton === "d") {
                moveEventListener("right");
                if (!moveInterval) {
                    moveInterval = setInterval(() => {
                        moveEventListener("right");
                    }, MOVE_SPEED_MS);
                }
            }
            break;
    }
});

window.addEventListener("keyup", (e) => {
    if (e.key.toLowerCase() === currentButton) {
        isInputed = false;
        currentButton = null;
    }
    clearInterval(moveInterval);
    moveInterval = null;
});



// HTMLの onmousedown, ontouchstart から呼び出される処理（長押し開始）
function startMove(e, d) {
    if (e && e.cancelable) e.preventDefault(); // スマホのスクロールや長押しメニューを防ぐ
    if (moveInterval) return; // 既に連続移動中の場合は無視

    isInputed = true;
    currentButton = d;

    moveEventListener(d); // まず1回目の移動を即座に実行

    // 2回目以降の移動を指定した速度(MOVE_SPEED_MS)で連続実行
    moveInterval = setInterval(() => {
        moveEventListener(d);
    }, MOVE_SPEED_MS);
}

// ▼ HTMLの onmouseup, ontouchend から呼び出される処理（長押し終了）
function stopMove() {
    if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
    }
    isInputed = false;
    currentButton = null;
}

// 画面のどこで指やマウスを離しても確実に止まるように設定
window.addEventListener("mouseup", stopMove);
window.addEventListener("touchend", stopMove);

function moveEventListener(d) {
    switch (d) {
        case "up": movePlayer(0, -1); break;
        case "down": movePlayer(0, 1); break;
        case "left": movePlayer(-1, 0); break;
        case "right": movePlayer(1, 0); break;
    }
}