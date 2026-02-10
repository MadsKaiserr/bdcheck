import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const kategoriObject = await req.json();
    await saveChanges(kategoriObject);

    revalidatePath("/pagespeed/indstillinger"); 

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function saveChanges(kategoriObject: any) {
  const owner = "MadsKaiserr";
  const repo = "bonzer_pagespeed";
  const path = "content";
  const branch = "main";

  const token = process.env.GITHUB_TOKEN;

  const getFile = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    }
  );

  if (!getFile.ok) {
    throw new Error("Kunne ikke hente fil SHA fra GitHub");
  }
  const fileData = await getFile.json();
  const sha = fileData.sha;
  const newContent = {
    categories: kategoriObject,
  };

  // Indsæt nye ændringer
  const encodedContent = Buffer.from(
    JSON.stringify(newContent, null, 2)
  ).toString("base64");

  const updateFile = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update pagespeed issues",
        content: encodedContent,
        sha: sha,
        branch: branch,
      }),
    }
  );

  if (!updateFile.ok) {
    const error = await updateFile.text();
    throw new Error(error);
  }

  return await updateFile.json();
}