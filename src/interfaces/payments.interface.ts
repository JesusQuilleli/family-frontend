import type { User } from "./user.interface";

export interface Payment {
   _id: string;
   order_uid: {
      _id: string;
      total: number;
      subscriber: number;
      remaining: number;
      status: string;
      client_uid: User;
   };
   amount: number;
   payment_method: "efectivo" | "transferencia";
   reference?: string;
   image_checking?: string;
   registered_by: User;
   payment_date: string;
   verified: boolean;
   rejectionReason?: string;
   createdAt: string;
   updatedAt: string;
}

export interface CreatePaymentDTO {
   amount: number;
   payment_method: "efectivo" | "transferencia";
   reference?: string;
   image_checking?: string; // Optional for now as per backend
}
