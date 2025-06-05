export interface GameUpdate {
    idGame: number;
    game?: GameData[];
    categories?: number[];
    blocks?: ContentBlock[];
}

export interface GameData {
    title?: string;
    download_url?: string;
    cover?: string;
}

export interface ContentBlock {
    image_name: string;
    content: string;
}
