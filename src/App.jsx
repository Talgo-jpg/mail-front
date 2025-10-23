import { useState } from "react";
import "./App.css";

export default function App() {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  async function handleSend(e) {
    e.preventDefault();
    setStatus("Envoi...");

    try {
      const API = import.meta.env.VITE_API_URL;
      const resp = await fetch(`${API}/api/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          html: `<p>${message.replace(/\n/g, "<br/>")}</p>`,
          cc: cc.trim() === "" ? null : cc.trim(), // <- null si vide
          bcc: bcc.trim() === "" ? null : bcc.trim(), // <- null si vide
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Erreur serveur");
      setStatus(`OK ✅ ID: ${data.id}`);
    } catch (err) {
      setStatus(`Erreur ❌ ${err.message}`);
    }
  }

  return (
    <div className="container">
      <h2 className="title">Envoyer un e-mail (API)</h2>

      <form className="form" onSubmit={handleSend}>
        <label className="label">À (email)</label>
        <input
          className="input"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          type="email"
          placeholder="destinataire@domaine.com"
        />

        <label className="label">CC (optionnel)</label>
        <input
          className="input"
          value={cc}
          onChange={(e) => setCc(e.target.value)}
          type="email"
          placeholder="copie@domaine.com"
        />

        <label className="label">CCI (optionnel)</label>
        <input
          className="input"
          value={bcc}
          onChange={(e) => setBcc(e.target.value)}
          type="email"
          placeholder="copie-cachee@domaine.com"
        />

        <label className="label">Objet</label>
        <input
          className="input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          placeholder="Objet du message"
        />

        <label className="label">Message</label>
        <textarea
          className="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          required
          placeholder="Ton message…"
        />

        <button type="submit" className="btn">
          Envoyer
        </button>
      </form>

      {status && <p className="status">{status}</p>}
    </div>
  );
}
