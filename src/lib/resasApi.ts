/**
 * RESAS API関連のユーティリティ関数
 * 地域経済分析システム（RESAS）のAPIを呼び出すための関数群
 */

// APIレスポンスの型定義
export interface Prefecture {
  prefCode: number;
  prefName: string;
}

export interface City {
  cityCode: string;
  cityName: string;
  bigCityFlag: "0" | "1" | "2" | "3";
}

export interface PopulationData {
  year: number;
  value: number;
  rate?: number;
}

export interface PopulationComposition {
  label: string;
  data: PopulationData[];
}

export interface ApiResponse<T> {
  message: string | null;
  result: T;
}

// APIエラークラス
export class ResasApiError extends Error {
  constructor(message: string, public status?: number, public endpoint?: string) {
    super(message);
    this.name = "ResasApiError";
  }
}

/**
 * RESAS APIの基本リクエスト関数
 *
 * @param endpoint - APIエンドポイント
 * @param params - クエリパラメータ
 * @returns APIレスポンス
 */
async function fetchResasApi<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<ApiResponse<T>> {
  const apiKey = process.env.NEXT_PUBLIC_RESAS_API_KEY;

  if (!apiKey) {
    throw new ResasApiError("RESAS APIキーが設定されていません。.env.localファイルでNEXT_PUBLIC_RESAS_API_KEYを設定してください。");
  }

  const baseUrl = "https://opendata.resas-portal.go.jp";
  const url = new URL(`${baseUrl}${endpoint}`);

  // クエリパラメータを追加
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new ResasApiError(`APIリクエストが失敗しました: ${response.status} ${response.statusText}`, response.status, endpoint);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ResasApiError) {
      throw error;
    }

    throw new ResasApiError(`ネットワークエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`, undefined, endpoint);
  }
}

/**
 * 都道府県一覧を取得
 *
 * @returns 都道府県一覧
 */
export async function getPrefectures(): Promise<Prefecture[]> {
  const response = await fetchResasApi<Prefecture[]>("/api/v1/prefectures");
  return response.result;
}

/**
 * 市区町村一覧を取得
 *
 * @param prefCode - 都道府県コード
 * @returns 市区町村一覧
 */
export async function getCities(prefCode: number): Promise<City[]> {
  const response = await fetchResasApi<City[]>("/api/v1/cities", { prefCode });
  return response.result;
}

/**
 * 人口構成データを取得
 *
 * @param prefCode - 都道府県コード
 * @param cityCode - 市区町村コード（オプション）
 * @returns 人口構成データ
 */
export async function getPopulationComposition(prefCode: number, cityCode?: string): Promise<PopulationComposition[]> {
  const params: Record<string, string | number> = {
    prefCode,
  };

  if (cityCode) {
    params.cityCode = cityCode;
  }

  const response = await fetchResasApi<{ boundaryYear: number; data: PopulationComposition[] }>("/api/v1/population/composition/perYear", params);

  return response.result.data;
}
