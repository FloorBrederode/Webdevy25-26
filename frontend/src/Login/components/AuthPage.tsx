import React from 'react';
import { useBodyClass } from '../useBodyClass';

type AuthPageProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  bodyClass?: string;
  className?: string;
};

export function AuthPage({
  title,
  subtitle,
  children,
  bodyClass = 'login-page',
  className
}: AuthPageProps): React.ReactElement {
  useBodyClass(bodyClass);
  const headingId = React.useId();
  const cardClassName = ['card', className].filter(Boolean).join(' ');

  return (
    <section className={cardClassName} aria-labelledby={headingId}>
      <div className="head">
        <div className="title" id={headingId}>{title}</div>
        <div className="muted">{subtitle}</div>
      </div>
      {children}
    </section>
  );
}
