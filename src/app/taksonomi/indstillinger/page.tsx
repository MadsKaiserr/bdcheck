import { Metadata } from "next";
import Indstillinger from "./components/indstillinger.tsx";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Taksonomi Indstillinger | Bonzer",
  description: "",
};

export default async function IndstillingerServer() {
    const owner = "MadsKaiserr";
    const repo = "bonzer_tech_tool";
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

    const taksonomiData = await res.json();

    return (
        <div className="main__container">
            <Indstillinger kategorier={taksonomiData.categories} />
        </div>
    );
}