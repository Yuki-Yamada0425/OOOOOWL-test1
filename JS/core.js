//プレイヤー
let player = {blocks: [],direction: "down"};

//変更用マップデータ
let mapData = [];

//保存用データ
let gameHistory = [];

//マスの画像の事前読み込み
const tileImages = {};
for (const key in tileImagePaths)
{
  const img = new Image();
  img.src = tileImagePaths[key];
  tileImages[key] = img;
}

//現在のレベル 
let currentLevel = "tutorial";

//現在のレベルを取得 
function getLevel() { return currentLevel; } 

//レベルを変更 
function setLevel(level) { currentLevel = level; localStorage.setItem("level", level); } 

//レベルを次へ進める 
function nextLevel() 
{
  switch (currentLevel) 
  { 
    case "tutorial":
      setLevel("easy"); 
      break; 
    case "easy": 
      setLevel("normal");
      break; 
    case "normal": 
      setLevel("hard"); 
      break; 
    case "hard": 
      setLevel("ex"); 
      break; 
    case "ex": 
      // 全クリア 
      return false; 
  } 
  return true; 
} 

//保存されているレベルを読み込む 
function loadLevel() 
{ 
  const savedLevel = localStorage.getItem("level");

  if (savedLevel === "tutorial" || 
      savedLevel === "easy" || 
      savedLevel === "normal" || 
      savedLevel === "hard" || 
      savedLevel === "ex" ) 
  { 
    currentLevel = savedLevel; 
  } 
  else 
  { 
    currentLevel = "tutorial"; 
  } 
}

//マップ取得
function getLevelMap(level) 
{ 
  switch (level) 
  { 
    case "easy":
      return mapEasy; 
    case "normal":
      return mapNormal;
    case "hard": 
      return mapHard; 
    case "ex": 
      return mapExtra; 
    case "tutorial": 
      default: 
    return mapTutorial; 
  } 
}

//ゲーム開始時の初期化関数
function initGame()
{
  //現在のレベルを読み込む 
  loadLevel(); 
  
  //現在のレベルのマップをコピー 
  mapData = structuredClone(getLevelMap(currentLevel)); 
  
  //プレイヤーを初期化 
  //player = { blocks: [] }; 
  player = {blocks: [],direction: "down"};
  
  //ゴールを初期化 
  goals = []; 

  //戻る処理の履歴を初期化
  gameHistory = [];
  
  //回転回数を初期化 
  countRemaining = {}; 

  //クリア状態を初期化 
  isClear = false; 
  goalSEPlayed = false;

  //アニメーション初期化
  isGoalAnimation = false;  //ゴール演出フラグ
  isJumping = false;        //ジャンプフラグ
  jumpHeight = 0;           //ジャンプ進行状況
  jumpDuration = 10;        //ジャンプ時間

  //プレイヤーの初期位置を取得 
  initPlayer(); 
  
  //回転ギミック 
  setExpansion(mapData); 
  
  //ゴール情報を取得 
  setGoal(mapData);
}

//プレイヤーの初期位置を取得
function initPlayer()
{
  for (let y = 0; y < mapData.length; y++)
  {
    for (let x = 0; x < mapData[y].length; x++)
    {
      if (mapData[y][x] === 9)
      {
        //プレイヤーの初期位置を設定
        player = {blocks: [{ x: x, y: y, type: "core" }],direction: "down"};

        //開始位置を床に戻す
        mapData[y][x] = 0;

        return;
      }
    }
  }
}

//当たり判定
function canMove(dx, dy) 
{
    //現在のプレイヤーブロックのデータ
    const NOW_PLAYER_SHAPE = player.blocks.map(block => ({
        x: block.x + dx,
        y: block.y + dy
    }));

  //全ブロック移動できるか調べる
  return NOW_PLAYER_SHAPE.every(block => { 

    //マップ外なら移動できない 
    if (!mapData[block.y] || mapData[block.y][block.x] === undefined) { return false; } 

    //「1」は壁なので移動できない 
    if (mapData[block.y][block.x] === 1) { return false; } 

    //「8」は拡張マスなので移動できない
    if (mapData[block.y][block.x] === 8) { return false; } 

    //その他は移動可能 
    return true; }); 
}

//合体処理
function checkMerge() 
{
  //1.現在地の上下左右のマスを準備する
  const DIRECTIONS = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

    //2.合体しているブロック分繰り返す
    player.blocks.forEach(block => {

    //3.上下左右のマスを調べる
    DIRECTIONS.forEach(dir => {
      const checkX = block.x + dir.x;
      const checkY = block.y + dir.y;

      //4.map外だったら処理を中断
      if (!mapData[checkY]) return;

      //5.隣にブロックがあるか調べる
      if (mapData[checkY][checkX] === 2) {

        const newBlock = {x: checkX,y: checkY,type: "merged"};

        //6.重複防止
        const exists = player.blocks.some(
          b => b.x === newBlock.x && b.y === newBlock.y
        );

        //7.プレイヤーへブロックを追加（合体）する
        if (!exists) 
        {
          player.blocks.push(newBlock);
        }

        //8.マップから野良ブロックを削除（プレイヤーブロックの一部になり表示される）
        mapData[checkY][checkX] = 0;

        //合体SE再生
        play("asset/se/8bitかわす.mp3");
      }
    });
  });
}

// 現在のゲーム状態を保存
function saveGameState()
{
    gameHistory.push({
        player: structuredClone(player),
        mapData: structuredClone(mapData),
        countRemaining: structuredClone(countRemaining),
        expansions: structuredClone(expansions),
        isClear: isClear
    });
}

//一つ前の状態に戻す
function undoGame()
{
  //履歴がなければ何もしない
  if (gameHistory.length === 0)
  {
    return;
  }

  //一つ前の状態を取得
  const previousState = gameHistory.pop();

  //状態を復元
  player = previousState.player;
  mapData = previousState.mapData;
  countRemaining = previousState.countRemaining;
  expansions = previousState.expansions;
  isClear = previousState.isClear;

  //一つ戻るSE再生
  play("asset/se/ぷよん.mp3");
}

//SE再生処理
function play(path) 
{
  const se = new Audio(path);
  se.play();
}

//プレイヤーの方向別・アニメーション画像
const playerImages = {
  up: [new Image(), new Image()],
  down: [new Image(), new Image()],
  left: [new Image(), new Image()],
  right: [new Image(), new Image()]
};

//プレイヤー画像読み込み
playerImages.up[0].src = "asset/ui/Main_U.png";
playerImages.up[1].src = "asset/ui/Main_U2.png";

playerImages.down[0].src = "asset/ui/Main_D.png";
playerImages.down[1].src = "asset/ui/Main_D2.png";

playerImages.left[0].src = "asset/ui/Main_L.png";
playerImages.left[1].src = "asset/ui/Main_L2.png";

playerImages.right[0].src = "asset/ui/Main_R.png";
playerImages.right[1].src = "asset/ui/Main_R2.png";


//合体ブロックの方向別・アニメーション画像
const mergedImages = {
  up: [new Image(), new Image()],
  down: [new Image(), new Image()],
  left: [new Image(), new Image()],
  right: [new Image(), new Image()]
};

//合体ブロック画像読み込み
mergedImages.up[0].src = "asset/ui/Sub_U.png";
mergedImages.up[1].src = "asset/ui/Sub_U2.png";

mergedImages.down[0].src = "asset/ui/Sub_D.png";
mergedImages.down[1].src = "asset/ui/Sub_D2.png";

mergedImages.left[0].src = "asset/ui/Sub_L.png";
mergedImages.left[1].src = "asset/ui/Sub_L2.png";

mergedImages.right[0].src = "asset/ui/Sub_R.png";
mergedImages.right[1].src = "asset/ui/Sub_R2.png";

//アニメーション管理
let animationFrame = 0;
let animationCounter = 0;

// ジャンプアニメーション
let jumpHeight = 0;
let isJumping = false;

// ゴール演出中かどうか
let isGoalAnimation = false;
let jumpDuration = 10;

//描画処理
function draw() 
{
  if (mapData.length === 0) return;

  // 1マスサイズ
  const tileSize = Math.min(
      canvas.width / mapData[0].length,
      canvas.height / mapData.length
  );

  // 中央配置
  const offsetX =(canvas.width - mapData[0].length * tileSize) / 2;
  const offsetY =(canvas.height - mapData.length * tileSize) / 2;

  // 描画クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // マップ描画
  for (let y = 0; y < mapData.length; y++) 
  {
    for (let x = 0; x < mapData[y].length; x++) 
    {
      const tileType = mapData[y][x];

      const tileImg = tileImages[tileType];

      // 画像の読み込みが完了していれば描画する
      if (tileImg && tileImg.complete && tileImg.naturalWidth > 0)
      {
        ctx.drawImage(
            tileImg,
            offsetX + x * tileSize,
            offsetY + y * tileSize,
            tileSize,
            tileSize
        );
      }

      ctx.strokeStyle = "white";

      ctx.strokeRect(
          offsetX + x * tileSize,
          offsetY + y * tileSize,
          tileSize,
          tileSize
      );
    }
  }

  //プレイヤー・合体ブロック描画
  player.blocks.forEach(block =>
  {
    const drawX = offsetX + block.x * tileSize;
    const drawY = offsetY + block.y * tileSize;

    let images;

    // ブロックの種類によって画像を変更
    if (block.type === "core")
    {
      images = playerImages[player.direction];
    }
    else if (block.type === "merged")
    {
      images = mergedImages[player.direction];
    }

    //現在のアニメーション画像を取得
    const image = images[animationFrame];

    const jumpOffset = isJumping
    ? Math.sin((jumpHeight / jumpDuration) * Math.PI) * tileSize * 0.3
    : 0;

    //画像が読み込まれていれば描画
    if (image && image.complete && image.naturalWidth > 0)
    {
      ctx.drawImage(
        image,
        drawX,
        drawY - jumpOffset,
        tileSize,
        tileSize
      );
    }
  });
}

//アニメーション更新
function updateAnimation()
{
  animationCounter++;

  //10フレームごとに画像を切り替える
  if (animationCounter >= 10)
  {
    animationFrame = (animationFrame + 1) % 2;
    animationCounter = 0;
  }
}

//ジャンプ開始
function startJump()
{
  if (!isJumping)
  {
    isJumping = true;
    jumpHeight = 0;
  }
}

//ジャンプ更新
function updateJump()
{
  if (isJumping)
  {
    jumpHeight++;

    if (jumpHeight >= jumpDuration)
    {
      jumpHeight = 0;

      if (!isGoalAnimation)
      {
        isJumping = false;
      }
    }
  }
}
