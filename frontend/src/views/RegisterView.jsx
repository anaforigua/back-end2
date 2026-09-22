import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Field } from "../components/Field";
import { FiEye, FiEyeOff } from "react-icons/fi";

export function RegisterView({ onRegister }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) return;
    
    // Aquí puedes manejar la lógica de registro o llamada al backend
    if (onRegister) {
      onRegister({ firstName, lastName, email });
    }
    
    // Redirigir al login
    navigate("/login");
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand">
          <div className="logo">REVEN<span>FY</span></div>
          <div className="brand-copy">
            <h1>Únete.<br/>Crea.<br/>Expande.</h1>
            <p>Crea tu cuenta para gestionar productos, compras y ventas desde un solo lugar.</p>
          </div>
          <div className="notice">Plataforma modular · Sincronizada con FastAPI</div>
        </div>
        
        <div className="login-form">
          <h2>Crear cuenta</h2>
          <p className="muted">Regístrate para comenzar a usar Revenfy.</p>
          
          <form onSubmit={submit} className="form">
            <Field label="Nombre">
              <input 
                type="text" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                placeholder="Anamaria" 
                required 
              />
            </Field>

            <Field label="Apellido">
              <input 
                type="text" 
                value={lastName} 
                onChange={e => setLastName(e.target.value)} 
                placeholder="Forigua" 
                required 
              />
            </Field>

            <Field label="Correo electrónico">
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="anamaria@revenfy.com" 
                required 
              />
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
                    color: "#7047ef",
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
              style={{ transition: "all 0.3s ease", marginTop: "8px" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 15px rgba(112, 71, 239, 0.5)";
                e.currentTarget.style.borderColor = "rgba(233, 139, 255, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "";
              }}
            >
              Registrarse
            </button>
          </form>

          <p className="muted small" style={{ marginTop: "16px", textAlign: "center" }}>
            ¿Ya tienes una cuenta? <Link to="/login" style={{ color: "#e98bff", textDecoration: "none" }}>Inicia sesión</Link>
          </p>
        </div>
      </section>
    </main>
  );
}