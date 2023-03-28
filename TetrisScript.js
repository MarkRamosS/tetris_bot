const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

function arenaSweep() {
    let rowCount = 0;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        rowCount += 1;
    }
    
    player.rows += rowCount
    if ((player.rows / 10) >= (player.level + 1)){
        player.level += 1
    }
    if(rowCount == 1){
        player.score += 40 * (player.level + 1);
    }
    if(rowCount == 2){
        player.score += 40 * (player.level + 1) * 2.5;
    }
    if(rowCount == 3){
        player.score += 40 * (player.level + 1) * 7.5;
    }
    if(rowCount == 4){
        player.score += 40 * (player.level + 1) * 30;
    }
    if (player.level == 19){
        dropInterval = 30
    }

}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
        player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}
function playersoftDrop() {
    while(!collide(arena, player)){
        player.pos.y++;
    }
    if (collide(arena, player)) {
        player.pos.y--;
        player.score += 1
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }   
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    const numbers = '4441222'
    let randome = Math.random()

    if(player.nextmatrix == null){
        player.nextPieceName = pieces[pieces.length * randome | 0]
        player.nextmatrix = createPiece(player.nextPieceName);
        player.nextRotNumber = numbers[pieces.length * randome | 0]
        randome = Math.random()
    }
    player.PieceName = player.nextPieceName
    player.matrix = player.nextmatrix
    player.RotNumber = player.nextRotNumber
    player.nextPieceName = pieces[pieces.length * randome | 0]
    player.nextmatrix = createPiece(player.nextPieceName);
    player.nextRotNumber = numbers[pieces.length * randome | 0]
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    player.pos.x = ai(arena, 0.51006, 0.760666, 0.35663, 0.184483);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        player.rows = 0;
        player.level = 19;
        updateScore();
    }
}

function playerRotate(dir, player) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;


let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText ='score: '+player.score+' lines: '+player.rows+' level: '+ player.level;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playersoftDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1, player);
    } else if (event.keyCode === 87) {
        playerRotate(1, player);
    }
});
function abs(x){
    if (x < 0){
        x *= -1;
        return x;
    }
    return x;
}
function evaluate(a, b, c, d){
    let rowCount = 0;
    let position = createMatrix(12, 20)
    for (let y = nextaiplayer.arena.length-1 ; y > 0; --y) {
        for (let x = 0; x < nextaiplayer.arena[y].length; ++x) {
            position[y][x]  = nextaiplayer.arena[y][x]
        }
    }
    outer: for (let y = position.length -1; y > 0; --y) {
        for (let x = 0; x < position[y].length; ++x) {
            if (position[y][x] == 0) {
                continue outer;
            }
        }
        const row1 = position.splice(y, 1)[0].fill(0);
        position.unshift(row1);
        ++y;

        rowCount += 1;
    }

    let Bumpiness = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let HoleCount = 0
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 12; x++) {
            if(position[y][x] == 0 && Bumpiness[x] != 0){
                HoleCount++;
            }
            if (position[y][x] != 0 && Bumpiness[x] == 0) {
                Bumpiness[x] = 20 - y;
            }
        }
    }
    let TotalHeight = Bumpiness[0]
    let BumpinessCount = 0;
    for(let i = 0; i < 12; i++){
        BumpinessCount += abs(Bumpiness[i] - Bumpiness[i + 1]);
        TotalHeight += Bumpiness[i + 1];
    }
    if (rowCount == 4){
        rowCount = 16
    }
    BumpinessCount -= Bumpiness[11]
    let score = (-a * (TotalHeight) + b * rowCount - c * HoleCount - d * BumpinessCount);
    return  score;
}
function ai(arena,  a, b, c, d){
    let minCost = -Infinity
    let minX = 0
    let cost = 0
    aiplayer.arena = createMatrix(12, 20);
    for (let y = arena.length -1 ; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            aiplayer.arena[y][x]  = arena[y][x]
        }
    }
    aiplayer.matrix = createPiece(player.PieceName)
    aiplayer.pos.x = player.pos.x
    aiplayer.pos.y = 2
    for(let i = 0; i < player.RotNumber ; i++){
        while(!collide(aiplayer.arena, aiplayer)){
            aiplayer.pos.x--;
        }
        aiplayer.pos.x++;
        while (!collide(aiplayer.arena, aiplayer)) {
            while(!collide(aiplayer.arena, aiplayer)){
                    aiplayer.pos.y++;
            }
            if(collide(aiplayer.arena, aiplayer)){
                aiplayer.pos.y--;
            }
            aiplayer.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value != 0) {
                        aiplayer.arena[y + aiplayer.pos.y][x + aiplayer.pos.x] = value;
                    }
                });
            });
            
            cost = nextai(a,b,c,d);
            if(cost > minCost){
                minCost = cost
                minX = aiplayer.pos.x
                player.rotatCount = i
            }
            aiplayer.pos.x++;
            for (let y = arena.length -1; y > 0; --y) {
                for (let x = 0; x < arena[y].length; ++x) {
                    aiplayer.arena[y][x]  = arena[y][x]
                }
            }
            aiplayer.pos.y = 0
        } 
        aiplayer.pos.x -= 2;
        playerRotate(1, aiplayer)
    }
    for(let i = 0; i < player.rotatCount; i++){
        playerRotate(1, player)
    }
    return minX
}
function nextai(a, b, c, d){
    let minCost = -Infinity
    let cost = 0
    nextaiplayer.arena = createMatrix(12, 20);
    for (let y = aiplayer.arena.length -1 ; y > 0; --y) {
        for (let x = 0; x < aiplayer.arena[y].length; ++x) {
            nextaiplayer.arena[y][x]  = aiplayer.arena[y][x]
        }
    }
    nextaiplayer.matrix = createPiece(player.nextPieceName)
    nextaiplayer.pos.x = 5
    nextaiplayer.pos.y = 2
    for(let i = 0; i < player.nextRotNumber ; i++){
        while(!collide(nextaiplayer.arena, nextaiplayer)){
            nextaiplayer.pos.x--;
        }
        nextaiplayer.pos.x++;
        while (!collide(nextaiplayer.arena, nextaiplayer)) {
            while(!collide(nextaiplayer.arena, nextaiplayer)){
                    nextaiplayer.pos.y++;
            }
            if(collide(nextaiplayer.arena, nextaiplayer)){
                nextaiplayer.pos.y--;
            }
            nextaiplayer.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value != 0) {
                        nextaiplayer.arena[y + nextaiplayer.pos.y][x + nextaiplayer.pos.x] = value;
                    }
                });
            });
            
            cost = evaluate(a, b, c, d);
            if(cost > minCost){
                minCost = cost
            }
            nextaiplayer.pos.x++;
            for (let y = aiplayer.arena.length -1 ; y > 0; --y) {
                for (let x = 0; x < aiplayer.arena[y].length; ++x) {
                    nextaiplayer.arena[y][x]  = aiplayer.arena[y][x]
                }
            }
            nextaiplayer.pos.y = 0
        }
        nextaiplayer.pos.x -= 2;
        playerRotate(1, nextaiplayer)
    }
    return minCost
}

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    nextPieceName : '',
    nextmatrix : null,
    PieceName : '',
    matrix: null,
    score: 0,
    level: 19,
    rows : 0,
    RotNumber : 1,
    nextRotNumber: 1,
    rotatCount : 0
};
const aiplayer = {
    pos: {x: 0, y: 0},
    arena : null,
    matrix: null,
    score: 0,
    level: 19,
    rows : 0
};
const nextaiplayer = {
    pos: {x: 0, y: 0},
    arena : null,
    matrix: null,
    score: 0,
    level: 19,
    rows : 0
};

playerReset();
updateScore();
update();

