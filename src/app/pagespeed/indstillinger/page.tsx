import { Metadata } from "next";
import Indstillinger from "./components/indstillinger";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Technical Audit Indstillinger | Bonzer",
  description: "",
};

export default async function IndstillingerServer() {
    const owner = "MadsKaiserr";
    const repo = "bonzer_tech_tool";
    const path = "pagespeed";
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

    return (
        <div className="main__container">
            <Indstillinger kategorier={pagespeedData.categories} matches={pagespeedData.matches} />
        </div>
    );
}