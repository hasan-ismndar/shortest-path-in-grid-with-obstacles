

const infinityDistance = 1000;
const numRows = 12;
const numColumns = 35;
const grid = new Array(numRows).fill(0).map(() => new Array(numColumns).fill(1));
const visited = new Array(numRows).fill(0).map(() => new Array(numColumns).fill(0));
const parentNode = new Array(numRows).fill(0).map(() => new Array(numColumns).fill({ x: -1, y: -1 }));
const distance = new Array(numRows).fill(0).map(() => new Array(numColumns).fill(infinityDistance));
const dx = [1, - 1, 0, 0];
const dy = [0, 0, 1, - 1];
let errorMessage = '';

const app = document.getElementById('app');
const gridElement = document.getElementById('grid')
const errorElement = document.getElementById('error');

const isValidTransition = (x, y) => {
    if (x >= numRows || y >= numColumns || x < 0 || y < 0)
        return false;
    if (visited[x][y] || !grid[x][y])
        return false;
    return true;
}

const bfs = (x, y) => {
    const queue = [];
    queue.push({ x, y });
    distance[x][y] = 0;
    visited[x][y] = 1;
    while (queue.length > 0) {
        const current = queue.shift()
        for (let i = 0; i < 4; i++) {
            const newX = current.x + dx[i];
            const newY = current.y + dy[i];
            if (isValidTransition(newX, newY)) {
                visited[newX][newY] = 1;
                queue.push({ x: newX, y: newY });
                parentNode[newX][newY] = { x: current.x, y: current.y };
                distance[newX][newY] = distance[current.x][current.y] + 1;

            }
        }

    }
};

const shortestPath = (x, y) => {
    if (distance[x][y] === infinityDistance) {
        return [];
    }
    const result = [];
    let current = { x, y };
    while (parentNode[current.x][current.y].x !== -1 && parentNode[current.x][current.y].y !== -1) {
        result.push({ x: current.x, y: current.y });
        current = { x: parentNode[current.x][current.y].x, y: parentNode[current.x][current.y].y }
    }
    result.push({ x: current.x, y: current.y });
    result.reverse();
    return result;
};



let state = { source: { x: -1, y: -1 }, target: { x: -1, y: -1 } };
let started = false;
const sourceTargetSelection = (event) => {
    errorMessage = '';
    if (started) {
        return;
    }
    const r = parseInt(event.target.attributes.row.value);
    const c = parseInt(event.target.attributes.column.value);
    if (!grid[r][c]) {
        return;
    }
    if (state.source.x === -1) {
        state.source = { x: r, y: c };
    }
    else {
        if (state.source.x === r && state.source.y === c) {
            state.source = { x: -1, y: -1 };
        }
        else if (state.target.x === r && state.target.y === c) {
            state.target = { x: -1, y: -1 };
        }
        else {
            state.target = { x: r, y: c };
        }
    }
    render();
}

const obstaclesSelection = (event) => {
    errorMessage = '';
    event.preventDefault();
    if (started) {
        return;
    }
    const r = parseInt(event.target.attributes.row.value);
    const c = parseInt(event.target.attributes.column.value);
    if (state.source.x === r && state.source.y == c) {
        state.source = { x: -1, y: -1 };
    }
    if (state.target.x === r && state.target.y == c) {
        state.target = { x: -1, y: -1 };
    }
    if (grid[r][c]) {
        grid[r][c] = 0;
    }
    else {
        grid[r][c] = 1;
    }
    render();
}

const render = () => {
    gridElement.innerHTML = '';
    errorElement.innerHTML = errorMessage;
    grid.map((row, rowIndex) => {
        const rowElement = document.createElement('div');
        rowElement.id = `row${rowIndex}`;
        row.map((column, columnIndex) => {
            const element = document.createElement('div');
            element.id = `column${columnIndex}`
            if (!grid[rowIndex][columnIndex]) {
                element.style.backgroundColor = '#616161';
            }

            element.setAttribute('row', rowIndex)
            element.setAttribute('column', columnIndex)
            if (rowIndex == state.source.x && columnIndex == state.source.y) {
                element.innerHTML = `<span row=${rowIndex}, column=${columnIndex}>S</span>`;
                element.style.textAlign = 'center';
            }
            if (rowIndex == state.target.x && columnIndex == state.target.y) {
                element.innerHTML = `<span row = ${rowIndex}, column = ${columnIndex}> T</span>`;
                element.style.textAlign = 'center';
            }
            rowElement.appendChild(element)
            element.addEventListener('click', sourceTargetSelection);
            element.addEventListener('contextmenu', obstaclesSelection);

        });
        gridElement.appendChild(rowElement);
    });

}
const reset = () => {
    state = { source: { x: -1, y: -1 }, target: { x: -1, y: -1 } }
    started = false;
    errorMessage = '';
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numColumns; j++) {
            visited[i][j] = 0;
            parentNode[i][j] = { x: -1, y: -1 };
            distance[i][j] = infinityDistance;
        }
    }
    render();
}

const runButton = document.getElementById('run');
const resetButton = document.getElementById('reset');
runButton.addEventListener('click', () => {
    if (state.source.x === -1) {
        errorMessage = 'Please select a source cell';
        render();
        return;
    }
    if (state.target.x === -1) {
        errorMessage = 'Please select a target cell';
        render();
        return;
    }
    started = true;
    bfs(state.source.x, state.source.y)
    const result = shortestPath(state.target.x, state.target.y);
    if (result.length === 0) {
        errorMessage = 'You can\'t reach from the source to the target';
        render();
        return;
    }
    result.forEach((value, index) => {
        /**
         * @type HTMLElement
         */
        const target = document.querySelector(`#row${value.x} #column${value.y} `);
        setTimeout(() => {
            target.style.backgroundColor = '#ff4f28';

        }, 200 * (index + 1));
    });
});

resetButton.addEventListener('click', () => {
    reset();
});

reset();
