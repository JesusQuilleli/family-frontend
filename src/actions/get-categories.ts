import { FamilyApi } from "@/api/family.api";

interface Category {
  _id: string;
  name: string;
  user_uid: string;
  createdAt: string;
}

interface CategoriesResponse {
  ok: boolean;
  count: number;
  categories: Category[];
}

export const getCategoriesAction = async (query: string = ""): Promise<CategoriesResponse> => {
  try {
    const { data } = await FamilyApi.get<CategoriesResponse>(`/categories?query=${query}`);
    return data;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
};