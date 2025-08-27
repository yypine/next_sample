import PrefectureSelector from "@/components/PrefectureSelector";
import { Prefecture } from "@/lib/types";
import styles from "@/styles/page.module.scss";

/**
 * SSRで外部ゆめみAPIから直接都道府県データを取得
 * 内部API Routeを経由せず、Vercelの静的生成に対応
 */
async function fetchPrefecturesSSR(): Promise<Prefecture[]> {
  try {
    const apiBase = process.env.YUMEMI_API_BASE_URL;
    const apiKey = process.env.YUMEMI_API_KEY;

    // 環境変数チェック
    if (!apiBase) {
      console.error("💥 SSR - APIベースURLが設定されていません");
      return [];
    }
    if (!apiKey) {
      console.error("💥 SSR - APIキーが設定されていません");
      return [];
    }

    // 外部APIを直接呼び出し（内部fetchなし）
    const response = await fetch(`${apiBase}/api/v1/prefectures`, {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json; charset=UTF-8",
      },
      // ⚠️ cache設定を削除（デフォルトのキャッシュを使用）
    });

    if (!response.ok) {
      console.error("💥 SSR - 外部API エラー:", response.status);
      return [];
    }

    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error("💥 SSR - 外部API呼び出しエラー:", error);
    return [];
  }
}

/**
 * メインページコンポーネント（Server Component）
 * SSRで外部ゆめみAPIから都道府県データを事前取得
 * Vercelの静的生成に対応
 */
export default async function Home() {
  // SSRで外部APIから直接データ取得
  const prefectures = await fetchPrefecturesSSR();

  return (
    <div className={`${styles.page} mainContent`}>
      <main className={styles.main}>
        <h1 className="mainTitle">都道府県別人口推移グラフ</h1>

        <PrefectureSelector prefectures={prefectures} />
      </main>
    </div>
  );
}
