export interface Game {
  id?: number;
  developer_id?: number;
  title: string;
  description?: string;
  upload_date?: Date;
  download_url?: string;
  downloads?: number;
  cover?: string;
  is_open?: boolean;
  rating_count?: number;
  rating_sum?: number;
  total_rating?: number;
}

export interface GameResponse {
  results: number;
  games: Game[];
}

export interface GameRating {
  game_id?: number;
  user_id?: number;
  rating?: number;
}

export interface GameCategories {
  game_id: number;
  id: number;
  name: string;
}
