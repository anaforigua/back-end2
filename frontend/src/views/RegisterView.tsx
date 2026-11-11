import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Field } from "../components/Field";
import { FiEye, FiEyeOff } from "react-icons/fi";

export function RegisterView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  // Lista de TLDs permitidos
  const allowedTlds = ["com", "co", "net", "org", "io", "edu"];

  // Exige texto + "@" + texto + "." + TLD permitido
  const emailRegex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.(${allowedTlds.join("|")})$`);
  const emailMessage = `El correo debe incluir '@' y terminar en una extensión válida (.${allowedTlds.join(", .")})`;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value.trim() === "") {
      setEmailError("");
      return;
    }
    setEmailError(emailRegex.test(value) ? "" : emailMessage);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!emailRegex.test(email)) {
      setEmailError(emailMessage);
      return;
    }
    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    // Aquí se conectará con el backend (FastAPI) para crear la cuenta.
    navigate("/login");
  };

  const eyeButtonStyle: React.CSSProperties = {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "inherit",
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
            <p>Crea tu cuenta para gestionar productos, compras y ventas desde un solo lugar.</p>
          </div>
          <div className="notice">Interfaz React modular - Sincronizada con FastAPI</div>
        </div>

        <div className="login-form">
          <h2>Crear cuenta</h2>
          <p className="muted">Regístrate para empezar a usar Revenfy.</p>
          <form onSubmit={submit} className="form">
            <Field label="Correo electrónico">
              <input
                type="text"
                value={email}
                onChange={handleEmailChange}
                placeholder="tucorreo@ejemplo.com"
                required
              />
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeButtonStyle}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </Field>

            <Field label="Confirmar contraseña">
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>

            {formError && (
              <span style={{ color: "#f87171", fontSize: "0.85rem" }}>{formError}</span>
            )}

            <button type="submit" className="btn">
              Registrarme
            </button>

            <p className="auth-redirect-text">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="auth-redirect-link">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}