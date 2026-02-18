"use client"
import Image from "next/image";
import Pagespeed from "./pagespeed";
import { useState } from "react";
import Domain from "./domain";

interface LighthouseMetrics {
  [key: string]: string | undefined;
}

interface PageSpeedData {
    mobile: {
        pageId: string;
        //cruxMetrics: CruxMetrics;
        lighthouseMetrics: LighthouseMetrics;
        performanceScore?: number;
        audits: any;
    };
    desktop: {
        pageId: string;
        //cruxMetrics: CruxMetrics;
        lighthouseMetrics: LighthouseMetrics;
        performanceScore?: number;
        audits: any;
    }
}

export default function MainContent({kategorier, matches}: any) {

    const hardData = false;

    const [currentStep, setCurrentStep] = useState(hardData ? 1 : 0)

    const [domain, setDomain] = useState("")
    const [pagespeedData, setPagespeedData] = useState<PageSpeedData | null>(null);
    const [loading, setLoading] = useState(false)

    async function lighthouseRun(domainToCrawl: string) {
    setLoading(true);
    const psi_token = process.env.NEXT_PUBLIC_PSI_TOKEN;

    const fetchPSI = async (strategy: "mobile" | "desktop") => {
        const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${domainToCrawl}&key=${psi_token}&strategy=${strategy}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${strategy} error: ${res.status}`);
        return res.json();
    };

    try {
        // Kør begge analyser samtidigt
        const [mobileJson, desktopJson] = await Promise.all([
            fetchPSI("mobile"),
            fetchPSI("desktop")
        ]);

        const processResult = (json: any) => {
            const lighthouse = json.lighthouseResult;
            const metrics: LighthouseMetrics = {
                "First Contentful Paint": lighthouse.audits['first-contentful-paint']?.displayValue,
                "Speed Index": lighthouse.audits['speed-index']?.displayValue,
                "Largest Contentful Paint": lighthouse.audits['largest-contentful-paint']?.displayValue,
                "Total Blocking Time": lighthouse.audits['total-blocking-time']?.displayValue,
                "Time To Interactive": lighthouse.audits['interactive']?.displayValue,
            };

            const performanceScore = lighthouse.categories?.performance?.score
                ? Math.round(lighthouse.categories.performance.score * 100)
                : undefined;

            return {
                pageId: json.id,
                lighthouseMetrics: metrics,
                performanceScore,
                audits: lighthouse.audits,
                auditRefs: lighthouse.categories.performance.auditRefs
            };
        };

        const pagespeedObject = {
            mobile: processResult(mobileJson),
            desktop: processResult(desktopJson),
        };

        setPagespeedData(pagespeedObject);
        console.log("Pagespeed Data:", pagespeedObject);
        setLoading(false);

    } catch (err: any) {
        console.error("Fetching PageSpeed Insights failed:", err);
        setLoading(false);
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
            {currentStep == 0 && <Domain nextStep={startAnalyse} loading={loading} />}
            {currentStep === 1 && pagespeedData && (
                <Pagespeed 
                    kategorier={kategorier} 
                    matches={matches} 
                    domain={domain} 
                    pagespeedDataMobile={pagespeedData.mobile} 
                    pagespeedDataDesktop={pagespeedData.desktop} 
                />
            )}
        </div>
    );
}
