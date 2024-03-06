import scss from 'rollup-plugin-scss';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' assert { type: "json" };

export default {
    input: 'src/index.js',
    plugins: [
        terser(),
        scss({
            fileName: 'cesh.min.css',
            outputStyle: "compressed"
        }),
    ],
    output: [
        {
            name: 'cesh',
            file: pkg.browser,
            format: 'umd',
        },
        {
            file: pkg.module,
            format: 'es'
        },
    ]
};