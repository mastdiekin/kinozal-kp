export interface Ratings {
	kp: string;
	imdb: string;
}

export interface CacheEntry {
	time: number;
	value: Ratings;
}
