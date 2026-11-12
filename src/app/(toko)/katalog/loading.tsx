export default function LoadingCatalog() {
  return (
    <div>
      <div className="h-8 w-40 bg-line" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="aspect-[4/5] bg-mist" />
        ))}
      </div>
    </div>
  );
}
