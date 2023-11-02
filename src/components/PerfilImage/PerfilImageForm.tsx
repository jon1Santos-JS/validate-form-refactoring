import { useState } from 'react';
import Input from '../Input';
import useValidate from '@/hooks/useValidate';
import useString from '@/hooks/useString';
import { useUser } from '../../context/UserContext';
import useInputHandler from '@/hooks/useInputHandler';

const API = 'api/changeUserImg';
const ALLOWED_EXTENSIONS = ['.jpg', '.png', '.jpeg'];

type InputsType = 'imageInput';

export default function PerfilImageForm() {
    const {
        user: { username, setUserimage },
        setUserImageLoader,
    } = useUser();
    const { validateSingle, validateMany } = useValidate();
    const { handledName, onCheckExtensions } = useString();
    const { inputsFactory } = useInputHandler();
    const [isClickable, handleButtonClick] = useState(true);
    const [inputState, setInputState] = useState({
        imageInput: { showInputMessage: false, highlightInput: false },
    });

    const [inputs, setInputs] = useState<InputsToValidateType<InputsType>>({
        imageInput: inputsFactory({
            validations: (currentInputValue: string) => [
                {
                    conditional: !onCheckExtensions(
                        ALLOWED_EXTENSIONS,
                        currentInputValue,
                    ),
                    message: `Supported extensions: ${ALLOWED_EXTENSIONS.join(
                        ', ',
                    )}`,
                },
            ],
            required: 'No image uploaded',
            files: null,
        }),
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

    async function onChange(
        e: React.ChangeEvent<HTMLInputElement>,
        key: InputsType,
    ) {
        const input = { ...inputs[key], value: e.target.value };
        const currentInputs = { ...inputs, [key]: input };
        const validateInput = validateSingle(input, currentInputs);
        setInputs((prev) => ({
            ...prev,
            [key]: {
                ...validateInput,
                files: e.target.files,
            },
        }));
    }

    async function onClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        if (!isClickable) return;
        if (!validateMany(inputs)) {
            setInputState((prev) => ({
                ...prev,
                imageInput: { ...prev.imageInput, showInputMessage: true },
            }));
            return;
        }
        setUserImageLoader(true);
        handleButtonClick(false);
        const APIResponse = await onSubmitImageToAPI(inputs.imageInput.files);
        await onHandleAPIResponse(APIResponse);
        handleButtonClick(true);
    }

    async function onSubmitImageToAPI(files: FileList | undefined | null) {
        if (!files) return;
        const file = files[0];
        const fileName = handledName(file.name);
        const formData = new FormData(); // multipart/form-data format to send to API;
        formData.append('image', file, fileName);
        const fetchOptions: FetchOptionsType = {
            method: 'POST',
            body: formData,
        };
        const response = await fetch(
            process.env.NEXT_PUBLIC_IMGBB_API_LINK as string,
            fetchOptions,
        );
        const parsedResponse: ImgBBResponse = await response.json();
        return parsedResponse;
    }

    async function onHandleAPIResponse(response: ImgBBResponse | undefined) {
        if (!response || !response.success) {
            setInputState((prev) => ({
                ...prev,
                imageInput: { ...prev.imageInput, showInputMessage: true },
            }));
            return;
        }
        const DBResponse = await onSubmitImageToDB(username, response);
        onHandleDBResponse(DBResponse);
    }

    async function onSubmitImageToDB(name: string, APIResponse: ImgBBResponse) {
        const handledUser = {
            userName: name,
            userImg: APIResponse.data.url,
        };
        const options: FetchOptionsType = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(handledUser),
        };
        const response = await fetch(API, options);
        const parsedResponse: ImageUpdateServerResponse = await response.json();
        return parsedResponse;
    }

    function onHandleDBResponse(
        response: ImageUpdateServerResponse | undefined,
    ) {
        if (!response || !response.success) {
            setInputState((prev) => ({
                ...prev,
                imageInput: { ...prev.imageInput, showInputMessage: true },
            }));
            return;
        }
        setUserimage(response.data.userImg);
        setInputs((prev) => ({
            ...prev,
            imageInput: { ...prev.imageInput, files: null, value: '' },
        }));
    }
}
