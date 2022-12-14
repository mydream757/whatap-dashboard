export type InformaticsData = {
  apiKey?: string;
  title: string;
  value: number;
};

export interface InformaticsProps {
  loading?: boolean;
  datum: InformaticsData[];
}
