import { Metadata } from "next";
import MainContent from "./components/mainContent";

export const metadata: Metadata = {
  title: "Pagespeed Analyse | Bonzer",
  description: "",
};

export default async function Analyse() {

    const res = await fetch(
        "https://raw.githubusercontent.com/MadsKaiserr/bonzer_pagespeed/refs/heads/main/content",
        {
        cache: "no-store"
        }
    );

    if (!res.ok) {
        throw new Error("Kunne ikke hente pagespeed data");
    }

    const pagespeedData = await res.json();
    const kategorier = pagespeedData.categories

    return (
        <MainContent kategorier={kategorier} />
    );
}
