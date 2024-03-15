/**
 * Convert string to marked up HTML string
 * @param {string} text
 * @param {Token[]} tokens
 */

export function markup(text, tokens) {
    const markup = [];

    let lastIndex = 0;
    for (const token of tokens) {
        if (token.start > lastIndex) {
            markup.push(escapeHtml(text.substring(lastIndex, token.start)));
        }

        lastIndex = token.start + token.length;

        markup.push(`<span class="${token.type}">${escapeHtml(text.substring(token.start, lastIndex))}</span>`);
    }

    if (lastIndex < text.length) {
        markup.push(escapeHtml(text.substring(lastIndex)));
    }

    return markup.join("");
}
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
