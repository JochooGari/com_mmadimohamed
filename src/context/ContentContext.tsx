import React, { createContext, useContext, useState } from "react";
import { PortfolioContent } from "../types/content";
import { defaultContent } from "../data/defaultContent";

interface ContentContextProps {
  content: PortfolioContent;
  setContent: React.Dispatch<React.SetStateAction<PortfolioContent>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const ContentContext = createContext<ContentContextProps | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<PortfolioContent>(defaultContent);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <ContentContext.Provider value={{ content, setContent, isEditing, setIsEditing }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}; 