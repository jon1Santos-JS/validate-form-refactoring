import { useState } from 'react';
import Input from '../Input';
import { onOmitProps } from '@/lib/lodashAdapter';
import Link from 'next/link';
import useValidate from '@/hooks/useValidate';
import useInputHandler, { FIELDS_TO_OMIT } from '@/hooks/useInputHandler';
import { useUser } from '../../context/UserContext';

const API = 'api/signUp';
const INPUTS_TO_OMIT = ['confirmPassword'] as InputsType[];
const REQUIRED_MESSAGE = 'This field is required';

interface SignUpFormPropsType {
    ownProps: PropsType;
}

interface PropsType {
    setModalState: (data: boolean) => void;
}

type InputsType = 'confirmPassword' | 'password' | 'username';

export default function SignUpForm({ ownProps }: SignUpFormPropsType) {
    const { setModalState } = ownProps;
    const {
        userState: { hasUser },
    } = useUser();
    const { validateSingle, validateMany } = useValidate();
    const { omitFields, onSetTimeOut, inputsFactory, inputStateFactory } =
        useInputHandler();
    const [isClickable, handleButtonClick] = useState(true);
    const [inputState, setInputState] = useState({
        username: inputStateFactory({
            onShowInputMessage: onShowInputMessage,
            onHighlightInput: onHighlightInput,
        }),
        password: inputStateFactory({
            onShowInputMessage: onShowInputMessage,
            onHighlightInput: onHighlightInput,
        }),
        confirmPassword: inputStateFactory({
            onShowInputMessage: onShowInputMessage,
            onHighlightInput: onHighlightInput,
        }),
    });
    const [inputs, setInputs] = useState<InputsToValidateType<InputsType>>({
        username: inputsFactory({
            validations: (currentInputValue) => [
                {
                    coditional: !currentInputValue.match(/.{6,}/),
                    message: 'Username must has 6 characters at least',
                },
                {
                    coditional: !currentInputValue.match(/^[A-Za-zçÇ]+$/),
                    message: 'Only characters',
                },
            ],
            required: REQUIRED_MESSAGE,
        }),
        password: inputsFactory({
            validations: (currentInputValue, inputs) => [
                {
                    coditional: !currentInputValue.match(/.{6,}/),
                    message: 'Password must has 6 characters at least',
                },
                {
                    coditional:
                        currentInputValue !== inputs?.confirmPassword.value,
                    message:
                        'This field has to be equal to the confirm password',
                },
            ],
            required: REQUIRED_MESSAGE,
            crossfield: 'confirmPassword',
        }),
        confirmPassword: inputsFactory({
            validations: (currentInputValue, inputs) => [
                {
                    coditional: currentInputValue !== inputs?.password.value,
                    message: 'This field has to be equal to the password',
                },
            ],
            required: REQUIRED_MESSAGE,
            crossfield: 'password',
        }),
    });

    return (
        <form className="o-sign-up-form">
            <fieldset className="container">
                <div className="legend">
                    <legend>Sign up</legend>
                </div>
                <div className="inputs">
                    <Input
                        ownProps={{
                            label: 'Username',
                            inputType: 'text',
                            onChange: (e) => onChange(e, 'username'),
                        }}
                        inputStateProps={{
                            input: inputs.username,
                            inputState: inputState.username,
                        }}
                    />
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
                            label: 'Confirm Password',
                            inputType: 'password',
                            onChange: (e) => onChange(e, 'confirmPassword'),
                        }}
                        inputStateProps={{
                            input: inputs.confirmPassword,
                            inputState: inputState.confirmPassword,
                        }}
                    />
                </div>
                <div className="buttons">
                    <button
                        key={'submitButton'}
                        className="c-button"
                        onClick={onClick}
                    >
                        Submit
                    </button>
                    {!hasUser && (
                        <Link key={'signInButton'} href="/">
                            <button className="c-button">Sign In</button>
                        </Link>
                    )}
                </div>
            </fieldset>
        </form>
    );

    function onChange(e: React.ChangeEvent<HTMLInputElement>, key: InputsType) {
        setInputs((prev) => ({
            ...prev,
            [key]: { ...prev[key], value: e.target.value },
        }));
        onSetTimeOut(() => {
            setInputs((prev) => ({
                ...prev,
                [key]: validateSingle({ ...prev[key] }, prev),
            }));
        }, 950);
        setInputState((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                showInputMessage: true,
                highlightInput: true,
            },
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
        if (!validateMany(inputs)) {
            onHilightInputs(true);
            onShowInputsMessages(true);
            return;
        }
        handleButtonClick(false);
        await onSubmitInputs();
        handleButtonClick(true);
    }

    async function onSubmitInputs() {
        const handledInputs = omitFields(
            onOmitProps(inputs, INPUTS_TO_OMIT) as InputsToValidateType<
                keyof typeof inputs
            >,
            FIELDS_TO_OMIT,
        );
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(handledInputs),
        };
        const response = await fetch(API, options);
        const parsedResponse: ServerResponse = await response.json();
        if (!parsedResponse.serverResponse) {
            setModalState(true);
            return;
        }
        window.location.assign('/dashboard-page');
    }

    function onHilightInputs(value: boolean) {
        setInputState((prev) => ({
            ...prev,
            username: {
                ...prev.username,
                highlightInput: value,
            },
            password: {
                ...prev.password,
                highlightInput: value,
            },
            confirmPassword: {
                ...prev.confirmPassword,
                highlightInput: value,
            },
        }));
    }

    function onShowInputsMessages(value: boolean) {
        setInputState((prev) => ({
            ...prev,
            username: {
                ...prev.username,
                showInputMessage: value,
            },
            password: {
                ...prev.password,
                showInputMessage: value,
            },
            confirmPassword: {
                ...prev.confirmPassword,
                showInputMessage: value,
            },
        }));
    }
}
