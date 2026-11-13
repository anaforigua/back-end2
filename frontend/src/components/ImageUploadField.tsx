// back-end2/app/frontend/src/components/ImageUploadField.tsx
import React, { useRef } from 'react';
import { useImageUploader } from '../hooks/useImageUploader';

interface ImageUploadFieldProps {
  onFileSelect: (file: File | null) => void;
  label?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ 
  onFileSelect, 
  label = "Imagen del Producto" 
}) => {
  const { selectedFile, previewUrl, handleFileChange, clearImage } = useImageUploader();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e);
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    clearImage();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: '#cbd5e1' }}>{label}</label>}

      {/* Si NO hay imagen: Muestra un solo botón limpio */}
      {!previewUrl ? (
        <div style={{ position: 'relative', width: '100%' }}>
          <button 
            type="button" 
            className="btn secondary"
            style={{ width: '100%', textAlign: 'center', cursor: 'pointer', padding: '10px' }}
          >
            📁 Seleccionar imagen
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleChange} 
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        /* Si HAY imagen: Muestra la miniatura compacta y la X al lado */
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '8px 12px', 
          backgroundColor: 'rgba(30, 41, 59, 0.9)', 
          border: '1px solid #475569', 
          borderRadius: '8px',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <img 
              src={previewUrl} 
              alt="Vista previa" 
              style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '12px', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                {selectedFile?.name}
              </span>
              <span style={{ fontSize: '11px', color: '#34d399' }}>Imagen lista</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleRemove}
            title="Quitar imagen"
            style={{ 
              width: '28px', 
              height: '28px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              border: 'none',
              borderRadius: '50%', 
              cursor: 'pointer',
              fontWeight: 'bold',
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};