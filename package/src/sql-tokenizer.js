import { tokenizer as commonTokenizer } from "./common-tokenizer";

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

    return commonTokenizer(text, types);
}