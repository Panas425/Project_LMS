"use client";

import { ReactNode } from "react";
import './styles/globals.css';


interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}
