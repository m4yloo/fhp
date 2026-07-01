/** Shape of a game row from the `games` table. */
export interface Game {
  id: number;
  title: string;
  platform: string;
  available: boolean;
  image: string;
  genre: string;
  year: number;
  description: string;
  long_description: string;
  features: string[];
  developer: string;
  publisher: string;
  rating: string;
  size: string;
  tags: string[];
  sys_requirements_min: Record<string, string>;
  sys_requirements_rec: Record<string, string>;
}
