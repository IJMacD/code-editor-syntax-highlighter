import "./editor.css";

/**
 * @typedef Token
 * @property {string} type
 * @property {number} start
 * @property {number} length
 */

/**
 * @param {string | Element} element
 * @param {{ tokenizer?: (text: string) => Token[], plugins?: ((textarea: HTMLTextAreaElement) => () => void)[] }} options
 */
export function editor(element, { tokenizer, plugins = [tabPlugin, enterPlugin, quotesPlugin] } = {}) {
    if (typeof element === "string") {
        const el = document.querySelector(element);

        if (el) {
            element = el;
        }
    }

    if (!element || !(element instanceof HTMLTextAreaElement)) {
        console.warn("[Editor] Couldn't find element or element wasn't a textarea");
        return;
    }

    const parent = element.parentElement;

    if (!parent) {
        console.warn("[Editor] Element didn't have a parent");
        return;
    }

    const textarea = element;

    const editor = document.createElement("div");

    editor.classList.add("cesh-editor");

    textarea.classList.add("cesh-textarea");

    parent.style.position = "relative";

    parent.insertBefore(editor, element);

    const handleChange = () => {
        let text = textarea.value;
        const tokens = tokenizer ? tokenizer(text) : [];

        // Scroll bug if there's a spare newline at the end.
        if (text[text.length - 1] === "\n") {
            text += " ";
        }

        editor.innerHTML = markup(text, tokens);

        editor.scrollTop = textarea.scrollTop;
    };

    const scroll = () => {
        editor.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener("keyup", handleChange);

    textarea.addEventListener("input", handleChange);

    textarea.addEventListener("scroll", scroll);

    const handleResize = () => {
        editor.style.width = `${textarea.offsetWidth}px`;
        editor.style.height = `${textarea.offsetHeight}px`;
        // Just in case stylesheet hasn't loaded correctly, we'll make sure
        // that the position is set to absolute to avoid resize glitches/jank
        editor.style.position = "absolute";
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(textarea);

    handleResize();

    handleChange();

    /** @type {(() => void)[]} */
    const unPlugin = [];
    for (const plugin of plugins) {
        const retVal = plugin(textarea);
        if (retVal) {
            unPlugin.push(retVal);
        }
    }

    return {
        destroy() {
            parent.removeChild(editor);
            textarea.classList.remove("cesh-textarea");
            textarea.removeEventListener("keyup", handleChange);
            textarea.removeEventListener("input", handleChange);
            textarea.removeEventListener("scroll", scroll);
            observer.disconnect();

            for (const fn of unPlugin) {
                fn();
            }
        }
    }

}

/**
 * @param {string} text
 * @param {number} position
 */
function getStartOfLine(text, position) {
    const prevNewLine = text.lastIndexOf("\n", position - 1);

    if (prevNewLine < 0) {
        return 0;
    }

    return prevNewLine + 1;
}

/**
 * Handles inserting tabs (as four spaces) and removing leading tabs (with
 * shift-tab).
 * @param {HTMLTextAreaElement} textarea
 */
export function tabPlugin(textarea) {
    const keydown = (/** @type {KeyboardEvent} */ e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const i = textarea.selectionStart;
            const { value } = textarea;
            if (e.shiftKey) {
                const lineStart = getStartOfLine(value, i);
                if (value.substring(lineStart, lineStart + 4) === "    ") {
                    textarea.value = value.substring(0, lineStart) + value.substring(lineStart + 4);
                    textarea.selectionStart = i - 4;
                    textarea.selectionEnd = i - 4;
                }
            }
            else {
                textarea.value = value.substring(0, i) + "    " + value.substring(i);
                textarea.selectionStart = i + 4;
                textarea.selectionEnd = i + 4;
            }
        }
    };

    textarea.addEventListener("keydown", keydown);

    return () => textarea.removeEventListener("keydown", keydown);
}

/**
 * Maintains indentation on enter key
 * @param {HTMLTextAreaElement} textarea
 */
export function enterPlugin(textarea) {
    const keydown = (/** @type {KeyboardEvent} */ e) => {
        if (e.key === "Enter") {
            const i = textarea.selectionStart;
            const { value } = textarea;
            const lineStart = getStartOfLine(value, i);
            const regex = / +/gy;
            regex.lastIndex = lineStart;
            const match = regex.exec(value);
            if (match) {
                e.preventDefault();
                const length = match[0].length;
                textarea.value = value.substring(0, i) + "\n" + " ".repeat(length) + value.substring(i);
                textarea.selectionStart = i + length + 1;
                textarea.selectionEnd = i + length + 1;
            }
        }
    };

    textarea.addEventListener("keydown", keydown);

    return () => textarea.removeEventListener("keydown", keydown);
}

/**
 * Add single or double quotes, or parentheses or brackets around selected text.
 * @param {HTMLTextAreaElement} textarea
 */
export function quotesPlugin(textarea) {
    const keydown = (/** @type {KeyboardEvent} */ e) => {
        const pairs = {
            "'": "'",
            "\"": "\"",
            "(": ")",
            "{": "}",
            "[": "]",
        };
        if (pairs[e.key]) {
            const i = textarea.selectionStart;
            const j = textarea.selectionEnd;
            if (j - i > 0) {
                e.preventDefault();
                const { value } = textarea;

                textarea.value =
                    value.substring(0, i)
                    + e.key
                    + value.substring(i, j)
                    + pairs[e.key]
                    + value.substring(j);

                textarea.selectionStart = i + 1;
                textarea.selectionEnd = j + 1;
            }
        }
    };

    textarea.addEventListener("keydown", keydown);

    return () => textarea.removeEventListener("keydown", keydown);
}

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
            markup.push(text.substring(lastIndex, token.start));
        }

        lastIndex = token.start + token.length;

        markup.push(`<span class="${token.type}">${text.substring(token.start, lastIndex)}</span>`);
    }

    if (lastIndex < text.length) {
        markup.push(text.substring(lastIndex));
    }

    return markup.join("");
}