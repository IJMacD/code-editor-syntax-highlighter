import { editor, tabPlugin, enterPlugin, quotesPlugin, fontPlugin } from "./editor";
import { markup } from "./markup";
import { tokenizer as sqlTokenizer } from "./sql-tokenizer";
import { tokenizer as jsTokenizer } from "./js-tokenizer";
import { tokenizer as twigTokenizer } from "./twig-tokenizer";
import "./highlight.css";

export {
    editor,
    markup,

    tabPlugin,
    enterPlugin,
    quotesPlugin,
    fontPlugin,

    sqlTokenizer,
    jsTokenizer,
    twigTokenizer,
};