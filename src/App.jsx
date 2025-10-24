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
      // URL d'API injectée au build par Vite (Render: VITE_API_URL)
      const API_RAW = import.meta.env.VITE_API_URL;
      const API = (API_RAW || "").replace(/\/+$/, "");
      if (!API) throw new Error("VITE_API_URL n'est pas défini côté front.");

      // Construire le payload sans champs vides
      const body = {
        to,
        subject,
        html: `<p>${message.replace(/\n/g, "<br/>")}</p>`,
      };
      const ccTrim = cc.trim();
      const bccTrim = bcc.trim();
      if (ccTrim) body.cc = ccTrim;
      if (bccTrim) body.bcc = bccTrim;

      const resp = await fetch(`${API}/api/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Lire en texte puis tenter JSON (meilleur diagnostic en prod)
      const text = await resp.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `HTTP ${resp.status} ${
            resp.statusText
          } — Réponse non-JSON: ${text.slice(0, 180)}…`
        );
      }

      if (!resp.ok) {
        // Afficher les erreurs de validation Zod si présentes
        const detail = data?.details?.fieldErrors
          ? JSON.stringify(data.details.fieldErrors)
          : data?.error;
        throw new Error(detail || `HTTP ${resp.status} ${resp.statusText}`);
      }

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
