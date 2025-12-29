"use client";

import { FormEventHandler, ReactElement } from "react";


interface ILoginProps {
  handleOnSubmit: FormEventHandler<HTMLFormElement>;
  username: string;
  password: string;
  error: string;
  setUsername: (value: React.SetStateAction<string>) => void;
  setPassword: (value: React.SetStateAction<string>) => void;
}

export function RenderLoginPage(props: ILoginProps): ReactElement {
  return (
    <main id="login-page">
      <h1>LMS</h1>
      <form className="login-form" onSubmit={props.handleOnSubmit}>
        <fieldset className="login-fields">
          <div className="hdr4-container">
            <h4>Login</h4>
          </div>

          {props.error && <h4 className="error-message">{props.error}</h4>}

          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={props.username}
            onChange={(e) => props.setUsername(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={props.password}
            onChange={(e) => props.setPassword(e.target.value)}
          />

          <button type="submit" className="sign_in">
            Sign In
          </button>
        </fieldset>
      </form>
    </main>
  );
}
