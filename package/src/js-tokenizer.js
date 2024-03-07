import { tokenizer as commonTokenizer } from "./common-tokenizer";

/**
 * @param {string} text
 */
export function tokenizer(text) {
    const types = {
        comment: /\/\*.*?\*\/|\/\/[^\n]*?\n/sgy,
        keyword: /\b(var|let|const|return|if|for|of|in|while|yield|function|async|await|null|undefined|import|export|as|from|assert|delete|typeof|instanceof)\b/gy,
        number: /-?\d+(\.\d+)?([eE][+-]?\d+)?/gy,
        name: /\w+/gy,
        string: /'[^'\n]*'|"[^"\n]*"|`[^`]*`/gy,
        punctuation: /:|,|\(|\)|{|}|;/gy,
        regex: /\/[^\n]*?[^\\]\//gy,
        operator: /\*=|\/=|\+=|-=|=|\+\+|--|&&|\|\|!|&|\||\*|\/|\+|-/gy,
    };

    return commonTokenizer(text, types);
}