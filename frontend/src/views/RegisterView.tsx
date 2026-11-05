import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  
  // Estado para controlar el mensaje de error del correo
  const [emailError, setEmailError] = useState<string>("");

  // Lista de TLDs permitidos
  const allowedTlds = ["com", "co", "net", "org", "io", "edu"];

  // Expresión regular estricta: exige texto + "@" + texto + "." + TLD permitido
  const emailRegex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.(${allowedTlds.join("|")})$`);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value.trim() === "") {
      setEmailError("");
      return;
    }

    // Validamos en tiempo real mientras escribe
    if (!emailRegex.test(value)) {
      setEmailError(`El correo debe incluir '@' y terminar en una extensión válida (.${allowedTlds.join(", .")})`);
    } else {
      setEmailError(""); // Si es válido, borramos el error
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Validación final antes de enviar
    if (!emailRegex.test(email)) {
      setEmailError(`El correo debe incluir '@' y terminar en una extensión válida (.${allowedTlds.join(", .")})`);
      return;
    }

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
                type="text"
                value={email}
                onChange={handleEmailChange}
                placeholder="admin@revenfy.com"
                required
              />
              {/* Muestra el mensaje de error en rojo si el correo no es válido */}
              {emailError && (
                <span style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                  {emailError}
                </span>
              )}
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

            <p className="auth-redirect-text">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="auth-redirect-link">
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}