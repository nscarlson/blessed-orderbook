module.exports = {
    arrowParens: 'always',
    bracketSpacing: true,
    jsxBracketSameLine: false,
    printWidth: 80,
    semi: false,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    useTabs: false,
    overrides: [
        {
            files: ['*.yml', '*.yaml'],
            options: {
                tabWidth: 2,
            },
        },
    ],
}
