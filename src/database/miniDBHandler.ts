import { readFileSync, writeFileSync } from 'fs';
import { DataBase, INITIAL_STATE, MINI_DB_FILE_PATH_NAME } from './miniDB';

export class MiniDBHandler {
    async init() {
        const response = await this.#accessDB();
        if (!response) return;
        if (!this.#checkDBState()) return;
        return response;
    }

    async handleDB(comand: HandleDBComandType, caller?: string) {
        if (comand === 'reset') return this.#resetDB();
        if (comand === 'getDB') return this.#returnDB();
        if (comand === 'refresh') return this.#createAndRefreshDB(caller);
        if (comand === 'getUsers') return this.#getUsers();
    }

    async #getUsers() {
        const response = await this.#accessDB();
        if (!response) return;
        const stringifiedAccounts = JSON.stringify(DataBase.state.accounts);
        return stringifiedAccounts;
    }

    async #accessDB() {
        try {
            const data = await readFileSync(MINI_DB_FILE_PATH_NAME, 'utf8');
            DataBase.state = JSON.parse(data);
            console.log('DB has been accessed');
            return 'DB has been accessed';
        } catch {
            DataBase.state = INITIAL_STATE;
            return await this.#createAndRefreshDB('MiniDBHandler - accessDB');
        }
    }

    async #returnDB() {
        const response = await this.#accessDB();
        if (!response) return;
        return JSON.stringify(DataBase.state, undefined, 2);
    }

    async #resetDB() {
        DataBase.state = INITIAL_STATE;
        const json = JSON.stringify(DataBase.state, undefined, 2);
        try {
            await writeFileSync(MINI_DB_FILE_PATH_NAME, json);
            console.log('The DataBase has been reset');
            return 'The DataBase has been reset';
        } catch {
            console.log('DB file was not found');
            return;
        }
    }

    async #createAndRefreshDB(caller?: string) {
        const json = JSON.stringify(DataBase.state, undefined, 2);
        try {
            await writeFileSync(MINI_DB_FILE_PATH_NAME, json);
            console.log('DB has been created or refreshed');
            return 'DB has been created or refreshed';
        } catch {
            console.log(
                'failed to create or refresh file by: ',
                caller && caller,
            );
            return;
        }
    }

    #checkDBState() {
        if (DataBase.state.accounts.length > DataBase.state.limit) {
            console.log('database limit account reached');
            return;
        }
        return 'DB state is ok';
    }
}
