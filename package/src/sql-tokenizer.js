/**
 * @param {string} text
 */
export function tokenizer(text) {
    const types = {
        keyword: /\b(SELECT|DISTINCT|FILTER|FROM|LEFT|RIGHT|INNER|OUTER|FULL|JOIN|ON|WHERE|ORDER BY|OR|AND|IN|AS|OVER|PARTITION BY|UNBOUNDED|PRECEDING|FOLLOWING|FETCH|FIRST|NEXT|ROW|ROWS|ONLY|WINDOW|HAVING|LIMIT|OFFSET|EXPLAIN|CREATE|TEMP|TABLE|VIEW|INSERT INTO|VALUES|UPDATE|SET|DELETE|DROP|TRUNCATE|EXCEPT|INTERSECT|UNION ALL|UNION)\b/gy,
        number: /-?\d+(\.\d+)?/gy,
        name: /\w+|"[^"]*"/gy,
        string: /'[^']*'/gy,
        punctuation: /\*|,|\(|\)/gy,
    };

    const out = [];

    for (let start = 0; start < text.length;) {
        let match;

        for (const [type, regex] of Object.entries(types)) {
            regex.lastIndex = start;
            if (match = regex.exec(text)) {
                const length = match[0].length;

                out.push({
                    type,
                    start,
                    length,
                });

                start += length;
                break;
            }
        }

        if (!match) {
            start++;
        }
    }

    return out;
}