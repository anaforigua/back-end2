import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface LoginViewProps {
  onLogin: (email: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Lista de TLDs permitidos
  const allowedTlds = ["com", "co", "net", "org", "io", "edu"];
  
  // Expresión regular dinámica para validar los TLDs permitidos
  const emailPattern = `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.(${allowedTlds.join("|")})$`;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    setEmail(input.value);

    // Validación y mensaje personalizado para el usuario
    if (input.validity.patternMismatch) {
      input.setCustomValidity(
        `Por favor, ingresa un correo válido que termine en una extensión permitida (ej: .${allowedTlds.join(", .")})`
      );
    } else {
      input.setCustomValidity("");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email);
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
            <h1>Compras / Vendes / Creces.</h1>
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
                pattern={emailPattern}
                onChange={handleEmailChange}
                placeholder="admin@revenfy.com"
                required
              />
            </Field>

            <Field label="Contraseña">
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            <button type="submit" className="btn">
              Entrar
            </button>

            {/* Texto con enlace para ir al registro usando clases CSS */}
            <p className="auth-redirect-text">
              ¿No tienes cuenta?{" "}
              <span
                onClick={() => navigate("/register")}
                className="auth-redirect-link"
              >
                Regístrate
              </span>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}