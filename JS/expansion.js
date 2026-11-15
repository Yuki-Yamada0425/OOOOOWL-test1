// 拡張ギミックのマス情報
let expansions = [];

// 拡張成功時SE
const expansionSuccessSE = new Audio("asset/se/8bit回復6.mp3");

// 拡張ギミック情報を取得する
function setExpansion(mapData)
{
    expansions = [];
    for (let y = 0; y < mapData.length; y++)
    {
        for (let x = 0; x < mapData[y].length; x++)
        {
            // 7 = 解除スイッチ
            if (mapData[y][x] === 7)
            {
                expansions.push({ x, y });
            }
        }
    }
}
// 拡張ギミック判定
function judgeExpansion(player, expansions, mapData)
{
    // 7マスが存在しない場合
    if (expansions.length === 0)
    {
        return;
    }

    // 7マスの数とブロック数が一致しない場合は判定しない
    if (player.blocks.length !== expansions.length)
    {
        return;
    }

    // すべての7マスにブロックが乗っているか
    const isExpansion = expansions.every(expansion =>
        player.blocks.some(block =>
            block.x === expansion.x &&
            block.y === expansion.y
        )
    );
    // 条件を満たしていなければ終了
    if (!isExpansion)
    {
        return;
    }
    // 通常マスに戻す
    for (let y = 0; y < mapData.length; y++)
    {
        for (let x = 0; x < mapData[y].length; x++)
        {
            if (mapData[y][x] === 7)
            {
                mapData[y][x] = 0;
            }

            if (mapData[y][x] === 8)
            {
                mapData[y][x] = 0;
            }
        }
    }

    //拡張成功時配列を空にする(SEループ防止)
    expansions.length = 0;

    //拡張成功SE再生
    expansionSuccessSE.play();
}