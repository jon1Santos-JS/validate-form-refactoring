import Input from './Input';
import { useRouter } from 'next/router';
import useValidate from '@/hooks/useValidate';
import useInputHandler, { FIELDS_TO_OMIT } from '@/hooks/useInputHandler';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

const API = 'api/changePassword';

type InputsType = 'password' | 'newPassword' | 'confirmNewPassword';

export default function ChangePasswordForm() {
    const router = useRouter();
    const { user } = useUser();
    const { validateSingle, validateMany } = useValidate();
    const { omitFields, inputsFactory, inputStateFactory } = useInputHandler();
    const [isClickable, handleButtonClick] = useState(true);
    const [inputState, setInputState] = useState({
        password: inputStateFactory({
            onShowInputMessage: onShowInputMessage,
            onHighlightInput: onHighlightInput,
        }),
        newPassword: inputStateFactory({
            onShowInputMessage: onShowInputMessage,
            onHighlightInput: onHighlightInput,
        }),
        confirmNewPassword: inputStateFactory({
            onShowInputMessage: onShowInputMessage,
            onHighlightInput: onHighlightInput,
        }),
    });
    const [inputs, setInputs] = useState<InputsToValidateType<InputsType>>({
        password: inputsFactory({
            validations: (currentInputValue) => [
                {
                    coditional: !currentInputValue.match(/.{6,}/),
                    message: 'Incorrect Password',
                },
            ],
            required: true,
        }),
        newPassword: inputsFactory({
            validations: (currentInputValue, inputs) => [
                {
                    coditional: !currentInputValue.match(/.{6,}/),
                    message: 'Password must has 6 characters at least',
                },
                {
                    coditional: currentInputValue === inputs?.password.value,
                    message:
                        'This field have to be different than the password',
                    crossfield: 'password',
                },
                {
                    coditional:
                        currentInputValue !== inputs?.confirmNewPassword.value,
                    message:
                        'This field has to be equal to the confirm new password',
                    crossfield: 'confirmNewPassword',
                },
            ],
            required: true,
        }),
        confirmNewPassword: inputsFactory({
            validations: (currentInputValue, hookInputs) => [
                {
                    coditional:
                        currentInputValue !== hookInputs?.newPassword.value,
                    message: 'This field has to be equal to the new password',
                    crossfield: 'newPassword',
                },
            ],
            required: true,
        }),
    });

    return <>{renderContent()}</>;

    function renderContent() {
        if (
            user.username ===
            (process.env.NEXT_PUBLIC_ADMINS_USERNAME as string)
        )
            return null;

        return (
            <form className="o-change-password-form">
                <fieldset className="container">
                    <div className="legend">
                        <legend>Change Password</legend>
                    </div>
                    <div className="inputs">
                        <Input
                            ownProps={{
                                label: 'Password',
                                inputType: 'password',
                                onChange: (e) => onChange(e, 'password'),
                            }}
                            inputStateProps={{
                                input: inputs.password,
                                inputState: inputState.password,
                            }}
                        />
                        <Input
                            ownProps={{
                                label: 'New Password',
                                inputType: 'password',
                                onChange: (e) => onChange(e, 'newPassword'),
                            }}
                            inputStateProps={{
                                input: inputs.newPassword,
                                inputState: inputState.newPassword,
                            }}
                        />
                        <Input
                            ownProps={{
                                label: 'Confirm New Password',
                                inputType: 'password',
                                onChange: (e) =>
                                    onChange(e, 'confirmNewPassword'),
                            }}
                            inputStateProps={{
                                input: inputs.confirmNewPassword,
                                inputState: inputState.confirmNewPassword,
                            }}
                        />
                    </div>
                    <div>
                        <button
                            key={'submitButton'}
                            className="c-button"
                            onClick={onClick}
                        >
                            Submit
                        </button>
                    </div>
                </fieldset>
            </form>
        );
    }

    function onChange(e: React.ChangeEvent<HTMLInputElement>, key: InputsType) {
        setInputs((prev) => ({
            ...prev,
            [key]: { ...prev[key], value: e.target.value },
        }));
        setInputs((prev) => ({
            ...prev,
            [key]: validateSingle({ ...prev[key] }, prev),
        }));
    }

    function onShowInputMessage(value: boolean, key: InputsType) {
        setInputState((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                showInputMessage: value,
            },
        }));
    }

    function onHighlightInput(value: boolean, key: InputsType) {
        setInputState((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                highlightInput: value,
            },
        }));
    }

    async function onClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        if (!isClickable) return;
        if (validateMany(inputs)) {
            onHilightInputs(true);
            onShowInputsMessages(true);
            return;
        }
        handleButtonClick(true);
        await onSubmitInputs();
        handleButtonClick(false);
    }

    async function onSubmitInputs() {
        const handledBody = {
            username: { value: user.username },
            ...omitFields(inputs, FIELDS_TO_OMIT),
        };
        const options: FetchOptionsType = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(handledBody),
        };
        const response = await fetch(API, options);
        const parsedResponse: ServerResponse = await response.json();
        if (!parsedResponse.serverResponse) return;
        onHilightInputs(true);
        onShowInputsMessages(true);
        router.reload();
    }

    function onHilightInputs(value: boolean) {
        setInputState((prev) => ({
            ...prev,
            password: {
                ...prev.password,
                highlightInput: value,
            },
            newPassword: {
                ...prev.password,
                highlightInput: value,
            },
            confirmNewPassword: {
                ...prev.confirmNewPassword,
                highlightInput: value,
            },
        }));
    }

    function onShowInputsMessages(value: boolean) {
        setInputState((prev) => ({
            ...prev,
            password: {
                ...prev.password,
                showInputMessage: value,
            },
            newPassword: {
                ...prev.newPassword,
                showInputMessage: value,
            },
            confirmNewPassword: {
                ...prev.confirmNewPassword,
                showInputMessage: value,
            },
        }));
    }
}
