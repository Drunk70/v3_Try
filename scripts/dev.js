/**
 *  这个文件作用是，帮助我们打包 packages 下的模块，打包出js文件
 *
 **/

// minimist是已经pnpm下载了的。
const path = require("path");

// 为什么要 slice(2) ？
// 打包的时候会执行 =》 node dev.js 打包的名称 -f 打包的格式
// process.argv 会拿到命令行的输入，前两个对应的也就是（node、dev.js），不需要所以删除
// minimist是干嘛的？
// minimist可以把我们输入的命令行转换成需要的数据
const args = require("minimist")(process.argv.slice(2));
// console.log(args); // args 的结果就是 {_:['打包的名称'],f:'打包的格式'}

const target = args._[0] || "reactivity"; // 获取打包的名称，如果没传默认打包reactivity
const format = args.f || "global"; // 获取打包的格式
// console.log(target, format);

// 入口=》 我们已经拿到要打包的名称了，可以入口路径，也就是package文件夹下找要打包的文件拼接
const entry = path.resolve(__dirname, `../packages/${target}/src/index.ts`);

// 打包出口同理
const outfile = path.resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
);

// 打包的格式
const outputFormat = format.startsWith("global")
  ? "iife"
  : format === "cjs"
  ? "cjs"
  : "esm";

// 全局名称
// 也就是拿到 获取打包文件的package.json 里的 buildOptions属性
const packageName = require(path.resolve(
  __dirname,
  `../packages/${target}/package.json`
)).buildOptions?.name;
const { build } = require("esbuild");

let sum=1
build({
  entryPoints: [entry], //入口
  outfile, // 出口
  sourcemap: true, // 允许调试源代码
  bundle: true, // 是否和它的依赖打包的一起，比如reactivity引入了shard
  platform: format === "cjs" ? "node" : "browser", // 打包给谁使用
  format:outputFormat,  // 打包的格式
  globalName: packageName, // 全局名称
  watch: {
    // 监控文件变化
    onRebuild(error) {
      if (!error) console.log(`文件变化了！第${sum++}次`);
    },
  },
}).then(() => {
  console.log(`打包完成`);
});
