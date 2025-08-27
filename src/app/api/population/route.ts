import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const apiBase = process.env.YUMEMI_API_BASE_URL;
    const apiKey = process.env.YUMEMI_API_KEY;

    if (!apiBase) {
      throw new Error("APIベースURLが設定されていません");
    }

    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }

    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const prefCode = searchParams.get("prefCode") || "13"; // デフォルトは東京都

    console.log("📡 Request prefCode:", prefCode);

    const fullUrl = `${apiBase}/api/v1/population/composition/perYear?prefCode=${prefCode}`;
    console.log("📡 Request URL:", fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json; charset=UTF-8",
      },
    });

    console.log("📊 Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`APIエラー: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ 成功!");
    return NextResponse.json(data);
  } catch (error) {
    console.error("💥 エラー発生:", error);
    return NextResponse.json(
      {
        error: "データの取得に失敗しました（人口データ）",
        details: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  }
}
