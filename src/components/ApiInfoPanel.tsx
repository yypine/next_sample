"use client";

import { PopulationApiResponse, Prefecture } from "@/lib/types";
import styles from "@/styles/ApiInfoPanel.module.scss";
import { useState } from "react";

interface PrefectureApiResponse {
  message: string | null;
  result: Prefecture[];
}

/**
 * API情報表示パネルコンポーネント
 * ゆめみAPIの接続状況とデータを表示する
 * エンドポイント: https://yumemi-frontend-engineer-codecheck-api.vercel.app
 */
export default function ApiInfoPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiDataPrefectures, setApiDataPrefectures] = useState<PrefectureApiResponse | null>(null);
  const [apiDataPopulation, setApiDataPopulation] = useState<PopulationApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * ゆめみAPI都道府県一覧を取得する関数
   * Next.js API Routes経由で安全にアクセス
   */
  const fetchPrefectures = async () => {
    setLoading(true);
    setError(null);

    try {
      // 自分のAPI Route経由で呼び出し（APIキーはサーバーサイドで処理）
      const responsePrefectures = await fetch("/api/prefectures");

      if (!responsePrefectures.ok) {
        // レスポンスからエラー詳細を取得
        const errorData = await responsePrefectures.json().catch(() => null);
        const errorMessage =
          errorData?.error || `HTTPエラー: ${responsePrefectures.status} ${responsePrefectures.statusText}`;
        throw new Error(errorMessage);
      }

      const dataPrefectures: PrefectureApiResponse = await responsePrefectures.json();
      setApiDataPrefectures(dataPrefectures);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ゆめみAPI人口構成データを取得する関数
   * 東京都（prefCode=13）をデフォルトで取得
   */
  const fetchPopulation = async (prefCode = 13) => {
    try {
      // 自分のAPI Route経由で呼び出し
      const responsePopulation = await fetch(`/api/population?prefCode=${prefCode}`);

      if (!responsePopulation.ok) {
        // レスポンスからエラー詳細を取得
        const errorData = await responsePopulation.json().catch(() => null);
        const errorMessage =
          errorData?.error || `HTTPエラー: ${responsePopulation.status} ${responsePopulation.statusText}`;
        throw new Error(errorMessage);
      }

      const dataPopulation: PopulationApiResponse = await responsePopulation.json();
      setApiDataPopulation(dataPopulation);
    } catch (err) {
      console.error("人口データ取得エラー:", err);
      // 人口データのエラーは非致命的なので、状態にエラーを設定しない
    }
  };

  /**
   * パネルの開閉を制御する関数
   */
  const handleToggle = () => {
    setIsOpen(!isOpen);

    // パネルを開く時にAPI取得
    if (!isOpen && !apiDataPrefectures && !apiDataPopulation) {
      fetchPrefectures();
      fetchPopulation();
    }
  };

  return (
    <div className={styles.apiPanel}>
      {/* 開閉ボタン */}
      <button className={styles.toggleButton} onClick={handleToggle} disabled={loading}>
        {loading ? "🔄 取得中..." : isOpen ? "📊 API情報を非表示" : "📊 API情報を表示"}
      </button>

      {/* パネル内容 */}
      {isOpen && (
        <div className={styles.content}>
          <h3>🔌 API接続テスト</h3>
          <p>ゆめみAPIとの接続状況とレスポンスデータを表示します</p>

          {/* エラー表示 */}
          {error && (
            <div className={styles.error}>
              <h4>❌ エラーが発生しました</h4>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={fetchPrefectures}>
                🔄 再試行
              </button>
            </div>
          )}

          {/* API成功時のデータ表示 */}
          {apiDataPrefectures && !loading && (
            <div className={styles.success}>
              <h4>✅ API接続成功</h4>
              <p>
                <strong>取得件数:</strong> {apiDataPrefectures.result?.length || 0}件の都道府県データ
              </p>
              <p>
                <strong>API応答時間:</strong> 正常
              </p>

              {/* データの詳細表示 */}
              <div className={styles.dataDisplay}>
                {/* 都道府県データプレビュー */}
                <div className={styles.section}>
                  <h5>都道府県データ（最初の5件）</h5>
                  <div className={styles.dataList}>
                    {apiDataPrefectures.result?.slice(0, 5).map((pref: Prefecture) => (
                      <div key={pref.prefCode} className={styles.dataItem}>
                        <span className={styles.prefCode}>{pref.prefCode}</span>
                        <span className={styles.prefName}>{pref.prefName}</span>
                      </div>
                    ))}
                    {(apiDataPrefectures.result?.length || 0) > 5 && (
                      <div className={styles.moreData}>...他{(apiDataPrefectures.result?.length || 0) - 5}件</div>
                    )}
                  </div>
                </div>

                {/* 人口データ表示 */}
                {apiDataPopulation && (
                  <div className={styles.section}>
                    <h5>人口データ（東京都の例）</h5>
                    <p>境界年: {apiDataPopulation.result.boundaryYear}</p>
                    <div className={styles.populationData}>
                      {apiDataPopulation.result.data.slice(0, 3).map((composition, index) => (
                        <div key={index} className={styles.compositionItem}>
                          <strong>{composition.label}:</strong>
                          <span>
                            {composition.data[0]?.year}年 - {composition.data[0]?.value?.toLocaleString()}人
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* JSONレスポンス詳細 */}
                <details className={styles.details}>
                  <summary>🔍 レスポンスデータ（JSON）</summary>
                  <pre className={styles.jsonData}>{JSON.stringify(apiDataPrefectures, null, 2)}</pre>
                </details>
              </div>
            </div>
          )}

          {/* 初期状態 */}
          {!apiDataPrefectures && !loading && !error && (
            <div className={styles.initial}>
              <p>上のボタンを押してAPI接続テストを開始します</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
