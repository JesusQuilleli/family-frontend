import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth.store";

export const useAuthRedirect = () => {
   const { authStatus, role } = useAuthStore();
   const navigate = useNavigate();

   useEffect(() => {

      if (authStatus === "authenticated") {
         if (role === "admin") {
            navigate("/admin", { replace: true });
         } else {
            navigate("/client", { replace: true });
         }
      }

   }, [authStatus, role, navigate]);
};

