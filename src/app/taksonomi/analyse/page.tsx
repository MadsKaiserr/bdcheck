import { Metadata } from "next";
import MainContent from "./components/mainContent";

export const metadata: Metadata = {
  title: "Taksonomi Analyse | Bonzer",
  description: "",
};

export default async function Analyse() {

    const owner = "MadsKaiserr";
    const repo = "bonzer_pagespeed";
    const path = "taksonomi";
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

    if (!res.ok) {
        console.error("Kunne ikke hente data fra API", `https://api.github.com/repos/${owner}/${repo}/contents/${path}`)
    };

    const pagespeedData = await res.json();
    const categories = pagespeedData.categories;

    return (
        <MainContent categories={categories} />
    );
}