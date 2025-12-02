import React from 'react';
import { Link } from 'react-router-dom';

type AccountFooterProps = {
  prompt: string;
  linkText: string;
  to: string;
};

export function AccountFooter({
  prompt,
  linkText,
  to
}: AccountFooterProps): React.ReactElement {
  return (
    <div className="account-footer">
      <span className="muted">{prompt}</span>
      <Link className="link" to={to}>{linkText}</Link>
    </div>
  );
}
