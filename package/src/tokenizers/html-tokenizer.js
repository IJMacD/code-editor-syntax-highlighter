import { tokenizer as commonTokenizer } from "./common-tokenizer";

/**
 * @param {string} text
 */
export function htmlTokenizer(text) {
    const types = {
        comment: /<!--.*?-->/sgy,
        keyword: /<[a-z1-6]+\s*\/>|<[a-z1-6]+|>|<\/[a-z1-6]+>/gy,
        string: /'.*?'|".*?"/gy,
    };

    return commonTokenizer(text, types);
}