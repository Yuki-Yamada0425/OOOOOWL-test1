//HTMLのcanvas要素と2D描画コンテキストを取得
const canvas = document.getElementById("canvas"); //変更有
const ctx = canvas.getContext("2d");

// キャンバスサイズをグリッドに合わせる
function resizeCanvas() 
{
  // グリッドが収まるサイズに調整
  canvas.width = COLS * TILE_SIZE;
  canvas.height = ROWS * TILE_SIZE;
}

//シーン変更用に臨時で追加（7/31）
const scenes = document.querySelectorAll(".scene");
function changeScene(sceneId) 
{
    scenes.forEach(scene => scene.classList.remove("active"));
    document.getElementById(sceneId).classList.add("active");
}