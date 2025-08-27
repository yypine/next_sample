import Link from "next/link";

/**
 * 404エラーページコンポーネント
 * ページが見つからない場合に表示される
 * Next.js 15で必須となったページ
 */
export default function NotFound() {
  return (
    <div className="mainContent">
      <main style={{ textAlign: "center", padding: "2rem" }}>
        <h1 className="mainTitle">404 - ページが見つかりません</h1>
        <p style={{ margin: "1rem 0" }}>
          お探しのページは見つかりませんでした。
        </p>
        <Link
          href="/"
          style={{
            color: "var(--foreground)",
            textDecoration: "underline",
          }}
        >
          ホームに戻る
        </Link>
      </main>
    </div>
  );
}
