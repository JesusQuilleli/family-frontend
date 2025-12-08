export interface Category {
   _id: string;
   name: string;
   parent_id?: string | Category | null;
}

export type CategoryResponse = Category[];