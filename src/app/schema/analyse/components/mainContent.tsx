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
        setLoading(false);
    }

    const ignoredTypes = [
        "SearchAction",
        "EntryPoint",
        "PropertyValueSpecification",
        "ReadAction",
        "ListItem",
        "Answer",
        "Audience",
        "GeoCoordinates",
        "OpeningHoursSpecification",
        "PostalAddress",
        "Question",
        "PropertyValue",
        "QuantitativeValue",
        "Thing"
    ];

    const generateStructuredOutput = () => {
        if (results.length === 0) {
            return {
            finalOutput: [],
            data: []
            };
        }

        const allTypesAcrossPages: string[] = [];

        const data = results.map((res) => {
            if (res.error) {
            return {
                url: res.url,
                types: [],
                error: res.error
            };
            }

            const filteredTypes = (res.types || []).filter(
            (type: string) => !ignoredTypes.includes(type)
            );

            // Saml alle typer globalt
            filteredTypes.forEach((type: string) => {
            allTypesAcrossPages.push(type);
            });

            return {
            url: res.url,
            types: filteredTypes
            };
        });

        // Fjern dubletter globalt
        const finalOutput = [...new Set(allTypesAcrossPages)].sort();

        return {
            finalOutput,
            data
        };
    };

    const structuredOutput = generateStructuredOutput();

    const formatSchemaTypesForWord = (types: string[]) => {
        if (!types || types.length === 0) return "";

        let workingTypes = [...new Set(types)]; // Fjern dubletter

        // 🔹 Regel 1: WebSite + WebPage → Website/Webpage
        if (workingTypes.includes("WebSite") && workingTypes.includes("WebPage")) {
            workingTypes = workingTypes.filter(
            (t) => t !== "WebSite" && t !== "WebPage"
            );
            workingTypes.push("Website/Webpage");
        }

        // 🔹 Regel 2: Organization + Corporation → Organization/Corporation
        if (workingTypes.includes("Organization") && workingTypes.includes("Corporation")) {
            workingTypes = workingTypes.filter(
            (t) => t !== "Organization" && t !== "Corporation"
            );
            workingTypes.push("Organization/Corporation");
        }

        // Sortér alfabetisk
        workingTypes.sort();

        // Returnér Word-venlig bullet liste
        return workingTypes.map(type => `${type}`).join("\n");
    };

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
                            <button className="pagespeed__output__cta__primary" onClick={() => startAnalyse()}>
                                {loading ? <span className="schemaspinner"></span> : "Kør"}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="platform__element">
                    <h1 className="pagespeed__heading">Overview & Status</h1>
                    <div className="pagespeed__container">
                        <textarea 
                            className="pagespeed__output__field" 
                            value={formatSchemaTypesForWord(structuredOutput.finalOutput)}
                            placeholder=""
                            readOnly 
                            style={{ minHeight: '300px' }}
                        />
                        
                        <div className="pagespeed__output__cta__container">
                            <button 
                                className="pagespeed__output__cta__primary" 
                                onClick={() => {
                                    if (structuredOutput.finalOutput) {
                                        navigator.clipboard.writeText(formatSchemaTypesForWord(structuredOutput.finalOutput));
                                    }
                                }}
                            >
                                Kopiér til Word
                            </button>
                        </div>
                        <div className="schema__output__container">
                            {structuredOutput.data.map((item: any) => {
                                return (
                                    <li key={item.url} className="schema__output__element">
                                        <p className="schema__output__element__heading">{item.url}</p>
                                        <ul className="schema__output__element__result__container">
                                            {item.types.map((itemResult: string) => {
                                                return (<li key={"SchemaType-" + itemResult} className="schema__output__element__result__p">{itemResult}</li>)
                                            })}
                                        </ul>
                                    </li>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
