import "dotenv/config";
import chalk from "chalk";

import Action from "./action.js";

const command = process.argv[2];
const commands = ["list", "add", "delete", "delete-all", "edit", "export", "import", "download"];

const warn = chalk.yellowBright.bold;
const error = chalk.redBright.bold;

if (command) {
    if (command == "list") {
        Action.list();
    } else if (command == "add") {
        Action.add();
    } else if (command == "delete") {
        Action.delete();
    } else if (command == "delete-all") {
        Action.deleteAll();
    } else if (command == "edit") {
        Action.edit();
    } else if (command == "export") {
        Action.export();
    } else if (command == "import") {
        Action.import();
    } else if (command == "download") {
        Action.download();
    } else {
        const message = `${warn("Unknown command.")}
Available commands are:
${warn(commands.join("\n"))}`;
        console.log(message);
    }
} else {
    const message = `${warn("You must enter a command.")}
Available commands are:
${warn(commands.join("\n"))}`;
    console.log(message);
}
