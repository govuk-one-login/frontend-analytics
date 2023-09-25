module.exports = {
    env: {
        node: true,
    },
    plugins: ["es5"],
    extends: [
        "plugin:es5/no-es2015",
        "plugin:es5/no-es2016"
    ]
}