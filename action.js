import fs from "fs";

import { parse, stringify } from "csv/sync";
import inquirer from "inquirer";
import axios from "axios";
import chalk from "chalk";

import DB from "./db.js";
import Task from "./task.js";

const warn = chalk.yellowBright.bold;
const error = chalk.redBright.bold;
const success = chalk.greenBright.bold;

export default class Action {
    static list() {
        const tasks = DB.getAllTasks();
        if (tasks.length) {
            console.table(tasks);
        } else {
            console.log(warn("There is not any task."));
        }
    }

    static async add() {
        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "tile",
                message: "Enter task title:",
                validate: (value) => {
                    if (value.length < 3) {
                        return "The title must contains at least 3 letters.";
                    }
                    return true;
                },
            },
            {
                type: "confirm",
                name: "completed",
                message: "Is this task completed: ",
                default: false,
            },
        ]);

        try {
            const task = new Task(answers.tile, answers.completed);
            task.save();
            console.log(success("New task added successfully."));
        } catch (e) {
            console.log(error(e.message));
        }
    }

    static async delete() {
        let tasks = DB.getAllTasks();
        const choices = tasks.map((task) => task.title);

        const answers = await inquirer.prompt({
            type: "list",
            name: "title",
            message: "Select a task to delete:",
            choices,
        });

        const task = Task.getTaskByTitle(answers.title);

        try {
            DB.deleteTask(task.id);
            console.log(success("Task deleted successfully."));
        } catch (e) {
            console.log(error(e.message));
        }
    }

    static async deleteAll() {
        const answer = await inquirer.prompt({
            type: "confirm",
            name: "result",
            message: "Are you shure for delete all tasks ? ",
            default: false,
        });

        if (answer.result) {
            try {
                DB.resetDB();
                console.log(success("All tasks deleted successfully."));
            } catch (error) {
                console.log(error(e.message));
            }
        }
    }

    static async edit() {
        let tasks = DB.getAllTasks();
        const choices = tasks.map((task) => task.title);

        const answer = await inquirer.prompt([
            {
                type: "list",
                name: "title",
                message: "Select a task to edit:",
                choices,
            },
        ]);

        const task = Task.getTaskByTitle(answer.title);
        if (task) {
            const answers = await inquirer.prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Enter task title:",
                    default: task.title,
                    validate: (value) => {
                        if (value.length < 3) {
                            return "The title must contains at least 3 letters.";
                        }
                        return true;
                    },
                },
                {
                    type: "confirm",
                    name: "completed",
                    message: "Is this task completed ? ",
                    default: task.completed,
                },
            ]);

            console.log(answers);
            try {
                DB.savaTask(answers.title, answers.completed, task.id);
                console.log(success("Task edited successfully."));
            } catch (e) {
                console.log(error(e.message));
            }
        } else {
            console.log(warn("Task not found."));
        }
    }

    static async export() {
        const answer = await inquirer.prompt({
            type: "input",
            name: "fileName",
            message: "Enter output file name:",
            validate: (value) => {
                if (!/^[\w .-]{1,50}$/.test(value)) {
                    return "Please enter a valid file name.";
                }
                return true;
            },
        });

        const tasks = DB.getAllTasks();
        const output = stringify(tasks, {
            header: true,
            cast: {
                boolean: (value, context) => {
                    return String(value);
                },
            },
        });

        console.log(output);

        try {
            fs.writeFileSync(answer.fileName, output);
            console.log(success("Tasks exported successfully."));
        } catch (e) {
            console.log(error("Can not write to " + answer.fileName));
        }
    }

    static async import() {
        const answer = await inquirer.prompt({
            type: "input",
            name: "fileName",
            message: "Enter input file name:",
        });

        if (fs.existsSync(answer.fileName)) {
            try {
                const input = fs.readFileSync(answer.fileName, "utf-8");
                const data = parse(input, {
                    columns: true,
                    cast: (value, context) => {
                        if (context.column === "id") {
                            return Number(value);
                        } else if (context.column === "completed") {
                            return value.toLowerCase() === "true" ? true : false;
                        }
                        return value;
                    },
                });

                DB.insertBulkData(data);
                console.log(success("Tasks imported successfully."));
            } catch (e) {
                console.log(error(e.message));
            }
        } else {
            console.log(error(`File ${answer.fileName} not found.`));
        }
    }

    static download() {}
}
