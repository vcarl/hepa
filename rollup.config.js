import typescript from "rollup-plugin-typescript2";
import nodeResolve from "rollup-plugin-node-resolve";
import commonJs from "rollup-plugin-commonjs";

export default {
  input: "./src/index.ts",

  output: {
    name: "filter.js",
    format: "cjs",
    globals: {
      react: "React",
      "prop-types": "PropTypes",
      moment: "moment"
    }
  },
  external: ["react", "prop-types", "moment"],

  plugins: [
    typescript({ typescript: require("typescript") }),
    nodeResolve({ browser: true, preferBuiltins: false }),
    commonJs({ sourceMap: false })
  ]
};
