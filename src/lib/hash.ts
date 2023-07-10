import { compareSync, genSaltSync, hashSync } from 'bcrypt-ts';

export const HASH_DEFAULT_ERROR = 'invalid hash';

export function createHash<T>(value: T) {
    const salt = genSaltSync(10);
    const stringifiedValue = JSON.stringify(value);
    const hash = hashSync(stringifiedValue, salt);
    return hash;
}

export async function returnUserByHash(browserHash: string, users: unknown) {
    const validation = {
        isValid: false,
        user: {},
        message: HASH_DEFAULT_ERROR,
    };
    validation.message = 'User was not found';
    const usersList = users as UserFromClientType[];
    if (usersList.length > 1) {
        usersList.forEach((user) => {
            const stringifiedUser = JSON.stringify(user);
            if (compareSync(stringifiedUser, browserHash)) {
                validation.user = user.username.value;
                validation.isValid = true;
            }
        });
        return validation;
    }

    const admin = users as UserFromClientType;
    if (compareSync(JSON.stringify(admin), browserHash)) {
        validation.user = admin.username.value;
        validation.isValid = true;
    }
    return validation;
}
