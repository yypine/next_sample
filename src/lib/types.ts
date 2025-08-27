export interface Prefecture {
  prefCode: number;
  prefName: string;
}

export interface ApiResponse<T> {
  message: string | null;
  result: T;
}

export interface SelectedPrefecturesDisplayProps {
  /** 選択された都道府県コードの配列 */
  selectedPrefectures: number[];
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

export interface PopulationApiResponse {
  message: string | null;
  result: {
    boundaryYear: number;
    data: PopulationComposition[];
  };
}
