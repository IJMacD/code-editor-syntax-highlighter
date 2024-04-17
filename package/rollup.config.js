import scss from 'rollup-plugin-scss';
import terser from '@rollup/plugin-terser';
import jsx from 'rollup-plugin-jsx';
import pkg from './package.json' assert { type: "json" };

export default {
    external: ['react'],
    input: 'src/index.js',
    plugins: [
        jsx({
            factory: "React.createElement",
            // include: /\.jsx$/,
            include: "**/*.jsx",
        }),
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
            globals: { "react": "React" }
        },
        {
            file: pkg.module,
            format: 'es',
            globals: { "react": "React" }
        },
    ]
};