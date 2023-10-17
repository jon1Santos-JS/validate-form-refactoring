import { useState } from 'react';
import Input from '../Input';
import useValidate from '@/hooks/useValidate';
import useString from '@/hooks/useString';
import useInputHandler from '@/hooks/useInputHandler';

const API = 'api/changeUserImg';
const ALLOWED_EXTENSIONS = ['.jpg', '.png', '.jpeg'];

type PerfilImageFormProps = {
    handleUserProps: HandleUserPropsType;
};

type InputsType = 'imageInput';

export default function PerfilImageForm({
    handleUserProps,
}: PerfilImageFormProps) {
    const { user } = handleUserProps;
    const { uniqueValidation, manyValidation } = useValidate();
    const { onHighlightManyInputs } = useInputHandler();
    const { handledName, onCheckExtensions } = useString();
    const [showMessage, onShowMessage] = useState<boolean>(false);
    const [isButtonClickable, setClickableButton] = useState(true);
    const [inputState, setInputState] = useState({
        imageInput: {
            showInputMessage: false,
            highlightInput: false,
            onShowInputMessage: (value: boolean) =>
                setInputState((prev) => ({
                    ...prev,
                    imageInput: { ...prev.imageInput, showInputMessage: value },
                })),
            onHighlightInput: (value: boolean) =>
                setInputState((prev) => ({
                    ...prev,
                    imageInput: { ...prev.imageInput, highlightInput: value },
                })),
        },
    });
    const [inputs, setInputs] = useState<InputsToValidateType<InputsType>>({
        imageInput: {
            validations: (currentInputValue: string) => [
                {
                    coditional: !onCheckExtensions(
                        ALLOWED_EXTENSIONS,
                        currentInputValue,
                    ),
                    message: `Allowed extensions: ${ALLOWED_EXTENSIONS.join(
                        ', ',
                    )}`,
                },
            ],
            required: true,
            value: '',
            errors: [],
            files: null,
        },
    });

    return (
        <>
            <h4>Upload image</h4>

            <form className="o-perfil-image-form">
                <fieldset className="container">
                    <div className="inputs">
                        <Input
                            ownProps={{
                                label: 'image',
                                inputType: 'file',
                                inputAccept: 'image/*',
                                onChange: (e) => onChange(e, 'imageInput'),
                            }}
                            inputStateProps={{
                                input: inputs.imageInput,
                                inputState: inputState.imageInput,
                            }}
                            formProps={{
                                hasError: false,
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
        </>
    );

    function onChange(
        e: React.ChangeEvent<HTMLInputElement>,
        key: keyof typeof inputs,
    ) {
        setInputs((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                value: e.target.value,
                files: e.target.files,
            },
        }));
        setInputs((prev) => ({
            ...prev,
            [key]: uniqueValidation({ ...prev[key] }),
        }));
    }

    async function onClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        if (showMessage) return; // WAITING THE MESSAGE GOES DOWN TO REQUEST
        if (manyValidation(inputs)) {
            if (!isButtonClickable) return;
            await onSubmitInputs();
            setClickableButton(false);
        }
        onHighlightManyInputs(inputState, true, 2);
        onShowMessage(true);
        setClickableButton(true);
    }

    async function onSubmitInputs() {
        if (!inputs.imageInput.files) return;
        const file = inputs.imageInput.files[0];
        const fileName = handledName(file.name);
        const formData = new FormData(); // multipart/form-data format to send to API;
        formData.append('image', file, fileName);
        const fetchOptions: FetchOptionsType = {
            method: 'POST',
            body: formData,
        };
        // IMAGE THIRTY PARTY API
        const imgApiResponse = await fetch(
            process.env.NEXT_PUBLIC_IMGBB_API_LINK as string,
            fetchOptions,
        );
        if (!imgApiResponse.ok) return;
        const image = await imgApiResponse.json();
        // IMAGE LOCAL API
        await onUpdateUserImageDB(image.data.url);
        inputState.imageInput.onShowInputMessage(true);
        onShowMessage(false);
        window.location.reload();
    }

    async function onUpdateUserImageDB(img: string) {
        const handledUser = {
            userName: user.username,
            userImg: img,
        };
        const options: FetchOptionsType = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(handledUser),
        };
        await fetch(API, options);
    }
}
