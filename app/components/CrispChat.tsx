"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";
import { useAuth } from "./AuthProvider";

export default function CrispChat() {
  const { user, customer } = useAuth();

  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    if (!websiteId) {
      console.warn("NEXT_PUBLIC_CRISP_WEBSITE_ID environment variable is missing.");
      return;
    }
    
    // Initialize Crisp
    Crisp.configure(websiteId);

    // Sync visitor profile if authenticated
    if (user?.email) {
      Crisp.user.setEmail(user.email);
      
      const nickname = customer?.first_name || user?.user_metadata?.full_name || "";
      if (nickname) {
        Crisp.user.setNickname(nickname);
      }
    }
  }, [user, customer]);

  return null;
}
