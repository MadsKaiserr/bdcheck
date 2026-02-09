"use client"
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Pagespeed({ kategorier }: any) {

    const router = useRouter();

    const [loading, setLoading] = useState(false)

    const [originalKategoriObject, setOriginalKategoriObject] = useState(kategorier);
    const [kategoriObject, setKategoriObject] = useState(kategorier)

    const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});

    const saveRef = useRef(false);

    function sletIssue(issueId: string) {
        saveRef.current = true;

        setKategoriObject((prev: any[]) =>
            prev.map((kategori) => ({
                ...kategori,
                issues: kategori.issues.filter((issue: any) => issue.id !== issueId),
            }))
        );
    }

    useEffect(() => {
        if (saveRef.current) {
            saveChanges();
            saveRef.current = false;
        }
    }, [kategoriObject]);

    const toggleCategory = (slug: string) => {
        setOpenCategories((prev) => ({ ...prev, [slug]: !prev[slug] }));
    };

    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setOpenItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const updateIssueField = (
        kategoriSlug: string,
        issueId: string,
        field: "issue" | "consequence" | "psi_id",
        value: string
        ) => {
        setKategoriObject((prev: any) =>
            prev.map((kategori: any) => {
            if (kategori.slug !== kategoriSlug) return kategori;

            return {
                ...kategori,
                issues: kategori.issues.map((issue: any) => {
                    if (issue.id !== issueId) return issue;

                    return {
                        ...issue,
                        [field]: value,
                    };
                }),
            };
            })
        );
    };

    async function saveChanges() {
        setLoading(true)
        try {
            const res = await fetch("/api/gem-indstillinger", {
                method: "POST",
                body: JSON.stringify(kategoriObject),
            });

            if (res.ok) {
                console.log("Gemt korrekt!");
                router.refresh(); 
            }
        } catch (error) {
            console.error(error);
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    function hasChanges(kategoriSlug: string, issueId: string) {
        const originalKategori = originalKategoriObject.find(
            (k: any) => k.slug === kategoriSlug
        );

        const currentKategori = kategoriObject.find(
            (k: any) => k.slug === kategoriSlug
        );

        if (!originalKategori || !currentKategori) return false;

        const originalIssue = originalKategori.issues.find(
            (i: any) => i.id === issueId
        );

        const currentIssue = currentKategori.issues.find(
            (i: any) => i.id === issueId
        );

        if (!currentIssue) return false;
        if (!originalIssue) return true;

        return (
            originalIssue.issue !== currentIssue.issue ||
            originalIssue.consequence !== currentIssue.consequence ||
            originalIssue.psi_id !== currentIssue.psi_id
        );
    }

    function opretNytIssue(kategoriSlug: string) {
        const newId = crypto.randomUUID();

        setKategoriObject((prev: any[]) =>
            prev.map((kategori) =>
                kategori.slug === kategoriSlug
                    ? {
                        ...kategori,
                        issues: [
                            ...kategori.issues,
                            {
                                id: newId,
                                psi_id: "",
                                issue: "",
                                trigger: 0.9,
                                consequence: "",
                            },
                        ],
                    }
                    : kategori
            )
        );

        // ⭐ Åbn issue automatisk
        setOpenItems((prev: string[]) => [...prev, newId]);
    }

    useEffect(() => {
        // Når 'kategorier' prop ændrer sig (efter et fetch), opdaterer vi vores lokale state
        setKategoriObject(kategorier);
        setOriginalKategoriObject(kategorier);
    }, [kategorier]);

    return (
        <div className="platform__wrapper">
            <div className="platform__element">
                <h1 className="pagespeed__heading">Pain points</h1>
                <ul className="pagespeed__container pagespeed__settings">
                    {kategoriObject.map((kategori: any) => {
                        const isOpen = openCategories[kategori.slug] || false;

                        return (
                        <li key={kategori.slug} className="pagespeed__wrapper">
                            <div className="pagespeed__kategori__heading__container" onClick={() => toggleCategory(kategori.slug)}>
                                <p className="pagespeed__kategori__heading">{kategori.title}</p>

                                <div className="pagespeed__heading__wrapper">
                                    <span className="pagespeed__heading__selected__heading">
                                        {kategori.issues.length} punkter
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
                                <ul className="pagespeed__diagnostics__container">
                                    {kategori.issues.map((issue: any) => {

                                        const isOpen = openItems.includes(issue.id);

                                        return (
                                        <li className={`pagespeed__diagnostics__element ${isOpen ? "issueopen" : ""}`} key={issue.id}>
                                            <div
                                            className="pagespeed__diagnostics__element__header"
                                            onClick={() => toggleItem(issue.id)}
                                            style={{ cursor: "pointer" }}
                                            >
                                            <div className="pagespeed__diagnostics__element__header__left">
                                                <p className="pagespeed__diagnostics__element__header__heading">
                                                    {issue.issue}
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

                                            {isOpen && (
                                                <div className="pagespeed__diagnostics__content">
                                                    <div className="pagespeed__settings__issue">
                                                        <label className="pagespeed__diagnostics__content__beskrivelse">ID</label>
                                                        <input type="text" className="pagespeed__input__field" required value={issue.psi_id} onChange={(e) => updateIssueField(kategori.slug, issue.id, "psi_id", e.target.value)} />
                                                    </div>
                                                    <div className="pagespeed__settings__issue">
                                                        <label className="pagespeed__diagnostics__content__beskrivelse">Titel</label>
                                                        <input type="text" className="pagespeed__input__field" required value={issue.issue} onChange={(e) => updateIssueField(kategori.slug, issue.id, "issue", e.target.value)} />
                                                    </div>
                                                    <div className="pagespeed__settings__issue">
                                                        <label className="pagespeed__diagnostics__content__beskrivelse">Konsekvens</label>
                                                        <textarea className="pagespeed__output__field" required value={issue.consequence} onChange={(e) => updateIssueField(kategori.slug, issue.id, "consequence", e.target.value)} />
                                                    </div>
                                                    <div className="indstillinger__cta__container">
                                                        <div className="pagespeed__output__cta__container">
                                                            <button
                                                                className={`pagespeed__output__cta__primary ${
                                                                    !hasChanges(kategori.slug, issue.id) ? "pagespeed__cta__disabled" : ""
                                                                }`}
                                                                onClick={() => saveChanges()}
                                                                disabled={!hasChanges(kategori.slug, issue.id)}
                                                            >
                                                                {loading ? <span className="pagespeed__button__spinner"></span> : "Gem ændringer"}
                                                            </button>
                                                            <button className="pagespeed__output__cta__secondary" onClick={() => {setKategoriObject(originalKategoriObject); setOpenItems([])}}>Fortryd</button>
                                                        </div>
                                                        <button className="pagespeed__output__cta__secondary indstillinger__cta__slet" onClick={() => sletIssue(issue.id)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                                                            </svg>
                                                            <span>Slet issue</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                        );
                                    })}
                                    <button onClick={() => opretNytIssue(kategori.slug)} className={`pagespeed__diagnostics__element pagespeed__settings__add`}>
                                        <div
                                        className="pagespeed__diagnostics__element__header"
                                        style={{ cursor: "pointer" }}
                                        >
                                        <div className="pagespeed__diagnostics__element__header__left">
                                            <p className="pagespeed__diagnostics__element__header__heading">
                                                Tilføj nyt issue
                                            </p>
                                        </div>
                                        <span
                                            className={`pagespeed__chevron`}
                                            style={{ transition: "transform 0.3s" }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width={14} height={14}>
                                            <path strokeWidth="1" stroke="currentColor" fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                                            </svg>
                                        </span>
                                        </div>
                                    </button>
                                </ul>
                            )}
                        </li>
                        );
                    })}
                </ul>
            </div>
            <div className="platform__element">
                <h1 className="pagespeed__heading">Sammensætninger</h1>
                {/* <ul className="pagespeed__container">
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
                </ul> */}
            </div>
        </div>
    );
}
