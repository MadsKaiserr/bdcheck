"use client"
import Link from "next/link";
import { useState } from "react";

interface DomainProps {
  nextStep: (domainValue: string) => void;
  loading: boolean;
}

export default function Domain({ nextStep, loading }: DomainProps) {

    const [domain, setDomain] = useState("")

    return (
        <>
            <h1 className="pagespeed__heading">Ny Pagespeed Analyse</h1>
            <div className="pagespeed__container">
                {!loading ? <>
                    <input type="text" className="pagespeed__input__field" required placeholder="Domæne" value={domain} onChange={(e) => setDomain(e.target.value)} />
                    <div className="pagespeed__output__cta__container">
                        <button className="pagespeed__output__cta__primary" onClick={() => nextStep(domain)}>Fortsæt</button>
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
