"use client"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function MainContent({ categories }: any) {

    const [taksonomiAudit, setTaksonomiAudit] = useState("");
    const [checkedIssues, setCheckedIssues] = useState<string[]>([]);
    const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});
    
    const taksonomiOutput = useMemo(() => {
        const selectedIssues = categories.flatMap((kategori: any) =>
            kategori.issues.filter((issue: any) => 
                checkedIssues.includes(issue.id || issue.sf_id)
            )
        );

        const introText = ``;
        const issuesText = selectedIssues.map((issue: any, index: number) => 
            `Issue ${index + 1}:\n${issue.issue}\n\nConsequence:\n${issue.consequence}\n`
        ).join("\n");

        return introText + issuesText;
    }, [checkedIssues, categories]);

    useEffect(() => {
        if (taksonomiAudit && categories.length > 0) {
            const lines = taksonomiAudit.split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0);

            const foundFromPaste: string[] = [];
            
            for (const kategori of categories) {
                for (const issue of kategori.issues) {
                    if (lines.includes(issue.sf_id)) {
                        foundFromPaste.push(issue.id || issue.sf_id);
                    }
                }
            }

            // Vi bruger Set for at undgå dubletter mellem manuelle valg og paste
            setCheckedIssues(prev => [...new Set([...prev, ...foundFromPaste])]);
        }
    }, [taksonomiAudit, categories]);

    const toggleCategory = (slug: string) => {
        setOpenCategories((prev) => ({ ...prev, [slug]: !prev[slug] }));
    };

    const toggleIssue = (id: string) => {
        setCheckedIssues((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        if (taksonomiAudit && categories.length > 0) {
            const issuesToCheck: string[] = [];
            
            const lines = taksonomiAudit.split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0);

            // Gennemgå alle kategorier og deres issues
            for (const kategori of categories) {
                for (const issue of kategori.issues) {
                    if (lines.includes(issue.sf_id)) {
                        issuesToCheck.push(issue.id || issue.sf_id);
                    }
                }
            }

            setCheckedIssues(issuesToCheck);
        } else {
            setCheckedIssues([]);
        }
    }, [taksonomiAudit, categories]);

    return (
        <div className="main__container">
            <div className="platform__wrapper">
                <div className="platform__element">
                    <h1 className="pagespeed__heading">Screaming Frog Issues</h1>
                    <div className="pagespeed__container">
                        <div className="main__input__container">
                            <label className="main__input__heading">Liste over issues</label>
                            <p className="main__input__note">Separeres ved linjeskift</p>
                            <textarea 
                                className="pagespeed__output__field" 
                                required 
                                value={taksonomiAudit} 
                                onChange={(e) => setTaksonomiAudit(e.target.value)} 
                            />
                        </div>
                        <ul className="pagespeed__categories__list">
                            {categories.map((kategori: any) => {
                                const isOpen = openCategories[kategori.slug] || false;
                                // Tæller hvor mange issues i denne kategori der er markeret
                                const selectedCount = kategori.issues.filter((issue: any) => 
                                    checkedIssues.includes(issue.id || issue.sf_id)
                                ).length;

                                return (
                                    <li key={kategori.slug} className="pagespeed__wrapper">
                                        <div 
                                            className="pagespeed__kategori__heading__container" 
                                            onClick={() => toggleCategory(kategori.slug)}
                                        >
                                            <p className="pagespeed__kategori__heading">{kategori.title}</p>

                                            <div className="pagespeed__heading__wrapper">
                                                <span className="pagespeed__heading__selected__heading">
                                                    {selectedCount} valgte
                                                </span>

                                                <span className={`pagespeed__chevron ${isOpen ? "open" : ""}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width={16} height={16}>
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

                                        {isOpen && (
                                            <ul className="pagespeed__issues">
                                                {kategori.issues.map((issue: any) => {
                                                    const issueId = issue.id || issue.sf_id;
                                                    const isChecked = checkedIssues.includes(issueId);
                                                    
                                                    return (
                                                        <li key={issueId} className="pagespeed__issue__element">
                                                            <label className="pagespeed__issue__element__checkbox__container">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => toggleIssue(issueId)}
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
                                                                    {issue.issue} <span style={{opacity: 0.5, fontSize: '12px'}}>({issue.sf_id})</span>
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
                        </ul>
                    </div>
                </div>
                
                <div className="platform__element">
                    <h1 className="pagespeed__heading">Taksonomi output</h1>
                    <div className="pagespeed__container">
                        <textarea 
                            className="pagespeed__output__field" 
                            value={taksonomiOutput} 
                            readOnly 
                        />
                        <div className="pagespeed__output__cta__container">
                            <button 
                                className="pagespeed__output__cta__primary" 
                                onClick={() => {
                                    navigator.clipboard.writeText(taksonomiOutput);
                                }}
                            >
                                Kopiér til udklipsholder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}