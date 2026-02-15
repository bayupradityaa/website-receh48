import { Button } from '../../../components/ui/Button';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="text-center py-16">
      {Icon && <Icon className="w-16 h-16 mx-auto text-dark-300 mb-4" />}
      <h3 className="text-lg font-semibold text-dark-900 mb-2">{title}</h3>
      {description && (
        <p className="text-dark-600 mb-4 max-w-md mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}