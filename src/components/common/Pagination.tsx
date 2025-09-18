export default function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      <button className="px-3 py-2 border rounded" disabled={page<=1} onClick={() => onPageChange(page-1)}>Précédent</button>
      <span>Page {page} / {totalPages}</span>
      <button className="px-3 py-2 border rounded" disabled={page>=totalPages} onClick={() => onPageChange(page+1)}>Suivant</button>
    </div>
  );
}


