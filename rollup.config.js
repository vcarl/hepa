import typescript from "rollup-plugin-typescript";

export default {
  input: "./src/index.ts",

  output: {
    name: "filter.js",
    format: "umd",
    globals: {
      react: "React",
      "prop-types": "PropTypes",
      moment: "moment",
      "fast-memoize": "memoize"
    }
  },

  plugins: [typescript({ typescript: require("typescript") })]
};
