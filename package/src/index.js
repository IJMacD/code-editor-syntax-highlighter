import { editor, tabPlugin, enterPlugin, quotesPlugin, fontPlugin, tokenizerPlugin } from "./editor";
import { markup } from "./markup";
import { tokenizer as sqlTokenizer } from "./tokenizers/sql-tokenizer.js";
import { tokenizer as jsTokenizer } from "./tokenizers/js-tokenizer.js";
import { tokenizer as twigTokenizer } from "./tokenizers/twig-tokenizer.js";
import { htmlTokenizer } from "./tokenizers/html-tokenizer.js";
import { CeshEditor } from "./CeshEditor.jsx";
import "./highlight.css";

export {
    editor,
    markup,

    CeshEditor,

    tabPlugin,
    enterPlugin,
    quotesPlugin,
    fontPlugin,

    tokenizerPlugin,

    sqlTokenizer,
    jsTokenizer,
    twigTokenizer,
    htmlTokenizer,
};