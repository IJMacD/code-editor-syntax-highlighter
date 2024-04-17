import React, { useEffect, useRef } from "react";
import { positionPlugin, resizePlugin, scrollPlugin, tokenizerPlugin } from "./editor";

// export function CeshEditor({ value = "", onChange = (/** @type {string} */ _) => void 0, plugins = [] }) {
export function CeshEditor({ value, onChange, plugins, style }) {
    const textareaRef = useRef(/** @type {HTMLTextAreaElement?} */(null));
    const editorRef = useRef(/** @type {HTMLDivElement?} */(null));

    plugins = [
        tokenizerPlugin(() => []),
        scrollPlugin,
        resizePlugin,
        positionPlugin,
        ...plugins
    ];

    useEffect(() => {
        /** @type {(() => void)[]} */
        const unFeature = [];

        for (const plugin of plugins) {
            const retVal = plugin(textareaRef.current, editorRef.current);
            if (retVal) {
                unFeature.push(retVal);
            }
        }

        return () => {
            for (const fn of unFeature) {
                fn();
            }
        }
    }, [plugins]);

    return (
        <div style={{ position: "relative" }}>
            <textarea className="cesh-textarea" ref={textareaRef} value={value} onChange={e => onChange(e.target.value)} style={style} />
            <div className="cesh-editor" ref={editorRef} />
        </div>
    );
}