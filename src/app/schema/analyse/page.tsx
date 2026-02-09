import { Metadata } from "next";
import MainContent from "./components/mainContent";

export const metadata: Metadata = {
  title: "Schema Markup Analyse | Bonzer",
  description: "",
};

export default async function Analyse() {

    return (
        <MainContent />
    );
}
