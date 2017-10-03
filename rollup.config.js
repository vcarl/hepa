import commonjs from "rollup-plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import sourceMaps from "rollup-plugin-sourcemaps";
import uglify from "rollup-plugin-uglify";

const shared = {
  input: "compiled/index.js",
  sourcemap: true,
  external: ["react", "prop-types"],
  globals: {
    react: "React",
    "prop-types": "PropTypes"
  },
  exports: "named"
};

export default [
  Object.assign({}, shared, {
    name: "Hepa",
    output: {
      format: "umd",
      file:
        process.env.NODE_ENV === "production"
          ? "./dist/hepa.umd.min.js"
          : "./dist/hepa.umd.js"
    },
    plugins: [
      resolve(),
      replace({
        exclude: "node_modules/**",
        "process.env.NODE_ENV": JSON.stringify(
          process.env.NODE_ENV || "development"
        )
      }),
      resolve(),
      commonjs({
        include: /node_modules/,
        namedExports: {
          "node_modules/prop-types/index.js": [
            "object",
            "oneOfType",
            "string",
            "node",
            "func",
            "bool",
            "element",
            "array",
            "arrayOf"
          ]
        }
      }),
      sourceMaps(),
      process.env.NODE_ENV === "production" && filesize(),
      process.env.NODE_ENV === "production" && uglify()
    ]
  }),

  Object.assign({}, shared, {
    output: [
      { file: "dist/hepa.es6.js", format: "es" },
      { file: "dist/hepa.js", format: "cjs" }
    ],
    plugins: [
      resolve(),
      commonjs({
        include: /node_modules/,
        namedExports: {
          "node_modules/prop-types/index.js": [
            "object",
            "oneOfType",
            "string",
            "node",
            "func",
            "bool",
            "element",
            "array",
            "arrayOf"
          ]
        }
      }),
      ,
      sourceMaps()
    ]
  })
];
