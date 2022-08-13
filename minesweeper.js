function solveMine(input, n){
    let map = input.split("\n").map(line => line.split(" "));
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 0], [0, 1],
        [1, -1], [1, 0], [1, 1],
    ];

    let rows = map.length;
    let columns = map[0].length;

    function digAround(y, x) {
        for (let direction of directions) {
            const yPrime = y + direction[0];
            const xPrime = x + direction[1];
            const row = map[yPrime];
            if (row !== undefined && "?s".includes(row[xPrime])) {
                map[yPrime][xPrime] = open(yPrime, xPrime);
            }
        }
    }
    function flagAround(y, x) {
        for (let direction of directions) {
            const yPrime = y + direction[0];
            const xPrime = x + direction[1];
            const row = map[yPrime];
            if (row !== undefined && map[yPrime][xPrime] === "?") {
                n--;
                map[yPrime][xPrime] = "x";
            }
        }
    }
    function scan(tileValue, callback) {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                if (map[y][x] == tileValue) {
                    callback(y, x);
                }
            }
        }
    }
    function basicScan(mineValue) {
        scan(mineValue, (y, x) => {
            let safeAround = 0;
            let tileExist = 0;
            for (let direction of directions) {
                const yPrime = y + direction[0];
                const xPrime = x + direction[1];
                const row = map[yPrime];
                if (row === undefined) continue;
                const tile = row[xPrime];
                if (tile === undefined) continue;
                tileExist++;
                if (!Number.isNaN(+tile) || tile === "s") {
                    safeAround++;
                }
            }
            if (safeAround === tileExist - mineValue) {
                flagAround(y, x);
            }
        });
    }
    function basicScan2(mineValue) {
        scan(mineValue, (y, x) => {
            let mineAround = 0;
            for (let direction of directions) {
                const yPrime = y + direction[0];
                const xPrime = x + direction[1];
                const row = map[yPrime];
                if (row === undefined) continue;
                const tile = row[xPrime];
                if (tile === "x") mineAround++;
            }
            if (mineAround === mineValue) {
                digAround(y, x);
            }
        });
    }
    function basicMapScan() {
        for (let i = 0; i < 9; i++) {
            basicScan(i);
        }
    }
    function basicMapScan2() {
        for (let i = 0; i < 9; i++) {
            basicScan2(i);
        }
    }

    function advancedScan(map, n) {
        const clonedMap = JSON.parse(JSON.stringify(map));

        function checkInside(y, x) {
            return 0 <= y && y < rows && 0 <= x && x < columns;
        }

        function scanCloned(tileValue, callback) {
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < columns; x++) {
                    if (clonedMap[y][x] == tileValue) {
                        callback(y, x);
                    }
                }
            }
        }
        function getTileValue(y, x) {
            let row = clonedMap[y];
            if (!row) return undefined;
            else return row[x];
        }
        function strikeFromPosition([yStart, xStart], [deltaY, deltaX]) {
            let result = [];
            for (let y = yStart, x = xStart; checkInside(y, x); y += deltaY, x += deltaX) {
                result.push(clonedMap[y][x]);
            }
            return result.join("");
        }

        // Apply reduction to simplify the puzzle.
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                const tile = clonedMap[y][x];
                if (!Number.isNaN(+tile)) {
                    let mineAround = 0;
                    for (let direction of directions) {
                        const yPrime = y + direction[0];
                        const xPrime = x + direction[1];
                        const row = map[yPrime];
                        if (row === undefined) continue;
                        const tile = row[xPrime];
                        if (tile === "x") mineAround++;
                    }
                    clonedMap[y][x] = tile - mineAround + "";
                }
            }
        }
        // Remove existing mines to simplify the puzzle.
        scanCloned("x", (y, x) => clonedMap[y][x] = "0");
        // Let's go!

        // Row patterns.
        const lineDirs = [
            [[0, 0], [1, 0], [0, 1]],
            [[0, columns - 1], [1, 0], [0, -1]],
            [[0, 0], [0, 1], [1, 0]],
            [[0, columns - 1], [0, -1], [1, 0]],
        ];

        console.log(clonedMap);

        function lineScan(startingPosition, traverseDirection, perpendicularDirection) {
            for (let [y, x] = startingPosition; checkInside(y, x); y += traverseDirection[0], x += traverseDirection[1]) {
                const curRow = (strikeFromPosition([y, x], perpendicularDirection));

                const edge_1_1 = curRow.search(/^11[\d]/);
            }
        }

        for (let dir of lineDirs) {
            lineScan(...dir);
        }

        // Transfer progress back to main map;
        scanCloned("s", (y, x) => map[y][x] = "s");
    }

    let oldState;
    for (let curState = JSON.stringify(map); oldState !== curState; oldState = curState, curState = JSON.stringify(map)) {
        basicMapScan();
        basicMapScan2();
    }

    advancedScan(map, n);


    let result = map.map(x => x.join(" ")).join("\n");
    return result.includes("?") ? "?" : result;
}