/**
 * @param {string} text
 * @param {{ [type: string]: RegExp }} types
 */
export function tokenizer(text, types) {
    const out = [];

    for (let start = 0; start < text.length;) {
        let match;

        for (const [type, regex] of Object.entries(types)) {
            regex.lastIndex = start;
            if (match = regex.exec(text)) {
                const length = match[0].length;

                if (length === 0) {
                    throw Error(type);
                }

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