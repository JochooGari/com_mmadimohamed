import { useContent } from "../context/ContentContext";

export default function EditorToggle() {
  const { isEditing, setIsEditing } = useContent();
  return (
    <button
      className="px-4 py-2 rounded bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition"
      onClick={() => setIsEditing((v) => !v)}
    >
      {isEditing ? "Quitter le mode édition" : "Activer le mode édition"}
    </button>
  );
} 