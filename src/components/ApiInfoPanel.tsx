"use client";

import { useState } from "react";
import styles from "@/styles/ApiInfoPanel.module.scss";
import common from "@/styles/common.module.scss";

/**
 * API取得確認用パネルコンポーネント
 * ゆめみのコードチェック用APIの接続テストと基本的なデータ表示を行う
 * エンドポイント: https://yumemi-frontend-engineer-codecheck-api.vercel.app
 */
export default function ApiInfoPanel() {
  // 状態管理
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiDataPrefectures, setApiDataPrefectures] = useState<any>(null);
  const [apiDataPopulation, setApiDataPopulation] = useState<any>(null);
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
        const errorMessage = errorData?.error || `HTTPエラー: ${responsePrefectures.status} ${responsePrefectures.statusText}`;
        throw new Error(errorMessage);
      }

      const dataPrefectures = await responsePrefectures.json();
      setApiDataPrefectures(dataPrefectures);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };
  /**
   * ゆめみAPI人口構成一覧を取得する関数
   * Next.js API Routes経由で安全にアクセス
   */
  const fetchPopulation = async (prefCode: number = 13) => {
    setLoading(true);
    setError(null);

    try {
      // prefCodeをクエリパラメータとして渡す
      const populationResponse = await fetch(`/api/population?prefCode=${prefCode}`);

      if (!populationResponse.ok) {
        const errorData = await populationResponse.json().catch(() => null);
        const errorMessage = errorData?.error || `HTTPエラー: ${populationResponse.status} ${populationResponse.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await populationResponse.json();
      setApiDataPopulation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };
  /**
   * パネルの開閉とAPI呼び出し
   */
  const handleToggle = () => {
    setIsOpen(!isOpen);

    // パネルを開く時にAPI取得
    if (!isOpen && !apiDataPrefectures && !apiDataPopulation) {
      fetchPrefectures();
      fetchPopulation();
    }
  };

  // 都道府県が選択されたときに人口データも取得
  const handlePrefectureSelect = (prefCode: number) => {
    fetchPopulation(prefCode); // 選択された都道府県の人口データを取得
  };

  return (
    <div className={styles.apiPanel}>
      {/* 開閉ボタン */}
      <button className={styles.toggleButton} onClick={handleToggle} disabled={loading}>
        {loading ? "🔄 取得中..." : isOpen ? "📊 API情報を非表示" : "📊 API情報を表示"}
      </button>

      {/* API情報表示パネル */}
      {isOpen && (
        <div className={styles.panel}>
          <h3 className={styles.title}>ゆめみ API 接続テスト</h3>

          {/* ローディング表示 */}
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}>⏳</div>
              <p>都道府県データを取得中...</p>
            </div>
          )}

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

              {/* 基本情報 */}
              <div className={styles.section}>
                <h5 className={common.subTitle}>取得情報</h5>
              </div>

              {/* 都道府県データプレビュー */}
              <div className={styles.section}>
                <h5>都道府県データ（最初の5件）</h5>
                <div className={styles.dataList}>
                  {apiDataPrefectures.result?.slice(0, 5).map((pref: any) => (
                    <div key={pref.prefCode} className={styles.dataItem}>
                      <span className={styles.prefCode}>{pref.prefCode}</span>
                      <span className={styles.prefName}>{pref.prefName}</span>
                    </div>
                  ))}
                  {apiDataPrefectures.result?.length > 5 && <div className={styles.moreData}>...他{apiDataPrefectures.result.length - 5}件</div>}
                </div>
              </div>

              {/* JSONデータ表示（開発者向け） */}
              <details className={styles.details}>
                <summary>🔍 レスポンスデータ（JSON）</summary>
                <pre className={styles.jsonData}>{JSON.stringify(apiDataPrefectures, null, 2)}</pre>
              </details>
            </div>
          )}

          {/* 人口データ表示 */}
          {apiDataPopulation && !loading && (
            <div className={styles.success}>
              <h4>✅ 人口データAPI接続成功</h4>

              {/* 基本情報 */}
              <div className={styles.section}>
                <h5 className={common.subTitle}>取得情報</h5>
              </div>

              {/* 人口構成データプレビュー */}
              <div className={styles.section}>
                <h5>人口構成データ</h5>
                <div className={styles.dataList}>
                  {apiDataPopulation.result?.data?.map((category: any, index: number) => (
                    <div key={index} className={styles.categoryItem}>
                      <h6>{category.label}</h6>
                      <div className={styles.populationData}>
                        {category.data?.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className={styles.dataItem}>
                            <span className={styles.year}>{item.year}年:</span>
                            <span className={styles.value}>
                              {item.value?.toLocaleString()}人{item.rate && ` (${item.rate}%)`}
                            </span>
                          </div>
                        ))}
                        {category.data?.length > 3 && <div className={styles.moreData}>...他{category.data.length - 3}件</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* JSONデータ表示 */}
              <details className={styles.details}>
                <summary>🔍 レスポンスデータ（JSON）</summary>
                <pre className={styles.jsonData}>{JSON.stringify(apiDataPopulation, null, 2)}</pre>
              </details>
            </div>
          )}

          {/* 初期状態 */}
          {!apiDataPrefectures && !loading && !error && (
            <div className={styles.initial}>
              <p>上のボタンを押してAPI接続テストを開始します</p>
              <div className={styles.requirements}>
                <h5>API仕様:</h5>
                <ul>
                  <li>🏢 ゆめみ コードチェック API</li>
                  <li>🔒 認証: X-API-KEY（サーバーサイドで処理）</li>
                  <li>⏱️ レート制限: あり（適切な間隔で使用）</li>
                  <li>📍 プロキシ: Next.js API Routes経由</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
