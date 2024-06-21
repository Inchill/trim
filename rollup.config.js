import typescript from 'rollup-plugin-typescript2'
import babel from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
import terser from '@rollup/plugin-terser'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'

let firstBuild = true
const isDev = process.env.NODE_ENV !== 'production'

const devPlugins = [
  livereload('dist'),
  serve({
    open: false,
    close: true,
    contentBase: ['.', 'src', 'public'],
    host: 'localhost',
    port: 8680,
    onOpen () {
      if (firstBuild) {
        firstBuild = false
      }
    }
  })
]

const prodPlugins = [
  terser({
    compress: true,
    mangle: true
  })
]

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/trim.js',
    format: 'umd',
    name: 'trim'
  },
  plugins: [
    typescript(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled'
    }),
    postcss({
      extract: true, // 提取 CSS 文件
      minimize: !isDev // 生产模式下压缩 CSS
    }),
    ...(isDev ? [] : prodPlugins),
    ...(isDev ? devPlugins : [])
  ]
}
