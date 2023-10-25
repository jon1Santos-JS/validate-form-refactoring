import React from 'react';

type InputPropsTypes<T extends string> = {
    ownProps: PropsType;
    inputStateProps: inputStatePropsType<T>;
};

type inputStatePropsType<T extends string> = {
    input: ValidateInputType<T>;
    inputState: InputState<T>;
};

type PropsType = {
    label?: string;
    inputType: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputAccept?: string;
};

export default function Input<T extends string>({
    ownProps,
    inputStateProps,
}: InputPropsTypes<T>) {
    const { label, inputType, onChange, inputAccept } = ownProps;
    const { input, inputState } = inputStateProps;
    const { value, errors } = input;
    const { showInputMessage, highlightInput } = inputState;
    const highlightConditional = errors.length > 0;

    return (
        <div className="field">
            {label ? (
                <label htmlFor={label} className="label">
                    {label}
                </label>
            ) : null}
            <input
                id={label}
                className={`input ${
                    highlightConditional && highlightInput && 'has-error'
                }`}
                placeholder={label}
                accept={inputAccept && inputAccept}
                onChange={onChange}
                value={value}
                type={inputType}
            />
            {renderErrors()}
        </div>
    );

    function renderErrors() {
        return (
            <div className="input-error-message">
                {errors.length > 0 && showInputMessage && errors[0]}
            </div>
        );
    }
}
