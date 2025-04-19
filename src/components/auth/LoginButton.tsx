// src/components/auth/LoginButton.tsx
"use client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import React from "react";

interface LoginButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick, className = "", children }) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`flex items-center ${className}`}
    >
      <LogIn className="h-4 w-4 mr-1" />
      {children || "Logga in"}
    </Button>
  );
};

export default LoginButton;
