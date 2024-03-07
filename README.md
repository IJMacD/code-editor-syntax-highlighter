# Cesh

_Code Editor Syntax Highlighter_ is an as absolutely as simple as possible decorated textarea code editor.


## Usage
```html
<div style="display: flex;">
    <textarea id="my-editor" style="height: 300px; flex: 1;">
SELECT
    *,
    123,
    'abc'
FROM
    "table"</textarea>
</div>

<script src="./cesh.umd.min.js"></script>
<script>
    cesh.editor(document.querySelector("#my-editor"), { tokenizer: cesh.sqlTokenizer });
</script>
```

## Demo

https://ijmacd.github.io/code-editor-syntax-highlighter/