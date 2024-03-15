import "./editor.css";
import { markup } from "./markup";

/**
 * @typedef Token
 * @property {string} type
 * @property {number} start
 * @property {number} length
 */

/**
 * @param {string | Element} element
 * @param {{ tokenizer: (text: string) => Token[], plugins?: ((textarea: HTMLTextAreaElement, editor: HTMLDivElement) => () => void)[] }} options
 */
export function editor(element, { tokenizer, plugins = [tabPlugin, enterPlugin, quotesPlugin] }) {
    return baseEditor(element, [
        tokenizerPlugin(tokenizer),
        scrollPlugin,
        resizePlugin,
        positionPlugin,
        ...plugins,
    ]);
}

/**
 * @param {string | Element} element
 * @param {((textarea: HTMLTextAreaElement, editor: HTMLDivElement) => () => void)[] } features
 */
export function baseEditor(element, features) {
    if (typeof element === "string") {
        const el = document.querySelector(element);

        if (el) {
            element = el;
        }
    }

    if (!(element instanceof HTMLTextAreaElement)) {
        console.warn("[Cesh] Not a textarea");
        return;
    }

    const parent = element.parentElement;

    if (!parent) {
        // Textarea not in DOM tree. Just return
        return;
    }

    // Elements
    const textarea = element;
    const editor = document.createElement("div");
    parent.insertBefore(editor, element);

    // Styles
    textarea.classList.add("cesh-textarea");
    editor.classList.add("cesh-editor");
    parent.style.position = "relative";
    // Just in case stylesheet hasn't loaded correctly, we'll make sure
    // that the position is set to absolute to avoid resize glitches/jank
    editor.style.position = "absolute";

    // const styles = textarea.computedStyleMap();
    // editor.style.fontSize = styles.get("font-size");
    // editor.style.fontWeight = styles.get("font-weight");
    // editor.style.border = styles.get("font-weight");


    /** @type {(() => void)[]} */
    const unFeature = [];
    for (const plugin of features) {
        const retVal = plugin(textarea, editor);
        if (retVal) {
            unFeature.push(retVal);
        }
    }

    return {
        destroy() {
            parent.removeChild(editor);
            textarea.classList.remove("cesh-textarea");

            for (const fn of unFeature) {
                fn();
            }
        }
    }

}

/**
 * @param {HTMLTextAreaElement} textarea
 * @param {HTMLDivElement} editor
 */
function resizePlugin(textarea, editor) {
    const handleResize = () => {
        editor.style.width = `${textarea.offsetWidth}px`;
        editor.style.height = `${textarea.offsetHeight}px`;
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(textarea);

    handleResize();

    return () => observer.disconnect();
}

/**
 * Uses a polling implementation
 * @param {HTMLTextAreaElement} textarea
 * @param {HTMLDivElement} editor
 */
function positionPlugin(textarea, editor) {
    const handlePosition = () => {
        editor.style.top = `${textarea.offsetTop}px`;
        editor.style.left = `${textarea.offsetLeft}px`;
    };

    handlePosition();

    const positionInterval = setInterval(handlePosition, 100);

    return () => clearInterval(positionInterval);
}

/**
 * @param {HTMLTextAreaElement} textarea
 * @param {HTMLDivElement} editor
 */
function scrollPlugin(textarea, editor) {
    const scroll = () => {
        editor.scrollLeft = textarea.scrollLeft;
        editor.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener("scroll", scroll);

    return () => textarea.removeEventListener("scroll", scroll);
}

const tokenizerPlugin = (/** @type {(text: string) => Token[]} */ tokenizer) =>
    /**
     * @param {HTMLTextAreaElement} textarea
     * @param {HTMLDivElement} editor
     */
    (textarea, editor) => {
        const handleChange = () => {
            let text = textarea.value;
            const tokens = tokenizer(text);

            // Scroll bug if there's a spare newline at the end.
            if (text[text.length - 1] === "\n") {
                text += " ";
            }

            editor.innerHTML = markup(text, tokens);
        };

        textarea.addEventListener("keyup", handleChange);

        textarea.addEventListener("input", handleChange);

        const vChange = () => {
            document.visibilityState === "visible" && handleChange();
        };
        document.addEventListener("visibilitychange", vChange);

        handleChange();

        return () => {
            textarea.removeEventListener("keyup", handleChange);
            textarea.removeEventListener("input", handleChange);
            document.removeEventListener("visibilitychange", vChange);
        };
    };

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
            const j = textarea.selectionEnd;
            const { value } = textarea;
            const lineStart = getStartOfLine(value, i);
            if (i === j) {
                if (e.shiftKey) {
                    const re = / {1,4}/y;
                    re.lastIndex = lineStart;
                    const match = re.exec(value);
                    if (match) {
                        const l = match[0].length;
                        textarea.value = value.substring(0, lineStart) + value.substring(lineStart + l);
                        textarea.selectionStart = i - l;
                        textarea.selectionEnd = i - l;
                    }
                }
                else {
                    const index = (i - lineStart) % 4;
                    const d = index === 0 ? 4 : 4 - index;
                    textarea.value = value.substring(0, i) + " ".repeat(d) + value.substring(i);
                    textarea.selectionStart = i + d;
                    textarea.selectionEnd = i + d;
                }
            }
            else {
                const mid = value.substring(lineStart, j);
                if (e.shiftKey) {
                    const re = /(^|\n)    /g;
                    const mod = mid.replace(re, (n) => n[0] === "\n" ? "\n" : "");
                    const mud = [...mid.matchAll(re)].length;
                    textarea.value = value.substring(0, lineStart) + mod + value.substring(j);
                    textarea.selectionStart = i - 4;
                    textarea.selectionEnd = j - mud * 4;
                }
                else {
                    const mod = mid.replace(/\n/g, "\n    ");
                    const mud = mid.replace(/[^\n]/g, "").length + 1;
                    textarea.value = value.substring(0, lineStart) + "    " + mod + value.substring(j);
                    textarea.selectionStart = i + 4;
                    textarea.selectionEnd = j + mud * 4;
                }
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
