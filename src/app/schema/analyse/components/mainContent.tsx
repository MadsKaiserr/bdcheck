"use client"
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function MainContent() {

    const [urlInputs, setUrlInputs] = useState("");

    function nextStep() {
        
    }

    return (
        <div className="main__container">
            <div className="platform__wrapper">
                <div className="platform__element">
                    <h1 className="pagespeed__heading">Schema Markup Analyse</h1>
                    <div className="pagespeed__container">
                        <div className="main__input__container">
                            <label className="main__input__heading">URL'er der skal analyseres</label>
                            <p className="main__input__note">Sepereres ved linjeskift</p>
                            <textarea className="pagespeed__output__field" required value={urlInputs} onChange={(e) => setUrlInputs(e.target.value)} />
                        </div>
                        <div className="pagespeed__output__cta__container">
                            <button className="pagespeed__output__cta__primary" onClick={() => nextStep()}>Kør</button>
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
