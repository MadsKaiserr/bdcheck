"use client"
import Image from "next/image";
import Pagespeed from "./pagespeed";
import { useState } from "react";
import Domain from "./domain";

/* interface CruxMetrics {
  [key: string]: string | undefined;
} */

interface LighthouseMetrics {
  [key: string]: string | undefined;
}

interface PageSpeedData {
  pageId: string;
  //cruxMetrics: CruxMetrics;
  lighthouseMetrics: LighthouseMetrics;
  performanceScore?: number;
  audits: any;
}

export default function MainContent({kategorier}: any) {

    const hardData = false;

    const [currentStep, setCurrentStep] = useState(hardData ? 1 : 0)

    const [domain, setDomain] = useState("")
    const [pagespeedData, setPagespeedData] = useState<PageSpeedData | null>(null);
    const [loading, setLoading] = useState(false)

    async function lighthouseRun(domainToCrawl: string) {
        setLoading(true)
        const psi_token = process.env.NEXT_PUBLIC_PSI_TOKEN;
        const apiEndpoint = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=" + domainToCrawl + "&key=" + psi_token + "&strategy=mobile";
        console.log("API", apiEndpoint)
        try {
            const res = await fetch(apiEndpoint);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const json = await res.json();

            /* const cruxMetrics: CruxMetrics = {
                "First Contentful Paint": json.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS?.category || "",
                "Interaction to Next Paint": json.loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT?.category || "",
            }; */

            const lighthouse = json.lighthouseResult;
            const lighthouseMetrics: LighthouseMetrics = {
                "First Contentful Paint": lighthouse.audits['first-contentful-paint']?.displayValue,
                "Speed Index": lighthouse.audits['speed-index']?.displayValue,
                "Largest Contentful Paint": lighthouse.audits['largest-contentful-paint']?.displayValue,
                "Total Blocking Time": lighthouse.audits['total-blocking-time']?.displayValue,
                "Time To Interactive": lighthouse.audits['interactive']?.displayValue,
            };

            console.log("Audits", lighthouse.audits)

            const performanceScore = lighthouse.categories?.performance?.score
            ? Math.round(lighthouse.categories.performance.score * 100)
            : undefined;

            const audits = lighthouse.audits

            const pagespeedObject = {
                pageId: json.id,
                //cruxMetrics,
                lighthouseMetrics,
                performanceScore,
                audits,
                auditRefs: json.lighthouseResult.categories.performance.auditRefs
            }

            setPagespeedData(pagespeedObject);
            console.log(pagespeedObject)
            setLoading(false)

        } catch (err: any) {
            console.error("Fetching PageSpeed Insights failed:", err);
            setLoading(false)
        }
    }

    const startAnalyse = async (domainValue: string) => {
        setDomain(domainValue)
        try {
            await lighthouseRun(domainValue)
        } catch {
            console.error("Fejl")
        } finally {
            setCurrentStep(1)
        }
    };

    return (
        <div className="main__container">
            {/* <h1 className="pagespeed__heading">Pagespeed Issues</h1>
            <Pagespeed kategorier={pagespeedData.categories} /> */}
            {currentStep == 0 && <Domain nextStep={startAnalyse} loading={loading} />}
            {currentStep == 1 && <Pagespeed kategorier={kategorier} domain={domain} pagespeedData={pagespeedData} />}
        </div>
    );
}
