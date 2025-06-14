import { LogoIcon } from '@/components/icons/LogoIcon';

export function ScholarAiHeader() {
  return (
    <header className="py-4 px-6 border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center gap-2">
        <LogoIcon className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-headline font-semibold text-primary">
          ScholarAI
        </h1>
      </div>
    </header>
  );
}
