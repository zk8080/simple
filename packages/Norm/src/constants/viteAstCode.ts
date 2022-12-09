// 引入vite-plugin-eslint插件
export const eslintImport = {
  type: 'ImportDeclaration',
  specifiers: [
    {
      type: 'ImportDefaultSpecifier',
      local: {
        type: 'Identifier',
        name: 'eslintPlugin',
      },
    },
  ],
  source: {
    type: 'StringLiteral',
    extra: {
      rawValue: 'vite-plugin-eslint',
      raw: "'vite-plugin-eslint'",
    },
    value: 'vite-plugin-eslint',
  },
};

// 调用eslintPlugin
export const eslintPluginCall = {
  type: 'CallExpression',
  callee: {
    type: 'Identifier',
    name: 'eslintPlugin',
  },
  arguments: [],
};

// 引入vite-plugin-stylelint插件
export const stylelintImport = {
  type: 'ImportDeclaration',
  specifiers: [
    {
      type: 'ImportDefaultSpecifier',
      local: {
        type: 'Identifier',
        name: 'stylelintPlugin',
      },
    },
  ],
  source: {
    type: 'StringLiteral',
    extra: {
      rawValue: 'vite-plugin-stylelint',
      raw: "'vite-plugin-stylelint'",
    },
    value: 'vite-plugin-stylelint',
  }
}

// 调用stylelint
export const stylelintPluginCall = {
  type: 'CallExpression',
  callee: {
    type: 'Identifier',
    name: 'stylelintPlugin',
  },
  arguments: [],
};


// 空格
export const blankLine = {
  type: 'Identifier',
  name: '\n',
}