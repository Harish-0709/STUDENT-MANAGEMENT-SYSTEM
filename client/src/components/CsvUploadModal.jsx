import { useState } from 'react';
import axios from 'axios';

const CsvUploadModal = ({ isOpen, onClose, uploadUrl, title, sampleData }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setError(false);
    };

    const handleUpload = async () => {
        if (!file) { setMessage('Please select a CSV file first.'); setError(true); return; }
        const formData = new FormData();
        formData.append('file', file);
        setLoading(true); setMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(uploadUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });
            setMessage(response.data.message || 'Upload successful!');
            setError(false); setFile(null);
            setTimeout(() => onClose(true), 2000);
        } catch (err) {
            setError(true);
            setMessage(err.response?.data?.message || 'Error uploading file.');
        } finally { setLoading(false); }
    };

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16
        }}>
            <div className="card" style={{ width: "100%", maxWidth: 460, animation: "slideUp 0.25s ease" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontWeight: 700, fontSize: "1.15rem" }}>{title}</h2>
                    <button onClick={() => onClose(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-muted)" }}>✕</button>
                </div>

                {/* Sample Headers */}
                <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 8 }}>
                        Upload a CSV file with the following headers:
                    </p>
                    <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: 8, fontFamily: "monospace", fontSize: "0.78rem", overflowX: "auto", color: "var(--text)" }}>
                        {sampleData}
                    </div>
                </div>

                {/* Drop Zone */}
                <div style={{
                    border: file ? "2px solid #3b82f6" : "2px dashed var(--border)",
                    borderRadius: 12, padding: 28, textAlign: "center",
                    cursor: "pointer", position: "relative",
                    background: file ? "#eff6ff" : "#fafbfc",
                    transition: "all 0.2s ease"
                }}>
                    <input type="file" accept=".csv" onChange={handleFileChange} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                    <div style={{ fontSize: "2rem", marginBottom: 6 }}>📁</div>
                    {file ? (
                        <p style={{ color: "#2563eb", fontWeight: 600, fontSize: "0.88rem" }}>{file.name}</p>
                    ) : (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Drag & drop or click to select CSV</p>
                    )}
                </div>

                {/* Status Message */}
                {message && (
                    <div style={{
                        marginTop: 14, padding: "10px 14px", borderRadius: 8, fontSize: "0.82rem",
                        background: error ? "#fef2f2" : "#f0fdf4",
                        color: error ? "#dc2626" : "#16a34a",
                        border: `1px solid ${error ? "#fecaca" : "#bbf7d0"}`
                    }}>
                        {error ? "⚠️" : "✅"} {message}
                    </div>
                )}

                {/* Actions */}
                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button className="btn btn-secondary" onClick={() => onClose(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleUpload} disabled={loading || !file} style={{ opacity: (loading || !file) ? 0.5 : 1 }}>
                        {loading ? '⏳ Uploading...' : '⬆️ Upload Data'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CsvUploadModal;
