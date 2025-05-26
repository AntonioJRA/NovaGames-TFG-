export interface ContentBlock {
  id: number;
  game_id: number;
  block_type: 'text' | 'image';
  block_number: number;
  content: string;
  block_row: number;
  block_col: number;
}
