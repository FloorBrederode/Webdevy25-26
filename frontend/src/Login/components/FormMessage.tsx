import React from 'react';

type FormMessageProps = {
  message?: React.ReactNode;
  tone?: 'error' | 'success';
  id?: string;
};

export function FormMessage({
  message,
  tone = 'error',
  id
}: FormMessageProps): React.ReactElement | null {
  if (!message) return null;

  const className = tone === 'error' ? 'error show' : 'success';
  const role = tone === 'error' ? 'alert' : 'status';

  return (
    <div className={className} id={id} role={role}>
      {message}
    </div>
  );
}
