import Form from './Form';
import Input from './Input';
import { useRouter } from 'next/router';

type OwnPropsType<T> = {
    ownProps: ChangeUsernameFormPropsTypes<T>;
};

type ChangeUsernameFormPropsTypes<T> = {
    handleInputsProps: T;
    handleUserProps: HandleUserPropsType;
};

type ChangeUsernameFormInputs = 'newUsername';

export default function ChangeUsernameForm<T>({
    ownProps: { handleUserProps, handleInputsProps },
}: OwnPropsType<T>) {
    const router = useRouter();
    const { user, setUser } = handleUserProps;
    const { onChangeInput, handledInputs } = handleInputsProps;

    return <>{renderContent()}</>;

    function renderContent() {
        if (
            user.username ===
            (process.env.NEXT_PUBLIC_ADMINS_USERNAME as string)
        )
            return null;

        return (
            <Form
                ownProps={{
                    legend: 'Change Username',
                    onSubmitInputs: onSubmitInputs,
                }}
                handleInputsProps={handleInputsProps}
            >
                <Input
                    ownProps={{
                        label: 'New Username',
                        inputType: 'text',
                        objectifiedName: 'newUsername',
                        onChange: (e) => onChange(e, 'newUsername'),
                    }}
                    handleInputsProps={handleInputsProps}
                />
            </Form>
        );
    }

    function onChange(
        e: React.ChangeEvent<HTMLInputElement>,
        name: ChangeUsernameFormInputs,
    ) {
        onChangeInput({
            objectifiedName: name,
            targetProp: 'value',
            value: e.target.value,
        });
    }

    async function onSubmitInputs() {
        const action = process.env.NEXT_PUBLIC_CHANGE_USERNAME_LINK as string;
        const handledBody = {
            username: { value: user.username },
            ...handledInputs,
        };
        const options: FetchOptionsType = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(handledBody),
        };
        const response = await fetch(action, options);
        const parsedResponse: ServerResponse = await response.json();
        if (!parsedResponse.serverResponse) {
            return parsedResponse.body as string;
        }
        router.reload();
        window.addEventListener('load', () => {
            setUser({ username: parsedResponse.body as string });
        });
    }
}

export const CHANGE_USERNAME_FORM_INPUTS_STATE: PreFormInputsType<ChangeUsernameFormInputs> =
    {
        newUsername: {
            validations: (currentInputValue) => [
                {
                    coditional: !currentInputValue.match(/.{6,}/),
                    message: 'Incorrect username',
                },
                {
                    coditional: !currentInputValue.match(/^[A-Za-zçÇ]+$/),
                    message: 'Incorrect username',
                },
            ],
            required: 'Incorrect username',
        },
    };
