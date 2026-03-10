"use client"
import { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";

export default function Analyse({kategorier}: any) {

    const [showField, setShowField] = useState(false)
    const [checkedIssues, setCheckedIssues] = useState<string[]>([]);
    const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});

    const toggleCategory = (slug: string) => {
        setOpenCategories((prev) => ({ ...prev, [slug]: !prev[slug] }));
    };

    const toggleIssue = (id: string) => {
        setCheckedIssues((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const introText = ``;
    const issuesText = kategorier
        .flatMap((kategori: any) =>
        kategori.issues.filter((issue: any) => checkedIssues.includes(issue.id))
        )
        .map((issue: any, index: number) => 
        `Issue ${index + 1}:\n${issue.issue}\n\nConsequence:\n${issue.consequence}\n`
        )
        .join("\n");
    const outputText = introText + issuesText;

    const [issueSearch, setIssueSearch] = useState("")

    return (
        <div className="main__container">
            <div className="platform__wrapper">
                <div className="platform__element">
                    <div className="platform__header__container">
                        <h1 className="pagespeed__heading" style={{padding: "0"}}>Taksonomi issues</h1>
                        <Link className="pagespeed__output__cta__secondary" href="/taksonomi/indstillinger">Indstillinger</Link>
                    </div>
                    <ul className="pagespeed__container pagespeed__container__result">
                        <input type="text" className="pagespeed__input__field" style={{marginTop: "16px", marginBottom: "16px"}} placeholder="Søg i issues..." value={issueSearch} onChange={(e) => setIssueSearch(e.target.value)} />
                        {kategorier.map((kategori: any) => {
                            const isOpen = openCategories[kategori.slug] || false;

                            if (issueSearch !== "") {
                                if (!kategori.issues.find((issue: any) => issue.issue.toLowerCase().includes(issueSearch.toLowerCase()))) {
                                    return
                                }
                            }

                            return (
                            <li key={kategori.slug} className="pagespeed__wrapper">
                                <div className="pagespeed__kategori__heading__container" onClick={() => toggleCategory(kategori.slug)}>
                                    <p className="pagespeed__kategori__heading">{kategori.title}</p>

                                    <div className="pagespeed__heading__wrapper">
                                        <span className="pagespeed__heading__selected__heading">
                                            {kategori.issues.filter((issue: any) => checkedIssues.includes(issue.id)).length} valgte
                                        </span>

                                        <span className={`pagespeed__chevron ${isOpen || issueSearch !== "" ? "open" : ""}`}>
                                            <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 16 16"
                                            width={16}
                                            height={16}
                                            >
                                            <path
                                                d="M4.646 1.646 L10.646 7.646 L4.646 13.646"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                {(isOpen || issueSearch !== "") && (
                                <ul className="pagespeed__issues">
                                    {kategori.issues.map((issue: any) => {
                                    const checked = checkedIssues.includes(issue.id);

                                    if (issueSearch !== "") {
                                        if (!issue.issue.toLowerCase().includes(issueSearch.toLowerCase())) {
                                            return
                                        }
                                    }

                                    return (
                                        <li key={issue.id} className="pagespeed__issue__element">
                                            <label className="pagespeed__issue__element__checkbox__container">
                                                <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleIssue(issue.id)}
                                                />
                                                <span className="pagespeed__issue__element__checkbox__ui">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="pagespeed__issue__element__checkbox__icon"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
                                                </svg>
                                                </span>
                                                <p className="pagespeed__issue__element__checkbox__p">
                                                {issue.issue}
                                                </p>
                                            </label>
                                        </li>
                                    );
                                    })}
                                </ul>
                                )}
                            </li>
                            );
                        })}
                        <div className="pagespeed__output">
                                <div className="pagespeed__output__cta__container">
                                    <button className="pagespeed__output__cta__primary" onClick={() => navigator.clipboard.writeText(outputText)}>Kopiér</button>
                                    <button className="pagespeed__output__cta__secondary" onClick={() => {
                                        if (showField) {
                                            setShowField(false)
                                        } else {
                                            setShowField(true)
                                        }
                                    }}>{showField ? "Skjul felt" : "Vis felt"}</button>
                                </div>
                                {showField && <textarea className="pagespeed__output__field" readOnly value={outputText} rows={Math.max(checkedIssues.length * 4, 4)} />}
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    );
}
