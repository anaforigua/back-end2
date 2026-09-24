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
          </form>
        </div>
      </section>
    </main>
  );
}