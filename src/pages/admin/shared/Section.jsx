export default function Section({ title, description, children, actions }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}