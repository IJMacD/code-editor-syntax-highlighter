import { editor, tabPlugin, enterPlugin, quotesPlugin } from "./editor";
import { markup } from "./markup";
import { tokenizer as sqlTokenizer } from "./sql-tokenizer";
import { tokenizer as jsTokenizer } from "./js-tokenizer";
import "./highlight.css";

export {
    editor,
    markup,

    tabPlugin,
    enterPlugin,
    quotesPlugin,

    sqlTokenizer,
    jsTokenizer,
};