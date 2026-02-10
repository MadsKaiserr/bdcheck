"use client"
import Image from "next/image";
import { useEffect, useState } from "react";

interface PagespeedProps {
  domain: string;
  pagespeedDataMobile: any;
  pagespeedDataDesktop: any;
  kategorier: any
}

export default function Pagespeed({ kategorier, domain, pagespeedDataMobile, pagespeedDataDesktop }: PagespeedProps) {

    const [dataType, setDataType] = useState("mobile")
    const [currentPagespeedData, setCurrentPagespeedData] = useState(pagespeedDataMobile)

    useEffect(() => {
        if (dataType == "desktop") {
            setCurrentPagespeedData(pagespeedDataDesktop)
        } else {
            setCurrentPagespeedData(pagespeedDataMobile)
        }
    }, [dataType])

    const [showField, setShowField] = useState(false)
    const [checkedIssues, setCheckedIssues] = useState<string[]>([]);
    const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});

    const [analyseType, setAnalyseType] = useState("audit")

    const headerText = `The mobile performance score is ${currentPagespeedData.performanceScore}. This is a result below our initial target of >70. We therefore see the following optimization potential for the website:`;
    const issuesList = kategorier
        .flatMap((kategori: any) =>
            kategori.issues.filter((issue: any) => checkedIssues.includes(issue.id))
        )
        .map((issue: any) => `- ${issue.issue}`)
        .join("\n");

    const behovsanalyseOutputText = `${headerText}\n${issuesList}`;

    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setOpenItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleIssue = (id: string) => {
        setCheckedIssues((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        if (currentPagespeedData && kategorier.length > 0) {
            const issuesToCheck: string[] = [];

            for (const kategori of kategorier) {
                for (const issue of kategori.issues) {
                    if (currentPagespeedData.audits[issue.psi_id] && issue.trigger !== undefined) {
                        if (currentPagespeedData.audits[issue.psi_id].score < issue.trigger) {
                            issuesToCheck.push(issue.id);
                        }
                    }

                    if (currentPagespeedData.audits["lcp-discovery-insight"]) {
                        if (issue.psi_id == "lcp-discovery-fetchpriority" && currentPagespeedData.audits["lcp-discovery-insight"].score > 0) {
                            if (!currentPagespeedData.audits["lcp-discovery-insight"].details.items[0].items.priorityHinted.value && currentPagespeedData.audits["lcp-discovery-insight"].score < issue.trigger) {
                                issuesToCheck.push(issue.id);
                            }
                        }
                        if (issue.psi_id == "lcp-discovery-eager" && currentPagespeedData.audits["lcp-discovery-insight"].score > 0) {
                            if (!currentPagespeedData.audits["lcp-discovery-insight"].details.items[0].items.eagerlyLoaded.value && currentPagespeedData.audits["lcp-discovery-insight"].score < issue.trigger) {
                                issuesToCheck.push(issue.id);
                            }
                        }
                    }

                    if (currentPagespeedData.audits["image-delivery-insight"]) {
                        const image_items = currentPagespeedData.audits["image-delivery-insight"]?.details?.items || [];
                        if (issue.psi_id == "lcp-images-oldformats" && currentPagespeedData.audits["image-delivery-insight"].score < issue.trigger && image_items.length > 0) {
                            // 1. Tjek for gamle formater (JPG, JPEG, PNG)
                            const oldFormatsCount = image_items.filter((item: { url: string; }) => {
                                const url = item.url.toLowerCase();
                                return url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png");
                            }).length;

                            if (oldFormatsCount >= 2) {
                                issuesToCheck.push(issue.id);
                            }
                        }
                        if (issue.psi_id == "lcp-images-toolarge" && currentPagespeedData.audits["image-delivery-insight"].score < issue.trigger && image_items.length > 0) {
                            // 2. Tjek for filer over 100 KB
                            const tooLargeCount = image_items.filter((item: { totalBytes: number; }) => item.totalBytes > 100000).length;

                            if (tooLargeCount >= 2) {
                                issuesToCheck.push(issue.id);
                            }
                        }
                        if (issue.psi_id == "lcp-images-intrinsicsize" && currentPagespeedData.audits["image-delivery-insight"].score < issue.trigger && image_items.length > 0) {
                            const intrinsicSizeCount = image_items.filter((item: { node: { boundingRect: { width: any; }; }; url: string | URL; }) => {
                                if (!item.node?.boundingRect || !item.url) return false;

                                const renderedWidth = item.node.boundingRect.width;
                                
                                const urlParams = new URL(item.url).searchParams;
                                const intrinsicWidth = parseInt(urlParams.get("width") || "0");

                                return intrinsicWidth >= (renderedWidth * 2);
                            }).length;

                            if (intrinsicSizeCount >= 2) {
                                issuesToCheck.push(issue.id);
                            }
                        }
                    }
                }
            }

            setCheckedIssues(issuesToCheck);
        }
    }, [currentPagespeedData, kategorier]);

    let assessment = "";
    const mScore = pagespeedDataMobile.performanceScore;
    const dScore = pagespeedDataDesktop.performanceScore;
    if (mScore >= 70 && dScore >= 70) {
        assessment = "This is considered a result above expectations. This means, that the website meets the requirements for pagespeed";
    } else {
        // Mobile under 70
        if (mScore < 50) {
            assessment = "This is considered a result significantly below expectations";
        } else if (mScore < 70) {
            assessment = "This is considered a result below expectations";
        }

        // Tilføj desktop-modifier hvis desktop er over 70
        if (dScore > 70) {
            assessment += ", especially since search engines prioritize good mobile performance.";
        } else {
            // Punktum til sidst hvis modiferen ikke blev tilføjet
            assessment += ".";
        }
    }
    const introText = `The pagespeed on mobile is ${mScore} and ${dScore} on desktop. ${assessment}\n\n`;
    const issuesText = kategorier
        .flatMap((kategori: any) =>
        kategori.issues.filter((issue: any) => checkedIssues.includes(issue.id))
        )
        .map((issue: any, index: number) => 
        `Issue ${index + 1}:\n${issue.issue}\n\nConsequence:\n${issue.consequence}\n`
        )
        .join("\n");
    const outputText = introText + issuesText;

    const toggleCategory = (slug: string) => {
        setOpenCategories((prev) => ({ ...prev, [slug]: !prev[slug] }));
    };

    return (
        <div className="platform__wrapper">
            <div className="platform__element">
                <h1 className="pagespeed__heading">Pagespeed for {domain || "kunde"}</h1>
                <div className="pagespeed__container">
                    <div className="pagespeed__status__container">
                        <div className="pagespeed__status__element">
                            <div 
                            className={`pagespeed__status__performancescore__container ${
                                pagespeedDataMobile.performanceScore >= 0 && pagespeedDataMobile.performanceScore <= 49
                                ? "pagespeed__status__performancescore__poor"
                                : pagespeedDataMobile.performanceScore >= 50 && pagespeedDataMobile.performanceScore <= 89
                                ? "pagespeed__status__performancescore__fair"
                                : pagespeedDataMobile.performanceScore >= 90 && pagespeedDataMobile.performanceScore <= 100
                                ? "pagespeed__status__performancescore__good"
                                : ""
                            }`}>
                                {pagespeedDataMobile.performanceScore}
                            </div>
                            <p className="pagespeed__status__performancescore__heading">Mobile</p>
                        </div>
                        <div className="pagespeed__status__element">
                            <div 
                            className={`pagespeed__status__performancescore__container ${
                                pagespeedDataDesktop.performanceScore >= 0 && pagespeedDataDesktop.performanceScore <= 49
                                ? "pagespeed__status__performancescore__poor"
                                : pagespeedDataDesktop.performanceScore >= 50 && pagespeedDataDesktop.performanceScore <= 89
                                ? "pagespeed__status__performancescore__fair"
                                : pagespeedDataDesktop.performanceScore >= 90 && pagespeedDataDesktop.performanceScore <= 100
                                ? "pagespeed__status__performancescore__good"
                                : ""
                            }`}>
                                {pagespeedDataDesktop.performanceScore}
                            </div>
                            <p className="pagespeed__status__performancescore__heading">Desktop</p>
                        </div>
                    </div>
                    <div className="pagespeed__toggle__container">
                        <div className={`pagespeed__toggle__slider ${dataType === "desktop" ? "is-right" : ""}`} />
                        
                        <button 
                            type="button"
                            className={`pagespeed__toggle__btn ${dataType === "mobile" ? "is-active" : ""}`}
                            onClick={() => setDataType("mobile")}
                        >
                            Mobile
                        </button>
                        
                        <button 
                            type="button"
                            className={`pagespeed__toggle__btn ${dataType === "desktop" ? "is-active" : ""}`}
                            onClick={() => setDataType("desktop")}
                        >
                            Desktop
                        </button>
                    </div>
                    {currentPagespeedData && 
                        <div className="pagespeed__diagnostics__wrapper">
                            {(() => {
                                if (!currentPagespeedData || !currentPagespeedData.audits) return null;

                                // 1. Opret grupper
                                const groups: Record<string, any[]> = {
                                metrics: [],
                                opportunities: [],
                                diagnostics: [],
                                other: []
                                };

                                // 2. Loop alle audits
                                Object.entries(currentPagespeedData.audits).forEach(([id, audit]: [string, any]) => {
                                if (audit.score === null || audit.score >= 0.9) return; // skjul gode audits

                                // find auditRef for group og weight
                                const ref = currentPagespeedData.auditRefs?.find((r: any) => r.id === id);
                                const group = ref?.group ?? "other";
                                const weight = ref?.weight ?? 0;

                                if (!groups[group]) groups[group] = [];
                                groups[group].push({ ...audit, id, weight });
                                });

                                // 3. Sorter hver gruppe efter impact/weight desc
                                Object.keys(groups).forEach((group) => {
                                    groups[group].sort((a, b) => {
                                        // Lav score til 0 hvis den er undefined, så den altid kommer til sidst
                                        const scoreA = a.score ?? 0;
                                        const scoreB = b.score ?? 0;

                                        // Sorter stigende: lav score først (størst impact først)
                                        return scoreA - scoreB;
                                    });
                                });

                                // 4. Render grupper
                                return Object.entries(groups).map(([groupName, audits]) => {
                                if (!audits.length) return null;

                                // Overskrift for gruppen
                                const groupTitle = {
                                    metrics: "Metrics",
                                    opportunities: "Opportunities",
                                    diagnostics: "Diagnostics",
                                    other: "Other"
                                }[groupName] || groupName;

                                return (
                                    <div key={groupName} className="pagespeed__diagnostics__group">
                                        <h3 className="pagespeed__diagnostics__heading">{groupTitle}</h3>
                                        <ul className="pagespeed__diagnostics__container">
                                            {audits.map((psItem: any) => {
                                                const savingsExist =
                                                psItem.metricSavings &&
                                                Object.values(psItem.metricSavings).some((value) => (value as number) > 0);

                                                const isOpen = openItems.includes(psItem.id);

                                                return (
                                                <li className={`pagespeed__diagnostics__element ${isOpen ? "issueopen" : ""}`} key={psItem.id}>
                                                    <div
                                                    className="pagespeed__diagnostics__element__header"
                                                    onClick={() => toggleItem(psItem.id)}
                                                    style={{ cursor: "pointer" }}
                                                    >
                                                    <div className="pagespeed__diagnostics__element__header__left">
                                                        <div
                                                        className={`pagespeed__diagnostics__element__header__status ${
                                                            psItem.score * 100 >= 0 && psItem.score * 100 <= 49
                                                            ? "pagespeed__diagnostics__element__header__status__poor"
                                                            : psItem.score * 100 >= 50 && psItem.score * 100 <= 89
                                                            ? "pagespeed__diagnostics__element__header__status__fair"
                                                            : psItem.score * 100 >= 90 && psItem.score * 100 <= 100
                                                            ? "pagespeed__diagnostics__element__header__status__good"
                                                            : ""
                                                        }`}
                                                        >
                                                        </div>
                                                        <p className="pagespeed__diagnostics__element__header__heading">
                                                        {psItem.title.replace(/`/g, "")}{" "}
                                                        <span className="pagespeed__diagnostics__element__header__heading__red">
                                                            {psItem.displayValue && <>- {psItem.displayValue}</>}
                                                        </span>
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`pagespeed__chevron`}
                                                        style={{ transition: "transform 0.3s" }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width={12} height={12}>
                                                        <path
                                                            d="M4.646 1.646 L10.646 7.646 L4.646 13.646"
                                                            strokeWidth="2"
                                                            stroke="currentColor"
                                                            fill="none"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        </svg>
                                                    </span>
                                                    </div>

                                                    {/* Content */}
                                                    {isOpen && (
                                                    <div className="pagespeed__diagnostics__content">
                                                        <p className="pagespeed__diagnostics__content__beskrivelse">
                                                            {psItem.description.split(/\[learn/i)[0]}
                                                        </p>

                                                        {/* {psItem.details && <>
                                                            <ul className="pagespeed__diagnostics__content__list__wrapper">
                                                                {psItem.details.headings.map((heading: any) => {
                                                                    return <li key={"heading-" + heading.key} className="pagespeed__diagnostics__content__list__element pagespeed__diagnostics__content__list__header">{heading.label}</li>
                                                                })}
                                                            </ul>
                                                            {psItem.details.items.map((item: any, index: number) => {

                                                                return (<ul className="pagespeed__diagnostics__content__list__wrapper" key={index}>
                                                                    {psItem.details.headings.map((heading: any) => {
                                                                    // Hent værdien fra item via heading.key
                                                                    const value = item[heading.key];

                                                                    return (
                                                                        <li
                                                                        key={heading.key}
                                                                        className="pagespeed__diagnostics__content__list__element"
                                                                        >
                                                                            {formatDisplayValue(value)} {heading.valueType == "bytes" && "KB"}
                                                                        </li>
                                                                    );
                                                                    })}
                                                                </ul>)
                                                            })}
                                                        </>} */}

                                                        {savingsExist && (
                                                        <ul className="pagespeed__diagnostics__content__savings">
                                                            <li key="heading" className="pagespeed__diagnostics__content__p">
                                                            Besparelser
                                                            </li>
                                                            {Object.entries(psItem.metricSavings).map(
                                                            ([metric, savings]) =>
                                                                (savings as number) > 0 && (
                                                                <li key={metric} className="pagespeed__diagnostics__content__p">
                                                                    {metric}:{" "}
                                                                    <span className="highlighted">-{savings as number}ms</span>
                                                                </li>
                                                                )
                                                            )}
                                                        </ul>
                                                        )}
                                                    </div>
                                                    )}
                                                </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                                });
                            })()}
                        </div>
                    }
                </div>
            </div>
            <div className="platform__element">
                <h1 className="pagespeed__heading">Technical audit indhold</h1>
                <ul className="pagespeed__container pagespeed__container__result">
                    <div className="pagespeed__toggle__container">
                        <div className={`pagespeed__toggle__slider ${analyseType === "behovsanalyse" ? "is-right" : ""}`} />
                        
                        <button 
                            type="button"
                            className={`pagespeed__toggle__btn ${analyseType === "audit" ? "is-active" : ""}`}
                            onClick={() => setAnalyseType("audit")}
                        >
                            Technical Audit
                        </button>
                        
                        <button 
                            type="button"
                            className={`pagespeed__toggle__btn ${analyseType === "behovsanalyse" ? "is-active" : ""}`}
                            onClick={() => setAnalyseType("behovsanalyse")}
                        >
                            Behovsanalyse
                        </button>
                    </div>
                        {kategorier.map((kategori: any) => {
                            const isOpen = openCategories[kategori.slug] || false;

                            return (
                            <li key={kategori.slug} className="pagespeed__wrapper">
                                <div className="pagespeed__kategori__heading__container" onClick={() => toggleCategory(kategori.slug)}>
                                    <p className="pagespeed__kategori__heading">{kategori.title}</p>

                                    <div className="pagespeed__heading__wrapper">
                                        <span className="pagespeed__heading__selected__heading">
                                            {kategori.issues.filter((issue: any) => checkedIssues.includes(issue.id)).length} valgte
                                        </span>

                                        <span className={`pagespeed__chevron ${isOpen ? "open" : ""}`}>
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

                                {isOpen && (
                                <ul className="pagespeed__issues">
                                    {kategori.issues.map((issue: any) => {
                                    const checked = checkedIssues.includes(issue.id);
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
                        {analyseType == "audit" ? 
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
                            : <div className="pagespeed__output">
                                <div className="pagespeed__output__cta__container">
                                    <button className="pagespeed__output__cta__primary" onClick={() => navigator.clipboard.writeText(behovsanalyseOutputText)}>Kopiér</button>
                                    <button className="pagespeed__output__cta__secondary" onClick={() => {
                                        if (showField) {
                                            setShowField(false)
                                        } else {
                                            setShowField(true)
                                        }
                                    }}>{showField ? "Skjul felt" : "Vis felt"}</button>
                                </div>
                                {showField && <textarea className="pagespeed__output__field" readOnly value={behovsanalyseOutputText} rows={Math.max(checkedIssues.length, 4)} />}
                            </div>
                        }
                </ul>
            </div>
        </div>
    );
}
