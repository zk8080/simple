import chalk from "chalk";
import gradient from "gradient-string";
import path from "path";
import fs from "fs-extra";
import { createSpinner } from "nanospinner";
import { exec } from "child_process";
import { eslintConfig } from "./template/eslint-js";
import { eslintTsConfig } from "./template/eslint-ts";
import { askForLintType, downloadPackageCommand, transformViteConfig } from "./utils";
import {
  ESLINT_COMMON_PACKAGE,
  ESLINT_TS_PACKAGE,
  PRETTIER_COMMON_PACKAGE,
  STYLELINT_COMMON_PACKAGE,
  VITE_ESLINT_PACKAGE,
  VITE_STYLELINT_PACKAGE,
} from "./constants";
import { prettierConfig } from "./template/prettier";
import { stylelintConfig } from "./template/stylelint";
import { eslintIgnoreConfig } from "./template/eslintignore";

const projectDirectory = process.cwd();

async function start() {
  console.log(
    chalk.bold(
      gradient.morning("\n🚀 Welcome to Eslint & Prettier Setup for Vite!\n")
    )
  );
  try {
    const { useTypeScript, useVite, packageManager, useEslint, useStylelint } =
      await askForLintType();

    if (!useEslint && !useStylelint) {
      console.log(chalk.blue("\n👋 Goodbye!"));
      return;
    }

    let packageList: string[] = [...PRETTIER_COMMON_PACKAGE];
    let viteFilePath: string = '';

    // vite
    if (useVite) {
      const viteFileName = ["vite.config.js", "vite.config.ts"];
      const [viteFile] = viteFileName
        .map((file) => path.join(projectDirectory, file))
        .filter((file) => fs.existsSync(file));

      if (!viteFile) {
        console.log(
          chalk.red(
            "\n🚨 No vite config file found. Please run this command in a Vite project.\n"
          )
        );
        return;
      }
      viteFilePath = viteFile;
      if(useEslint) packageList = [...packageList, ...VITE_ESLINT_PACKAGE];
      if(useStylelint) packageList = [...packageList, ...VITE_STYLELINT_PACKAGE];
    }

    // eslint
    if (useEslint) {
      packageList = [...packageList, ...ESLINT_COMMON_PACKAGE];
      if(useTypeScript) {
        packageList = [...packageList, ...ESLINT_TS_PACKAGE];
      }
    }

    // stylelint
    if (useStylelint) {
      packageList = [...packageList, ...STYLELINT_COMMON_PACKAGE];
    }

    const spinner = createSpinner(
      gradient.morning("\n⏬ Installing All packages...")
    ).start();
    exec(
      downloadPackageCommand(packageManager, Array.from(new Set(packageList))),
      {
        cwd: projectDirectory,
      },
      (error) => {
        if (error) {
          spinner.error({
            text: chalk.bold.red("\n❌ Failed to install packages!"),
            mark: "✖",
          });
          throw Error(error.message);
        }
        // prettier
        if (useStylelint || useEslint) {
          const prettierFile = path.join(projectDirectory, ".prettierrc.json");
          fs.writeFileSync(
            prettierFile,
            JSON.stringify(prettierConfig, null, 2)
          );
        }
        // eslint
        if (useEslint) {
          const eslintContent = useTypeScript ? eslintTsConfig : eslintConfig;
          const eslintFile = path.join(projectDirectory, ".eslintrc.json");
          const eslintIgnoreFile = path.join(projectDirectory, ".eslintignore");
          fs.writeFileSync(eslintFile, JSON.stringify(eslintContent, null, 2));
          fs.writeFileSync(eslintIgnoreFile, eslintIgnoreConfig);
        }
        // stylelint
        if (useStylelint) {
          const stylelintFile = path.join(projectDirectory, ".stylelint.json");
          fs.writeFileSync(
            stylelintFile,
            JSON.stringify(stylelintConfig, null, 2)
          );
        }
        // vite 
        if(useVite) {
          const viteConfig = transformViteConfig(fs.readFileSync(viteFilePath, 'utf8'), useEslint, useStylelint);
          fs.writeFileSync(viteFilePath, viteConfig);
        }

        spinner.success({
          text: chalk.bold.green("All configured!"),
          mark: "✔",
        });

        console.log(
          chalk.bold.cyan('\n🔥 Reload your editor to activate the settings!')
        );
      }
    );
  } catch (error) {
    console.log(chalk.blue("\n👋 Goodbye!"));
    return;
  }
}

start().catch((e) => {
  console.error(e);
});
