"use client"
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function MainContent() {

    const [ahrefsAudit, setAhrefsAudit] = useState("");
    const [ahrefsOutput, setAhrefsOutput] = useState("");

    function nextStep() {
        if (!ahrefsAudit) return;

        const lines = ahrefsAudit.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0);

        const ignoredHeaders = [
            "Issue", "Crawled", "Change", "Added", "New", "Removed", 
            "Missing", "Links", "Indexable", "Content", "Localization", 
            "Sitemaps", "Images", "Performance", "Security"
        ];

        const extractedIssues = [];

        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i];

            if (ignoredHeaders.includes(currentLine)) continue;

            // NY TEST: Indeholder linjen bogstaver? (Så er det et Issue-navn)
            const hasLetters = /[a-zA-Z]/.test(currentLine);

            if (hasLetters && i + 1 < lines.length) {
                const nextLine = lines[i + 1];
                
                // Vi leder efter det første tal på næste linje (Crawled)
                const numberMatch = nextLine.match(/^([\d,.]+)/);

                if (numberMatch) {
                    const issueName = currentLine;
                    // Rens tallet for komma/punktum
                    const count = numberMatch[1].replace(/[.,]/g, '');

                    extractedIssues.push(`- ${count} ${issueName}`);
                    
                    i++; // Hop over tal-linjen
                }
            }
        }

        const finalString = `The healthscore is {{ score }}, which is considered below target. We therefore see the following potential for optimization:

${extractedIssues.join('\n')}`;

        setAhrefsOutput(finalString);
    }

    return (
        <div className="main__container">
            <div className="platform__wrapper">
                <div className="platform__element">
                    <h1 className="pagespeed__heading">Site Audit Input</h1>
                    <div className="pagespeed__container">
                        <textarea className="pagespeed__output__field" required value={ahrefsAudit} onChange={(e) => setAhrefsAudit(e.target.value)} />
                        <div className="pagespeed__output__cta__container">
                            <button className="pagespeed__output__cta__primary" onClick={() => nextStep()}>Kør</button>
                            <Link className="pagespeed__output__cta__secondary" href="/site-audit/indstillinger">Indstillinger</Link>
                        </div>
                    </div>
                </div>
                <div className="platform__element">
                    <h1 className="pagespeed__heading">Site Audit Output</h1>
                    <div className="pagespeed__container">
                        <textarea className="pagespeed__output__field" value={ahrefsOutput} readOnly />
                        <div className="pagespeed__output__cta__container">
                            <button className="pagespeed__output__cta__primary" onClick={() => navigator.clipboard.writeText(ahrefsOutput)}>Kopiér</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
