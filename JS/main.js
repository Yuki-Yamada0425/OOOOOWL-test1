//ゲームループ
function gameLoop() 
{
  //アニメーション管理
  updateAnimation();

  //移動アニメーション
  updateJump();
  
  //描画処理
  draw();

  //合体処理
  checkMerge();

  //拡張ギミック
  judgeExpansion(player, expansions, mapData);

  //クリア判定
  if (isClear)
  {
    //1.5秒後にクリア画面へ遷移
    setTimeout(() => {gameClear();}, 1500);

    //クリア処理済みにする
    isClear = false;
  }

  // 次のフレームを予約
  requestAnimationFrame(gameLoop);
}
gameLoop();
