"use client"
import Link from "next/link";
import { useState } from "react";

interface DomainProps {
  nextStep: (domainValue: string) => void;
  loading: boolean;
}

export default function Domain({ nextStep, loading }: DomainProps) {

    const [domain, setDomain] = useState("")
    const [error, setError] = useState("")

    function validateDomain() {
        if (domain.includes(".")) {
            if (!domain.includes("https://")) {
                nextStep("https://" + domain)
            } else {
                nextStep(domain)
            }
        } else {
            setError("Indtast venligst et gyldigt domæne")
        }
    }

    return (
        <>
            <h1 className="pagespeed__heading">Ny Pagespeed Analyse</h1>
            <div className="pagespeed__container">
                {!loading ? <>
                    <input type="text" className="pagespeed__input__field" required placeholder="Domæne" value={domain} onChange={(e) => setDomain(e.target.value)} />
                    {error !== "" && <div className="pagespeed__input__error__container">
                        <svg xmlns="http://www.w3.org/2000/svg" className="pagespeed__input__error__svg" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                        </svg>
                        <p className="pagespeed__input__error">{error}</p>
                    </div>}
                    <div className="pagespeed__output__cta__container">
                        <button className="pagespeed__output__cta__primary" onClick={() => validateDomain()}>Fortsæt</button>
                        <Link className="pagespeed__output__cta__secondary" href="/pagespeed/indstillinger">Indstillinger</Link>
                    </div>
                </> : <div className="pagespeed__loading__container">
                    <div className="pagespeed__loading__spinner"></div>
                    <p className="pagespeed__loading__heading">Dette kan tage et par minutter...</p>
                </div>}
            </div>
        </>
    );
}
