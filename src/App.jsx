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
    console.log("[UI] submit clicked");
    setStatus("Envoi...");

    try {
      // ——— Debug de l’URL d’API injectée au build ———
      const API_RAW = import.meta.env.VITE_API_URL;
      const API = (API_RAW || "").replace(/\/+$/, ""); // retire les / finaux
      console.log("[UI] API env =", API_RAW, "| API used =", API);

      if (!API) {
        throw new Error(
          "VITE_API_URL est vide côté front (variable d'env non définie au build)."
        );
      }

      const url = `${API}/api/send`;
      console.log("[UI] fetch →", url);

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          html: `<p>${message.replace(/\n/g, "<br/>")}</p>`,
          cc: cc.trim() === "" ? null : cc.trim(),
          bcc: bcc.trim() === "" ? null : bcc.trim(),
        }),
      });

      // ——— Lecture en texte d’abord pour diagnostiquer si ce n’est pas du JSON ———
      const text = await resp.text();
      console.log("[UI] HTTP", resp.status, resp.statusText, "body:", text);

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
        throw new Error(
          data?.error || `HTTP ${resp.status} ${resp.statusText}`
        );
      }

      setStatus(`OK ✅ ID: ${data.id}`);
    } catch (err) {
      console.error("[UI] send error:", err);
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
