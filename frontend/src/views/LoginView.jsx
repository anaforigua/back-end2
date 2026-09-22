import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Field } from "../components/Field";
import { FiEye, FiEyeOff } from "react-icons/fi";

export function LoginView({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = e => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email);
    navigate("/roles");
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand">
          <div className="logo">REVEN<span>FY</span></div>
          <div className="brand-copy">
            <h1>Compra.<br/>Vende.<br/>Crece.</h1>
            <p>Una plataforma para gestionar productos, compras y ventas desde un solo lugar.</p>
          </div>
          <div className="notice">Interfaz React modular · Sincronizada con FastAPI</div>
        </div>
        <div className="login-form">
          <h2>Iniciar sesión</h2>
          <p className="muted">Ingresa para seleccionar tu rol.</p>
          <form onSubmit={submit} className="form">
            <Field label="Correo electrónico">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@revenfy.com" required />
            </Field>
            
            <Field label="Contraseña">
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
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
                    color: "#e98bff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "18px"
                  }}
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </Field>

            <button 
              className="btn full"
              style={{ transition: "all 0.3s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 15px rgba(112, 71, 239, 0.5)";
                e.currentTarget.style.borderColor = "rgba(233, 139, 255, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "";
              }}
            >
              Ingresar
            </button>
          </form>

          <p className="muted small" style={{ marginTop: "16px", textAlign: "center" }}>
            ¿Aún no te has registrado? <Link to="/register" style={{ color: "#e98bff", textDecoration: "none" }}>Regístrate aquí</Link>
          </p>

          <p className="muted small" style={{ marginTop: "8px", textAlign: "center" }}>Conectado de forma segura con tu base de datos backend.</p>
        </div>
      </section>
    </main>
  );
}