import "./editor.css";

/**
 * @typedef Token
 * @property {string} type
 * @property {number} start
 * @property {number} length
 */

/**
 * @param {string | Element | null} element
 * @param {{ formatter?: (text: string) => Token[] }} options
 */
export function editor(element, { formatter } = {}) {
    if (typeof element === "string") {
        element = document.querySelector(element);
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

    const keydown = (/** @type {KeyboardEvent} */ e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const i = textarea.selectionStart;
            const { value } = textarea;
            if (e.shiftKey) {
                let prevNewLine = value.lastIndexOf("\n", i - 1);
                if (prevNewLine < 0) {
                    prevNewLine = 0;
                } else {
                    prevNewLine++;
                }
                if (value.substring(prevNewLine, prevNewLine + 4) === "    ") {
                    textarea.value = value.substring(0, prevNewLine) + value.substring(prevNewLine + 4);
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
        else if (e.key === "Enter") {
            const i = textarea.selectionStart;
            const { value } = textarea;
            let prevNewLine = value.lastIndexOf("\n", i - 1);
            if (prevNewLine < 0) {
                prevNewLine = 0;
            } else {
                prevNewLine++;
            }
            const regex = / +/gy;
            regex.lastIndex = prevNewLine;
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

    const handleChange = () => {
        let text = textarea.value;
        const tokens = formatter ? formatter(text) : [];

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

    textarea.addEventListener("keydown", keydown);

    textarea.addEventListener("keyup", handleChange);

    textarea.addEventListener("input", handleChange);

    textarea.addEventListener("scroll", scroll);

    const handleResize = () => {
        editor.style.width = `${textarea.offsetWidth}px`;
        editor.style.height = `${textarea.offsetHeight}px`;
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(textarea);

    handleResize();

    handleChange();

    return {
        destroy() {
            parent.removeChild(editor);
            textarea.classList.remove("cesh-textarea");
            textarea.removeEventListener("keydown", keydown);
            textarea.removeEventListener("keyup", handleChange);
            textarea.removeEventListener("input", handleChange);
            textarea.removeEventListener("scroll", scroll);
            observer.disconnect();
        }
    }
}

/**
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