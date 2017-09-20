import typescript from "rollup-plugin-typescript";
import nodeResolve from "rollup-plugin-node-resolve";
import commonJs from "rollup-plugin-commonjs";

export default {
  input: "./src/index.ts",

  output: {
    name: "filter.js",
    format: "umd",
    globals: {
      react: "React",
      "prop-types": "PropTypes",
      moment: "moment"
    }
  },

  plugins: [
    typescript({ typescript: require("typescript") }),
    nodeResolve({ browser: true, preferBuiltins: false }),
    commonJs({ sourceMap: false })
  ]
};
