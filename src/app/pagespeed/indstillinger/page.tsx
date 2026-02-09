import { Metadata } from "next";
import Indstillinger from "./components/indstillinger";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Technical Audit Indstillinger | Bonzer",
  description: "",
};

export default async function IndstillingerServer() {
    const owner = "MadsKaiserr";
    const repo = "bonzer_pagespeed";
    const path = "content";
    const token = process.env.GITHUB_TOKEN;

    const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3.raw",
            },
            cache: "no-store",
        }
    );

    if (!res.ok) throw new Error("Kunne ikke hente data fra API");

    const pagespeedData = await res.json();
    const kategorier = pagespeedData.categories;

    return (
        <div className="main__container">
            <Indstillinger kategorier={kategorier} />
        </div>
    );
}