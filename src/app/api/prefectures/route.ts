import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiBase = process.env.YUMEMI_API_BASE_URL;
    const apiKey = process.env.YUMEMI_API_KEY;
    // ゆめみAPIベースURLが設定されていない場合はエラーを返す
    if (!apiBase) {
      throw new Error("APIベースURLが設定されていません");
    }
    // ゆめみAPIキーが設定されていない場合はエラーを返す
    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }
    const response = await fetch(`${apiBase}/api/v1/prefectures`, {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json; charset=UTF-8",
      },
    });

    if (!response.ok) {
      throw new Error(`APIエラー: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // エラー変数を使用してログ出力
    console.error("都道府県データ取得エラー:", error);

    // エラーの詳細情報を含むレスポンス
    const errorMessage = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      {
        error: "データの取得に失敗しました（都道府県データ）",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
