import { tokenizer as commonTokenizer } from "./common-tokenizer";

/**
 * @param {string} text
 */
export function tokenizer(text) {
    const types = {
        punctuation: /{{[-~]?|[-~]?}}|{%[-~]?|[-~]?%}/gy,
        keyword: /\b(for|in|endfor|if|endif|block|endblock|apply|endapply|autoescape|endautoescape|set|extends)\b/gy,
        operator: /(\b(b-and|b-xor|b-or|not|or|and|in|matches|starts with|ends with|has every|has some)\b)|\?:|\?|:|==|!=|<=>|<|>|>=|<=|\.\.|\+|-|~|\*|\/|\/\/|%|is|\*\*|\?\?|\||\[|\]\./gy,
        number: /-?\d+(\.\d+)?/gy,
        string: /'[^']*'|"[^"]*"/gy,
        comment: /{#.*?#}/sgy,
        name: /\w+/gy,
    };

    const tokens = commonTokenizer(text, types);

    const out = [];

    let inTag = false;
    for (const token of tokens) {
        if (inTag || token.type === "comment") {
            out.push(token);
        }

        if (token.type === "punctuation") {
            const t = text.substring(token.start, token.start + 2);
            if (t === "{{" || t === "{%") {
                inTag = true;
                out.push(token);
            }
            else {
                inTag = false;
            }
        }
    }

    return out;
}