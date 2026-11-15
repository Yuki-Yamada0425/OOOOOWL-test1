let isClear = false;
let goals = [];
let goalSEPlayed = false;

//ゴール情報を取得する
function setGoal(mapData)
{
  goals = [];

  for (let y = 0; y < mapData.length; y++)
  {
    for (let x = 0; x < mapData[y].length; x++)
    {
      if (mapData[y][x] === 3)
      {
        goals.push({ x, y });
      }
    }
  }
}

//ゴール判定
function checkGoal(player, goals)
{
  if (player.blocks.length !== goals.length)
  {
    return false;
  }

  const result = player.blocks.every(block =>
    goals.some(goal =>
      goal.x === block.x &&
      goal.y === block.y
    )
  );

  if (result && !goalSEPlayed)
  {
    //ゴールSE再生
    play("asset/se/8bit勝利1.mp3");
    goalSEPlayed = true;

    //ゴール演出開始
    goalAnimation();
  }

  return result;
}

//ゴール時のアニメーション
function goalAnimation()
{
  if (isGoalAnimation) return;  
  isGoalAnimation = true; 

  //正面を向く
  player.direction = "down";  

  //ゴール時だけゆっくりジャンプ
  jumpDuration = 25;  

  startJump();
}