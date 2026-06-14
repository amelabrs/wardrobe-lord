export type Location = {
  id: number;
  name: string;
  photo_data: string | null;
  description: string;
  created_at: string;
};

export type ClothingItem = {
  id: number;
  name: string;
  photo_data: string[];
  tags: string[];
  comments: string;
  location_id: number | null;
  location_name: string | null;
  last_worn_date: string | null;
  created_at: string;
};
