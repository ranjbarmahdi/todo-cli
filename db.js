import fs from 'fs';
import chalk from 'chalk';

const fileName = process.env.DB_FILE;
const warn = chalk.yellowBright.bold;
const success = chalk.greenBright.bold;

export default class DB {
    static createDB() {
        if (fs.existsSync(fileName)) {
            console.log(warn('DB file already exists.'));
            return false;
        }
        try {
            fs.writeFileSync(fileName, '[]', 'utf-8');
            console.log(success('DB created successfully.'));
            return true;
        } catch (error) {
            throw new Error('Can not write in ' + fileName);
        }
    }

    static resetDB() {
        try {
            fs.writeFileSync(fileName, '[]', 'utf-8');
            console.log(success('DB file rest to empty.'));
            return true;
        } catch (error) {
            throw new Error('Can not write in ' + fileName);
        }
    }

    static existsDB() {
        if (fs.existsSync(fileName)) return true;
        return false;
    }

    static getTaskById(id) {
        let data;
        if (this.existsDB()) {
            data = fs.readFileSync(fileName);
        } else {
            this.createDB();
            return false;
        }

        try {
            data = JSON.parse(data);
            const task = data.find((task) => task.id === Number(id));
            return task ? task : false;
        } catch (error) {
            throw new Error('Syntax error.\nPlease check the db file.');
        }
    }

    static getTaskByTitle(title) {
        let data;
        if (this.existsDB()) {
            data = fs.readFileSync(fileName);
        } else {
            this.createDB();
            return false;
        }

        try {
            data = JSON.parse(data);
            const task = data.find((task) => task.title === title);
            return task ? task : false;
        } catch (error) {
            throw new Error('Syntax error.\nPlease check the db file.');
        }
    }

    static getAllTasks() {
        let data;
        if (this.existsDB()) {
            data = fs.readFileSync(fileName);
        } else {
            this.createDB();
            return false;
        }

        try {
            data = JSON.parse(data);
            return data ? data : false;
        } catch (error) {
            throw new Error('Syntax error.\nPlease check the db file.');
        }
    }

    static savaTask(title, completed = false, id = 0) {
        id = Number(id);
        if (id < 0 || id !== parseInt(id)) {
            throw new Error('id must be an integer, equal or greater then zero.');
        } else if (typeof title != 'string' || title.length < 3) {
            throw new Error('title must contain at least 3 letters.');
        }

        const task = this.getTaskByTitle(title);
        if (task && task.id != id) {
            throw new Error('a task exists with this title.');
        }

        let data;
        if (this.existsDB()) {
            data = fs.readFileSync(fileName, 'utf-8');
        } else {
            try {
                this.createDB();
                data = [];
            } catch (error) {
                throw new Error(error.message);
            }
        }

        try {
            data = JSON.parse(data);
        } catch (error) {
            throw new Error('Syntax error.\nPlease check the db file.');
        }

        if (id === 0) {
            if (data.length === 0) {
                id = 1;
            } else {
                id = data[data.length - 1].id + 1;
            }
            data.push({ id, title, completed });

            const str = JSON.stringify(data, null, 4);
            try {
                fs.writeFileSync(fileName, str, 'utf-8');
                return id;
            } catch (error) {
                throw new Error('Can not save the task.');
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    data[i].title = title;
                    data[i].completed = completed;
                    const str = JSON.stringify(data, null, 4);
                    try {
                        fs.writeFileSync(fileName, str, 'utf-8');
                        return id;
                    } catch (error) {
                        throw new Error('Can not save the task.');
                    }
                }
            }
            throw new Error('Task not found');
        }
    }

    static insertBulkData(data) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (error) {
                throw new Error('Invalid data.');
            }
        }

        if (data instanceof Array) {
            data = JSON.stringify(data, null, 4);
        } else {
            throw new Error('Invalid data.');
        }

        try {
            fs.writeFileSync(fileName, data);
        } catch (error) {
            throw new Error('Can not write to db');
        }
    }

    static deleteTask(id) {
        id = Number(id);
        if (id > 0 || id === parseInt(id)) {
            let data;
            try {
                data = fs.readFileSync(fileName, 'utf-8');
                data = JSON.parse(data);
            } catch (error) {
                throw new Error('Can not read db file.');
            }

            const taskIndex = data.findIndex((task) => task.id == id);
            if (taskIndex != -1) {
                data.splice(taskIndex, 1);
                data = JSON.stringify(data, null, 4);

                try {
                    fs.writeFileSync(fileName, data, 'utf-8');
                    return true;
                } catch (error) {
                    throw new Error('Can not write in DB file.');
                }
            } else {
                throw new Error('Can not find task.');
            }
        }
    }
}
