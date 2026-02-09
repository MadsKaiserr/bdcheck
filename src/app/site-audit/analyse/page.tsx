import { Metadata } from "next";
import MainContent from "./components/mainContent";

export const metadata: Metadata = {
  title: "Site Audit Analyse | Bonzer",
  description: "",
};

export default async function Analyse() {

    return (
        <MainContent />
    );
}
