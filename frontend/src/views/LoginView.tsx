import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Field } from "../components/Field";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const location = useLocation();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const registered = Boolean((location.state as { registered?: boolean } | null)?.registered);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg("Completa tu correo electrónico y contraseña.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    try {
      await onLogin(cleanEmail, password);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand">
          <div className="logo">REVEN<span>FY</span></div>
          <div className="brand-copy">
            <h1>Compra.br / Vende.br / Crece.</h1>
            <p>Una plataforma para gestionar productos, compras y ventas desde un solo lugar.</p>
          </div>
          <div className="notice">Sesión protegida y conectada con FastAPI</div>
        </div>
        <div className="login-form">
          <h2>Iniciar sesión</h2>
          <p className="muted">Ingresa para seleccionar tu rol.</p>
          {registered && <p role="status" className="notice">Cuenta creada. Ya puedes iniciar sesión.</p>}
          <form onSubmit={submit} className="form">
            <Field label="Correo electrónico">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" autoComplete="email" required />
            </Field>
            <Field label="Contraseña">
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" style={{ width: "100%", paddingRight: "40px" }} required />
                <button type="button" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword((prev) => !prev)} style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </Field>
            {errorMsg && <p className="muted" role="alert" style={{ color: "#ef4444", margin: 0 }}>{errorMsg}</p>}
            <button type="submit" className="btn" disabled={submitting}>{submitting ? "Verificando..." : "Entrar"}</button>
            <p className="muted" style={{ textAlign: "center", marginTop: "12px" }}>
              ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
