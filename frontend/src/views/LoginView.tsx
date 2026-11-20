import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface LoginViewProps {
  onLogin: (email: string) => void;
}

function hasSuspiciousMarkup(value: string): boolean {
  return /<\s*\/?\s*script|javascript:|on\w+\s*=/i.test(value);
}

export function LoginView({ onLogin }: LoginViewProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMsg("Completa tu correo electrónico y contraseña.");
      return;
    }

    if (hasSuspiciousMarkup(cleanEmail) || hasSuspiciousMarkup(password)) {
      setErrorMsg("El correo o la contraseña contienen caracteres no permitidos.");
      return;
    }

    if (/\s/.test(password)) {
      setErrorMsg("La contraseña no puede contener espacios.");
      return;
    }

    setErrorMsg("");
    setPassword("");
    onLogin(cleanEmail);
    navigate("/roles");
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand">
          <div className="logo">
            REVEN<span>FY</span>
          </div>
          <div className="brand-copy">
            <h1>Compra.br / Vende.br / Crece.</h1>
            <p>Una plataforma para gestionar productos, compras y ventas desde un solo lugar.</p>
          </div>
          <div className="notice">Interfaz React modular - Sincronizada con FastAPI</div>
        </div>

        <div className="login-form">
          <h2>Iniciar sesión</h2>
          <p className="muted">Ingresa para seleccionar tu rol.</p>
          <form onSubmit={submit} className="form">
            <Field label="Correo electrónico">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@revenfy.com"
                autoComplete="email"
                required
              />
            </Field>

            <Field label="Contraseña">
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                      setErrorMsg("La contraseña no puede contener espacios.");
                    }
                  }}
                  onChange={(e) => {
                    const nextValue = e.target.value.replace(/\s+/g, "");
                    setPassword(nextValue);
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ width: "100%", paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "inherit",
                  }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </Field>

            {errorMsg && (
              <p className="muted" role="alert" style={{ color: "#ef4444", margin: 0 }}>
                {errorMsg}
              </p>
            )}

            <button type="submit" className="btn">
              Entrar
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}