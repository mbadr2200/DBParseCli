#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import { execa } from "execa";
import listr from "listr";
import { projectInstall } from "pkg-install";

const access = promisify(fs.access);
const copy = promisify(ncp);

async function initGit(options) {
  const result = await execa("git", ["init"], {
    cwd: path.resolve(new URL(options.targetDirectory).pathname, "./parse"),
  });
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git 🤦‍♂️"));
  }
  return;
}

async function copyTemplateFiles(options) {
  const configs = `
    APP_ID:${options.app_id},
    PUBLIC_SERVER_URL:${options.publicServerUrl},
    PORT:${options.portNumber},
    MASTER_KEY:${options.masterKey},
    SERVER_URL:${options.serverUrl},
    CLIENT_KEY:${options.clientKey},
    JAVASCRIPT_KEY:${options.JavascriptKey},
    FILE_KEY:${options.fileKey},
    `;

  await copy(options.templateDirectory, options.targetDirectory, {
    clobber: false,
  });
  // console.log( path.resolve(new URL(options.targetDirectory).pathname, "./parse/.env") , "env file 💯");
  fs.writeFile(
    path.resolve(new URL(options.targetDirectory).pathname, "./parse/.env"),
    configs,
    () => {}
  );
  return;
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: process.cwd(), //TODO: add select target directory
  };
  const currentFileUrl = import.meta.url;
  const pathname = new URL(currentFileUrl).pathname.slice(0, 1);
  console.log(pathname);
  const templateDirectory = path.resolve(
    new URL(currentFileUrl).pathname.substring(1),
    "../template"
  );
  options.templateDirectory = templateDirectory;

  try {
    await access(templateDirectory, fs.constants.R_OK);
  } catch (error) {
    console.error("%s 👎 Invalid Template", chalk.red.bold("ERROR"));
    process.exit(1);
  }

  // const spinner = createSpinner("Making Project File").start();

  const tasks = new listr([
    {
      title: "Make Project Files",
      task: () => copyTemplateFiles(options),
    },
    {
      title: "Init Git",
      task: () => initGit(options),
    },
    {
      title: "Install Dependencies",
      task: () =>
        projectInstall({
          cwd: path.resolve(
            new URL(options.targetDirectory).pathname,
            "./parse"
          ),
        }),
      skip: () => options.installDeps.includes("No"),
    },
  ]);

  await tasks.run();
  // spinner.stop();

  console.log(
    ` ✔️  %s Project ${options.app_id} is Ready`,
    chalk.green.bold("DONE")
  );
  return true;
}

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
  figlet("DB Parse server script", (err, data) => {
    console.log(gradient.summer.multiline(data));
  });
  
  await sleep(500);

}

await welcome();

let questions = [
  {
    name: "app_id",
    type: "input",
    message: "Enter The app id (Must be more than 5 characters) 📛 >>>",
    default() {
      return "New Parse Project";
    },
    validate(input) {
      return input.length > 5;
    },
  },
  {
    type: "input",
    message: "Enter Your Public server url 🔗 >>>",
    name: "publicServerUrl",
    validate(input) {
      return input.length > 1;
    },
  },
  {
    type: "input",
    message: "Enter Your  server url 🔗 >>>",
    name: "serverUrl",
    validate(input) {
      return input.length > 1;
    },
  },
  {
    type: "input",
    message: "Enter Your Master Key (Must be complex) 🔑 >>>",
    name: "masterKey",
    validate(input) {
      return input.length > 5;
    },
  },
  {
    type: "input",
    message: "Enter Your Client Key 🔑 >>>",
    name: "clientKey",
    validate(input) {
      return input.length > 1;
    },
  },
  {
    type: "input",
    message: "Enter Your Javascript Key 🔑 >>>",
    name: "JavascriptKey",
    validate(input) {
      return input.length > 1;
    },
  },
  {
    type: "input",
    message: "Enter Your File Key 📁🔑 >>>",
    name: "fileKey",
    validate(input) {
      return input.length > 1;
    },
  },
  {
    type: "input",
    message: "Enter Your Port Number 🇵🇹 >>>",
    name: "portNumber",
    validate(input) {
      return input.length > 1;
    },
  },
  {
    type: "list",
    message: "Install Dependance for you 😃 ? (May Take some time)",
    name: "installDeps",
    choices: ["Yes Please 👍", "No 👎"],
    validate(input) {
      return input.length > 1;
    },
  },
];

async function getParseData() {
  const answers = await inquirer.prompt(questions);
  createProject(answers);
}

await getParseData();

const makeSpinner = async (action) => {
  const spinner = createSpinner(action).start();
  await sleep();
};
