import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL mangler" }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            next: { revalidate: 0 },
        });

        if (!response.ok) {
            throw new Error(`Kunne ikke hente siden (Status: ${response.status})`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const allFoundTypes: string[] = [];

        $('script[type="application/ld+json"]').each((_, element) => {
            let rawText = $(element).text().trim();
            if (!rawText) return;

            rawText = decodeHtmlEntities(rawText);

            const cleanedJsonString = rawText
                .replace(/<!\[CDATA\[|\]\]>/g, "")             // Fjern CDATA
                .replace(/^\s*\/\/.*$/gm, "")                  // Fjern single-line // kommentarer
                .replace(/\/\*[\s\S]*?\*\//g, "")              // Fjern multi-line /* */ kommentarer
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")  // Fjern kontroltegn
                .trim();

            try {
                const startIndex = cleanedJsonString.search(/[{[]/);
                if (startIndex === -1) return;
                
                const finalJson = JSON.parse(cleanedJsonString.substring(startIndex));
                extractTypes(finalJson, allFoundTypes);

            } catch (e) {
                console.error(`Parsing fejl på ${url}:`, e);
                console.log("Fejlagtig streng (start):", cleanedJsonString.substring(0, 100));
            }
        });

        // Fjern dubletter og sorter
        const uniqueTypes = [...new Set(allFoundTypes)].filter(Boolean).sort();

        return NextResponse.json({
            url,
            types: uniqueTypes,
            count: uniqueTypes.length
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Der opstod en fejl under crawling" },
            { status: 500 }
        );
    }
}
/* Fjern unødigt */
function decodeHtmlEntities(text: string) {
    if (!text) return "";
    return text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));
}

function extractTypes(obj: any, typesList: string[]) {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
        obj.forEach((item) => extractTypes(item, typesList));
        return;
    }

    if (obj["@type"]) {
        if (Array.isArray(obj["@type"])) {
            obj["@type"].forEach((t: any) => {
                if (typeof t === 'string') typesList.push(t);
            });
        } else if (typeof obj["@type"] === 'string') {
            typesList.push(obj["@type"]);
        }
    }

    if (obj["@graph"]) {
        extractTypes(obj["@graph"], typesList);
    }

    // Nestede objekter
    Object.values(obj).forEach((val) => {
        if (val && typeof val === 'object') {
            extractTypes(val, typesList);
        }
    });
}