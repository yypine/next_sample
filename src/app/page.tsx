import PrefectureSelector from "@/components/PrefectureSelector";
import styles from "@/styles/page.module.scss";
import { Prefecture } from "@/lib/types";

/**
 * SSRで内部API Routeから都道府県データを取得
 */
async function fetchPrefecturesSSR(): Promise<Prefecture[]> {
  try {
    // SSRでは絶対URLが必要
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/prefectures`, {
      cache: "no-store", // SSRで毎回最新データを取得
    });

    if (!response.ok) {
      console.error("💥 SSR - API Route エラー:", response.status);
      return [];
    }
    const data = await response.json();

    return data.result || [];
  } catch (error) {
    console.error("💥 SSR - API Route呼び出しエラー:", error);
    return [];
  }
}

/**
 * メインページコンポーネント（Server Component）
 * SSRで/api/prefecturesから都道府県データを事前取得
 */
export default async function Home() {
  // SSRで内部API Routeからデータ取得
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
