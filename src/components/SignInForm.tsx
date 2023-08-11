import InputsHandlerContext from '@/context/InputsHandlerContext';
import Form from './Form';
import Input from './Input';
import InputsHandler from './InputsHandler';
import { useContext } from 'react';

type SignInFormProps = HandlerUserStateProps;

const SIGN_IN_ERROR_RESPONSE = 'Incorrect username or password';

export default function SignInForm({
    setUser,
    setHasUser,
    setUserStateLoading,
}: SignInFormProps) {
    const { onChangeInput } = useContext(InputsHandlerContext);

    return (
        <div className="o-sign-in-form">
            <div className="c-container">
                <InputsHandler preInputs={preInputs}>
                    <Form
                        legend="SignIn"
                        onSubmitInputs={onSubmitInputs}
                        formDefaultError={SIGN_IN_ERROR_RESPONSE}
                        formSubmitError={SIGN_IN_ERROR_RESPONSE}
                    >
                        <Input
                            label="Username"
                            inputType="text"
                            objectifiedName="username"
                            onChange={onchangeUsername}
                        />
                        <Input
                            label="Password"
                            inputType="password"
                            objectifiedName="password"
                            onChange={onchangePassword}
                        />
                    </Form>
                </InputsHandler>
            </div>
        </div>
    );

    function onchangeUsername(e: React.ChangeEvent<HTMLInputElement>) {
        onChangeInput({
            objectifiedName: 'username',
            targetProp: 'value',
            value: e.target.value,
        });
    }

    function onchangePassword(e: React.ChangeEvent<HTMLInputElement>) {
        onChangeInput({
            objectifiedName: 'password',
            targetProp: 'value',
            value: e.target.value,
        });
    }

    async function onSubmitInputs(inputs: HandledInputs<typeof preInputs>) {
        const action = process.env.NEXT_PUBLIC_SIGN_IN_LINK as string;
        const options: FetchOptionsType = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputs),
        };
        const response = await fetch(action, options);
        const parsedResponse: ServerResponse = await response.json();
        setUserStateLoading(false);
        setHasUser(parsedResponse.serverResponse);
        if (!parsedResponse.serverResponse) {
            return SIGN_IN_ERROR_RESPONSE;
        }
        window.location.assign('/dashboard-page');
        setUser({ username: parsedResponse.body as string });
    }
}

const preInputs = {
    username: {
        validations: (currentInputValue: string) => [
            {
                coditional: !currentInputValue.match(/.{6,}/),
            },
            {
                coditional: !currentInputValue.match(/^[A-Za-z]+$/),
            },
        ],
        required: true,
    },
    password: {
        validations: (currentInputValue: string) => [
            {
                coditional: !currentInputValue.match(/.{6,}/),
            },
        ],
        required: true,
    },
};
