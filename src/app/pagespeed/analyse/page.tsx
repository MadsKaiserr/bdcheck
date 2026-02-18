import { Metadata } from "next";
import MainContent from "./components/mainContent";

export const metadata: Metadata = {
  title: "Pagespeed Analyse | Bonzer",
  description: "",
};

export default async function Analyse() {

    const res = await fetch(
        "https://raw.githubusercontent.com/MadsKaiserr/bonzer_tech_tool/refs/heads/main/pagespeed",
        {
        cache: "no-store"
        }
    );

    if (!res.ok) {
        throw new Error("Kunne ikke hente pagespeed data");
    }

    const pagespeedData = await res.json();

    return (
        <MainContent kategorier={pagespeedData.categories} matches={pagespeedData.matches} />
    );
}
