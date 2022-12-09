import * as babel from "@babel/core";
import enquirer from "enquirer";
import { eslintPluginCall, eslintImport, stylelintImport, stylelintPluginCall, blankLine } from "./constants/viteAstCode";

type PackageManagerType = "npm" | "yarn" | "pnpm";

interface ILintType {
  useEslint: boolean;
  useStylelint: boolean;
  useTypeScript: boolean;
  useVite: boolean;
  packageManager: PackageManagerType;
}
// 问答
export const askForLintType = () => {
  return enquirer.prompt<ILintType>([
    {
      type: "confirm",
      name: "useVite",
      message: "Whether to use Vite?",
    },
    {
      type: "confirm",
      name: "useEslint",
      message: "Whether to use Eslint?",
    },
    {
      type: "confirm",
      name: "useStylelint",
      message: "Whether to use Stylelint?",
    },
    {
      type: "confirm",
      name: "useTypeScript",
      message: "Whether to use TypeScript?",
    },
    {
      type: "select",
      name: "packageManager",
      message: "What package manager do you use?",
      choices: ["npm", "yarn", "pnpm"],
    },
  ]);
};

// 下载依赖包
export const downloadPackageCommand = (packageManager: PackageManagerType, packages: string[]) => {
  if(['yarn', 'pnpm'].includes(packageManager)) {
    return `${packageManager} add -D ${packages.join(' ')}`
  }
  return `${packageManager} install -D ${packages.join(' ')}`
}

// 转换vite配置文件内容
export const transformViteConfig = (code: string, configEslit: boolean, configStyleLint: boolean) => {
  const ast = babel.parseSync(code, {
    sourceType: "module",
    comments: false,
  });

  const { program } = ast;

  const importList: any[] = program.body
    .filter((body) => {
      return body.type === 'ImportDeclaration';
    })
    .map((body) => {
      delete body.trailingComments;
      return body;
    });

  // 是否已经引入Eslint插件
  const hasEslintImport = importList.some((body) => body.source.value === 'vite-plugin-eslint');
  // 是否已经引入Stylelint插件
  const hasStylelintImport = importList.some((body) => body.source.value === 'vite-plugin-stylelint');

  if(configEslit && hasEslintImport) {
    if(!configStyleLint) return code;
    if(configStyleLint && hasStylelintImport) return code;
  }

  if(configStyleLint && hasStylelintImport) {
    if(!configEslit) return code;
    if(configEslit && hasEslintImport) return code;
  }

  const nonImportList = program.body.filter((body) => {
    return body.type !== 'ImportDeclaration';
  });
  const exportStatement = program.body.find(
    (body) => body.type === 'ExportDefaultDeclaration'
  );

  if (exportStatement.declaration.type === 'CallExpression') {
    const [argument] = exportStatement.declaration.arguments;
    if (argument.type === 'ObjectExpression') {
      const plugin = argument.properties.find(
        ({ key }) => key.name === 'plugins'
      );

      if (plugin) {
        if(configEslit && !hasEslintImport) {
          plugin.value.elements.push(eslintPluginCall);
        }
        if(configStyleLint && !hasStylelintImport) {
          plugin.value.elements.push(stylelintPluginCall);
        }
      }
    }
  }
  if(configEslit && !hasEslintImport) {
    importList.push(eslintImport);
  }
  if(configStyleLint && !hasStylelintImport) {
    importList.push(stylelintImport);
  }
  
  importList.push(blankLine);
  program.body = importList.concat(nonImportList);

  ast.program = program;

  return babel.transformFromAstSync(ast, code, { sourceType: 'module' }).code;
};
