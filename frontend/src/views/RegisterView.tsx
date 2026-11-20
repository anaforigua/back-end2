import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Field } from "../components/Field";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
}

interface RegisterViewProps {
  onRegister?: (data: RegisterData) => void;
}

export function RegisterView({ onRegister }: RegisterViewProps) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanFirstName || !cleanLastName || !cleanEmail) {
      setErrorMsg("Completa nombre, apellido y correo electrónico.");
      return;
    }

    if (cleanPassword.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setErrorMsg("");
    setPassword("");

    if (onRegister) {
      onRegister({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
      });
    }

    navigate("/login");
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand">
          <div className="logo">
            REVEN<span>FY</span>
          </div>
          <div className="brand-copy">
            <h1>Únete.<br />Crea.<br />Expande.</h1>
            <p>Crea tu cuenta para gestionar productos, compras y ventas desde un solo lugar.</p>
          </div>
          <div className="notice">Plataforma modular - Sincronizada con FastAPI</div>
        </div>

        <div className="login-form">
          <h2>Crear cuenta</h2>
          <p className="muted">Regístrate para comenzar a usar Revenfy.</p>
          <form onSubmit={submit} className="form">
            <div className="two">
              <Field label="Nombre">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  required
                />
              </Field>
              <Field label="Apellido">
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  required
                />
              </Field>
            </div>

            <Field label="Correo electrónico">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@revenfy.com"
                autoComplete="email"
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
                  autoComplete="new-password"
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
              Registrarse
            </button>
            <p className="muted" style={{ textAlign: "center", marginTop: "12px" }}>
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}