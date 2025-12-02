import React from 'react';

type InputFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  error?: string;
  rightSlot?: React.ReactNode;
};

export function InputField({
  id,
  label,
  error,
  rightSlot,
  ...inputProps
}: InputFieldProps): React.ReactElement {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input id={id} aria-invalid={Boolean(error)} {...inputProps} />
        {rightSlot}
      </div>
      <div className={`error ${error ? 'show' : ''}`} role={error ? 'alert' : undefined}>
        {error ?? ''}
      </div>
    </div>
  );
}

type PasswordFieldProps = Omit<InputFieldProps, 'type' | 'rightSlot'> & {
  toggleVisibility?: boolean;
};

export function PasswordField({
  toggleVisibility = false,
  ...props
}: PasswordFieldProps): React.ReactElement {
  const [show, setShow] = React.useState<boolean>(false);

  return (
    <InputField
      {...props}
      type={toggleVisibility && show ? 'text' : 'password'}
      rightSlot={toggleVisibility ? (
        <button
          type="button"
          className="toggle-pass"
          aria-label="Toggle password visibility"
          onClick={() => setShow((value) => !value)}
        >
          👁
        </button>
      ) : undefined}
    />
  );
}
