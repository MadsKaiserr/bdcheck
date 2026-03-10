import { Metadata } from "next";
import MainContent from "./components/mainContent";

export const metadata: Metadata = {
  title: "Taksonomi Analyse | Bonzer",
  description: "",
};

export default async function Analyse() {

    const res = await fetch(
        "https://raw.githubusercontent.com/MadsKaiserr/bonzer_tech_tool/refs/heads/main/taksonomi",
        {
        cache: "no-store"
        }
    );

    if (!res.ok) {
        throw new Error("Kunne ikke hente taksonomi data");
    }

    const taksonomiData = await res.json();

    return (
        <MainContent kategorier={taksonomiData.categories} />
    );
}
