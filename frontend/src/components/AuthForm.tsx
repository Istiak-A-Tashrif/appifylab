"use client";

import { FormEvent, useState } from "react";
import DesignImage from "./DesignImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../utils/api";
import { ENDPOINTS } from "../utils/endpoints";
import type { User } from "../types";

const A = "/assets/images/";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const registration = mode === "register";
  const prefix = registration ? "_social_registration" : "_social_login";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (registration && values.password !== values.repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api<User>(
        registration ? ENDPOINTS.auth.register : ENDPOINTS.auth.login,
        {
          method: "POST",
          body: JSON.stringify(
            registration
              ? {
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  password: values.password,
                }
              : { email: values.email, password: values.password },
          ),
        },
      );
      router.replace("/feed");
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`${prefix}_wrapper _layout_main_wrapper`}>
      <div className="_shape_one">
        <DesignImage src={`${A}shape1.svg`} alt="" className="_shape_img" />
        <DesignImage
          src={`${A}dark_shape.svg`}
          alt=""
          className="_dark_shape"
        />
      </div>
      <div className="_shape_two">
        <DesignImage src={`${A}shape2.svg`} alt="" className="_shape_img" />
        <DesignImage
          src={`${A}dark_shape1.svg`}
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_shape_three">
        <DesignImage src={`${A}shape3.svg`} alt="" className="_shape_img" />
        <DesignImage
          src={`${A}dark_shape2.svg`}
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className={`${prefix}_wrap`}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              {registration ? (
                <div className="_social_registration_right">
                  <div className="_social_registration_right_image">
                    <DesignImage src={`${A}registration.png`} alt="Image" />
                  </div>
                  <div className="_social_registration_right_image_dark">
                    <DesignImage src={`${A}registration1.png`} alt="Image" />
                  </div>
                </div>
              ) : (
                <div className="_social_login_left">
                  <div className="_social_login_left_image">
                    <DesignImage
                      src={`${A}login.png`}
                      alt="Image"
                      className="_left_img"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className={`${prefix}_content`}>
                <div
                  className={`${prefix}_${registration ? "right" : "left"}_logo _mar_b28`}
                >
                  <DesignImage
                    src={`${A}logo.svg`}
                    alt="Image"
                    className={registration ? "_right_logo" : "_left_logo"}
                  />
                </div>
                <p className={`${prefix}_content_para _mar_b8`}>
                  {registration ? "Get Started Now" : "Welcome back"}
                </p>
                <h4 className={`${prefix}_content_title _titl4 _mar_b50`}>
                  {registration ? "Registration" : "Login to your account"}
                </h4>
                <button
                  type="button"
                  className={`${prefix}_content_btn _mar_b40`}
                >
                  <DesignImage
                    src={`${A}google.svg`}
                    alt="Image"
                    className="_google_img"
                  />{" "}
                  <span>
                    {registration
                      ? "Register with google"
                      : "Or sign-in with google"}
                  </span>
                </button>
                <div className={`${prefix}_content_bottom_txt _mar_b40`}>
                  <span>Or</span>
                </div>
                <form className={`${prefix}_form`} onSubmit={submit}>
                  <div className="row">
                    {registration && (
                      <>
                        <Field
                          prefix={prefix}
                          label="First Name"
                          name="firstName"
                        />
                        <Field
                          prefix={prefix}
                          label="Last Name"
                          name="lastName"
                        />
                      </>
                    )}
                    <Field
                      prefix={prefix}
                      label="Email"
                      name="email"
                      type="email"
                    />
                    <Field
                      prefix={prefix}
                      label="Password"
                      name="password"
                      type="password"
                    />
                    {registration && (
                      <Field
                        prefix={prefix}
                        label="Repeat Password"
                        name="repeatPassword"
                        type="password"
                      />
                    )}
                  </div>
                  {error && (
                    <p className="_mar_t10" style={{ color: "#dc3545" }}>
                      {error}
                    </p>
                  )}
                  <div className="row">
                    <div
                      className={
                        registration
                          ? "col-lg-12 col-xl-12 col-md-12 col-sm-12"
                          : "col-lg-6 col-xl-6 col-md-6 col-sm-12"
                      }
                    >
                      <div className={`form-check ${prefix}_form_check`}>
                        <input
                          className={`form-check-input ${prefix}_form_check_input`}
                          type="radio"
                          name="agreement"
                          id="agreement"
                          defaultChecked
                        />
                        <label
                          className={`form-check-label ${prefix}_form_check_label`}
                          htmlFor="agreement"
                        >
                          {registration
                            ? "I agree to terms & conditions"
                            : "Remember me"}
                        </label>
                      </div>
                    </div>
                    {!registration && (
                      <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                        <div className="_social_login_form_left">
                          <p className="_social_login_form_left_para">
                            Forgot password?
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className={`${prefix}_form_btn _mar_t40 _mar_b60`}>
                        <button
                          type="submit"
                          disabled={busy}
                          className={`${prefix}_form_btn_link _btn1`}
                        >
                          {busy
                            ? "Please wait..."
                            : registration
                              ? "Register now"
                              : "Login now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className={`${prefix}_bottom_txt`}>
                      <p className={`${prefix}_bottom_txt_para`}>
                        {registration
                          ? "Already have an account?"
                          : "Dont have an account?"}{" "}
                        <Link href={registration ? "/login" : "/register"}>
                          {registration ? "Login Now" : "Create New Account"}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  prefix,
  label,
  name,
  type = "text",
}: {
  prefix: string;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
      <div className={`${prefix}_form_input _mar_b14`}>
        <label htmlFor={`${prefix}_${name}`} className={`${prefix}_label _mar_b8`}>{label}</label>
        <input
          id={`${prefix}_${name}`}
          name={name}
          type={type}
          required
          minLength={type === "password" ? 8 : undefined}
          className={`form-control ${prefix}_input`}
        />
      </div>
    </div>
  );
}
