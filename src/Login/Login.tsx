// import { useEffect, useState } from 'react';
// import { canLogin } from './auth';

// export default function Login({ onSuccess }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [remember, setRemember] = useState(false);
//   const [showPass, setShowPass] = useState(false);
//   const [errors, setErrors] = useState({ email: false, password: false });

//   useEffect(() => {
//     document.body.classList.add('login-page');
//     return () => document.body.classList.remove('login-page');
//   }, []);

//   const redirect = () => {
//     if (typeof onSuccess === 'function') {
//       onSuccess();
//     } else {
//       window.location.href = 'calendar.html';
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const res = canLogin(email, password);
//     setErrors(res.errors);
//     if (!res.ok) return;
//     redirect();
//   };

//   return (
//     <section className="card" aria-labelledby="loginTitle">
//       <div className="head">
//         <div className="title" id="loginTitle">Sign in</div>
//         <div className="muted">Welcome back</div>
//       </div>

//       <form onSubmit={handleSubmit} noValidate>
//         <div className="field">
//           <label htmlFor="email">Email</label>
//           <div className="input-wrap">
//             <input
//               type="email"
//               id="email"
//               name="email"
//               placeholder="you@company.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className={`error ${errors.email ? 'show' : ''}`} id="emailError">
//             Please enter a valid email.
//           </div>
//         </div>

//         <div className="field">
//           <label htmlFor="password">Password</label>
//           <div className="input-wrap">
//             <input
//               type={showPass ? 'text' : 'password'}
//               id="password"
//               name="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               minLength={6}
//             />
//             <button
//               type="button"
//               className="toggle-pass"
//               aria-label="Toggle password visibility"
//               onClick={() => setShowPass((s) => !s)}
//             >
//               👁
//             </button>
//           </div>
//           <div className={`error ${errors.password ? 'show' : ''}`} id="passError">
//             Password must be at least 6 characters.
//           </div>
//         </div>

//         <div className="row">
//           <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
//             <input
//               type="checkbox"
//               id="remember"
//               checked={remember}
//               onChange={(e) => setRemember(e.target.checked)}
//             />
//             {' '}
//             Remember me
//           </label>
//           <a className="link" href="#" onClick={(e) => e.preventDefault()}>
//             Forgot password?
//           </a>
//         </div>

//         <div className="actions">
//           <button className="btn primary" type="submit">Sign in</button>
//         </div>
//       </form>
//     </section>
//   );
// }


import React, { useEffect, useState } from 'react';
import { canLogin } from './auth'; // TS: omit file extension

type LoginProps = {
  onSuccess?: () => void;
};

type ErrorsState = {
  email: boolean;
  password: boolean;
};

type AuthResult = {
  ok: boolean;
  errors: ErrorsState;
};

export default function Login({ onSuccess }: LoginProps): React.ReactElement {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [remember, setRemember] = useState<boolean>(false);
  const [showPass, setShowPass] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorsState>({ email: false, password: false });

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const redirect = (): void => {
    if (typeof onSuccess === 'function') {
      onSuccess();
    } else {
      window.location.href = 'calendar.html';
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // If your auth module exports a type for canLogin, prefer importing and using that
    const res = canLogin(email, password) as AuthResult;
    setErrors(res.errors);
    if (!res.ok) return;
    // Optionally persist "remember me" here if you implement it (e.g., localStorage/session)
    redirect();
  };

  return (
    <section className="card" aria-labelledby="loginTitle">
      <div className="head">
        <div className="title" id="loginTitle">Sign in</div>
        <div className="muted">Welcome back</div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="input-wrap">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={`error ${errors.email ? 'show' : ''}`} id="emailError" role="alert">
            Please enter a valid email.
          </div>
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <input
              type={showPass ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="toggle-pass"
              aria-label="Toggle password visibility"
              onClick={() => setShowPass((s) => !s)}
            >
              👁
            </button>
          </div>
          <div className={`error ${errors.password ? 'show' : ''}`} id="passError" role="alert">
            Password must be at least 6 characters.
          </div>
        </div>

        <div className="row">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemember(e.target.checked)}
            />
            {' '}
            Remember me
          </label>
          <a
            className="link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: trigger your "forgot password" flow
            }}
          >
            Forgot password?
          </a>
        </div>

        <div className="actions">
          <button className="btn primary" type="submit">Sign in</button>
        </div>
      </form>
    </section>
  );
}