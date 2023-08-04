import { miniDBAccountHandler } from '@/database/accountHandler';
import { miniDBHandler } from '@/database/miniDBHandler';
import { SERVER_ERROR_RESPONSE } from '@/database/miniDB';

export async function getUserStateController() {
    const response = await miniDBHandler.handleDB('getUsers');
    if (typeof response === 'string') {
        console.log('controller error to get users: ', response);
        return { serverResponse: false, body: SERVER_ERROR_RESPONSE };
    }
    return { serverResponse: true, body: response as UserFromDataBaseType[] };
}

export async function signInController(userAccount: UserFromClientType) {
    const response = await miniDBAccountHandler.signIn(userAccount);
    if (typeof response === 'string') {
        console.log('controller error to sign in user: ', response);
        return { serverResponse: false, body: SERVER_ERROR_RESPONSE };
    }
    return { serverResponse: true, body: userAccount.username.value };
}

export async function signUpController(userAccount: UserFromClientType) {
    const response = await miniDBAccountHandler.signUp(userAccount);
    if (typeof response === 'string') {
        console.log('controller error to sign up user: ', response);
        return { serverResponse: false, body: SERVER_ERROR_RESPONSE };
    }
    return { serverResponse: true, body: 'Account has been created' };
}

export async function changePasswordController(
    userAccount: ChangePasswordFromClientType,
) {
    const response = await miniDBAccountHandler.updatePassword(userAccount);
    if (typeof response === 'string') {
        console.log('controller error to change user password: ', response);
        return { serverResponse: false, body: SERVER_ERROR_RESPONSE };
    }
    return { serverResponse: true, body: 'Account has been changed' };
}

export async function changeUsernameController(
    user: ChangeUsernameFromClientType,
) {
    const response = await miniDBAccountHandler.updateUsername(user);
    if (typeof response === 'string') {
        console.log('controller error to change username: ', response);
        return { serverResponse: false, body: 'This username is already used' };
    }
    return { serverResponse: true, body: response };
}

export async function changeUserImg(user: UserWithImgType) {
    const response = await miniDBAccountHandler.updateUserImage(user);
    if (typeof response === 'string') {
        console.log('controller error to change user image: ', response);
        return {
            serverResponse: false,
            body: 'Error when try to update the image',
        };
    }
    return { serverResponse: true, body: 'User image has been updated' };
}
