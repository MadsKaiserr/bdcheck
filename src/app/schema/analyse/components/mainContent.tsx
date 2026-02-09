"use client"
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function MainContent() {

    const [urlInputs, setUrlInputs] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function startAnalyse() {
        setLoading(true);
        setResults([]);
        
        // Splitter textarea ved linjeskift og fjerner tomme linjer
        const urls = urlInputs.split("\n").map(u => u.trim()).filter(u => u !== "");

        // Vi kører dem i sekvens (eller Promise.all hvis det skal gå stærkt)
        const analysisPromises = urls.map(async (url) => {
            try {
                const res = await fetch("/api/schema", {
                    method: "POST",
                    body: JSON.stringify({ url }),
                });
                return await res.json();
            } catch (err) {
                return { url, error: "Netværksfejl" };
            }
        });

        const data = await Promise.all(analysisPromises);
        setResults(data);
        console.log("Schema Markup Result", data)
        setLoading(false);
    }

    return (
        <div className="main__container">
            <div className="platform__wrapper">
                <div className="platform__element">
                    <h1 className="pagespeed__heading">Schema Markup Analyse</h1>
                    <div className="pagespeed__container">
                        <div className="main__input__container">
                            <label className="main__input__heading">URL'er der skal analyseres</label>
                            <p className="main__input__note">Separeres ved linjeskift</p>
                            <textarea className="pagespeed__output__field" required value={urlInputs} onChange={(e) => setUrlInputs(e.target.value)} />
                        </div>
                        <div className="pagespeed__output__cta__container">
                            <button className="pagespeed__output__cta__primary" onClick={() => startAnalyse()}>Kør</button>
                            <Link className="pagespeed__output__cta__secondary" href="/site-audit/indstillinger">Indstillinger</Link>
                        </div>
                    </div>
                </div>
                <div className="platform__element">
                    <h1 className="pagespeed__heading">Overview & Status</h1>
                    <div className="pagespeed__container">
                        {/* <textarea className="pagespeed__output__field" value={ahrefsOutput} readOnly />
                        <div className="pagespeed__output__cta__container">
                            <button className="pagespeed__output__cta__primary" onClick={() => navigator.clipboard.writeText(ahrefsOutput)}>Kopiér</button>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
