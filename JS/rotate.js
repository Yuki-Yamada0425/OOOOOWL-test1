// 回転床
// 4 : 時計回り90°
// 5 : 反時計回り90°
// 6 : 180°

const rotationAngles = {
    4: 90,
    5: -90,
    6: -180
};

// 回転床の使用回数
let countRemaining = {};

//回転成功SE
const rotateSuccessSE = new Audio("asset/se/8bitジャンプ.mp3");

// 回転失敗時SE

const rotateFailureSE = new Audio("asset/se/しょげる.mp3");




// =============================
// coreと連結ブロックを取得
// =============================
function setConnectedBlocks()
{
    const core = player.blocks.find(block => block.type === "core");
    if (!core)
    {
        return {
            core: null,
            blocks: []
        };
    }

    const connected = new Set([core]);
    const queue = [core];
    while (queue.length > 0)
    {
        const current = queue.shift();
        for (const block of player.blocks)
        {
            if (connected.has(block))
            {
                continue;
            }
            const distance = Math.abs(current.x - block.x) + Math.abs(current.y - block.y);
            if (distance === 1)
            {
                connected.add(block);
                queue.push(block);
            }
        }
    }
    return {
        core: core,
        blocks: [...connected]
    };
}

// =============================
// 回転後の座標を取得
// =============================
function getRotatedPosition(block, core, angle)
{
    const dx = block.x - core.x;
    const dy = block.y - core.y;
    if (angle === 90)
    {
        return {
            x: core.x - dy,
            y: core.y + dx
        };
    }
    if (angle === -90)
    {
        return {
            x: core.x + dy,
            y: core.y - dx
        };
    }
    // 180°
    return {
        x: core.x - dx,
        y: core.y - dy
    };
}

// =============================
// 回転途中の経路を取得
// =============================
function getRotationPath(block, core, angle)
{
    const path = [];

    // core 自身は移動しない
    if (block.x === core.x && block.y === core.y)
    {
        return path;
    }

    const position = {
        x: block.x,
        y: block.y
    };

    // 180°は、これまでと同じく反時計回り90°を2回として扱う
    const rotateCount = angle === -180 ? 2 : 1;
    const rotateAngle = angle === 90 ? 90 : -90;

    for (let turn = 0; turn < rotateCount; turn++)
    {
        const dx = position.x - core.x;
        const dy = position.y - core.y;

        // プレイヤー基準で、そのブロックが属する正方形リングの半径。
        // 例: (2, 0), (2, -1), (1, -2) はすべて radius = 2。
        const radius = Math.max(Math.abs(dx), Math.abs(dy));

        // 90°回転ではリング外周の1/4 = 2 * radius マス進む。
        const stepCount = radius * 2;

        for (let step = 0; step < stepCount; step++)
        {
            const relX = position.x - core.x;
            const relY = position.y - core.y;

            if (rotateAngle === -90)
            {
                // 反時計回り
                // 右辺 -> 上辺 -> 左辺 -> 下辺 の順で外周を進む。
                if (relX === radius && relY > -radius)
                {
                    position.y--;
                }
                else if (relY === -radius && relX > -radius)
                {
                    position.x--;
                }
                else if (relX === -radius && relY < radius)
                {
                    position.y++;
                }
                else
                {
                    // 下辺
                    position.x++;
                }
            }
            else
            {
                // 時計回り
                // 右辺 -> 下辺 -> 左辺 -> 上辺 の順で外周を進む。
                if (relX === radius && relY < radius)
                {
                    position.y++;
                }
                else if (relY === radius && relX > -radius)
                {
                    position.x--;
                }
                else if (relX === -radius && relY > -radius)
                {
                    position.y--;
                }
                else
                {
                    // 上辺
                    position.x++;
                }
            }

            path.push({
                x: position.x,
                y: position.y
            });
        }
    }

    return path;
}

// =============================
// 回転可能判定 ＋ 回転実行
// =============================
function rotateBlocks(angle)
{
    const data = setConnectedBlocks();
    const core = data.core;
    const blocks = data.blocks;
    if (!core || blocks.length === 0)
    {
        return false;
    }

    const rotatingSet = new Set(blocks);

    const targetKeys = new Set();
    const targets = [];
    for (const block of blocks)
    {
        // -------------------------
        // 回転途中を確認
        // -------------------------
        const path = getRotationPath(block, core, angle);
        for (const point of path)
        {
            // マップ外
            if (
                point.y < 0 ||
                point.y >= mapData.length ||
                point.x < 0 ||
                point.x >= mapData[point.y].length
            )
            {
                return false;
            }
            const tile = mapData[point.y][point.x];
            // 壁・未合体ブロック・解除ブロック
            if (tile === 1 || tile === 2 || tile === 8)
            {
                return false;
            }
            // 回転しないプレイヤーブロック
            const hitPlayer =
                player.blocks.some(other =>
                    !rotatingSet.has(other) &&
                    other.x === point.x &&
                    other.y === point.y
                );

            if (hitPlayer)
            {
                return false;
            }
        }

        // -------------------------
        // 回転後の位置を確認
        // -------------------------
        const target =
            getRotatedPosition(
                block,
                core,
                angle
            );
        if ( target.y < 0 || target.y >= mapData.length || target.x < 0 || target.x >= mapData[target.y].length)
        {
            return false;
        }
        const tile = mapData[target.y][target.x];
        if (tile === 1 || tile === 2 || tile === 8)
        {
            return false;
        }

        // 同じ場所への重なり防止
        const key = `${target.x},${target.y}`;
        if (targetKeys.has(key))
        {
            return false;
        }
        targetKeys.add(key);
        targets.push({
            block: block,
            target: target
        });
    }
    // =============================
    // 回転実行
    // =============================
    for (const item of targets)
    {
        item.block.x = item.target.x;
        item.block.y = item.target.y;
    }
    // ゴール判定
    if (checkGoal(player, goals))
    {
        isClear = true;
    }
    return true;
}
// =============================
// 回転床判定
// =============================
function judgeRotate()
{
    const core =
        player.blocks.find(
            block => block.type === "core"
        );
    if (!core)
    {
        return;
    }
    const tile = mapData[core.y][core.x];
    const angle = rotationAngles[tile];

    // 4・5・6以外なら終了
    if (angle === undefined)
    {
        return;
    }
    const key = `${core.x},${core.y}`;
    // 初回
    if (countRemaining[key] === undefined)
    {
        countRemaining[key] = 0;
    }
    // 4・5は1回、6は2回
    const limit =
        tile === 6 ? 2 : 1;
    // 使用済み
    if (countRemaining[key] >= limit)
    {
        return;
    }
    // 回転
    if (rotateBlocks(angle))
    {
        //回転成功SE再生
        rotateSuccessSE.play();

        countRemaining[key]++;
        // 回数を使い切ったら普通の床へ
        if (countRemaining[key] >= limit)
        {
            mapData[core.y][core.x] = 0;
        }
    }
    else
    {
        // 回転失敗SE再生
        rotateFailureSE.play();
    }
}
