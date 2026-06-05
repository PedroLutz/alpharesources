import { useContext } from "react";
import { ToolbarContext } from "../contexts/ToolbarContext";

export const useToolbar = () => {
  const context = useContext(ToolbarContext);
  if (!context) throw new Error('useToolbar deve ser usado dentro de um ToolbarProvider');
  return context;
}