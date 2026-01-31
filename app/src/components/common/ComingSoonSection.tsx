interface ComingSoonSectionProps {
  title: string;
  description?: string;
}

export default function ComingSoonSection({
  title,
  description = "Estamos preparando essa etapa para você.",
}: ComingSoonSectionProps) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="mx-auto w-full max-w-[520px] text-center">
        <p className="mb-2 text-sm font-medium text-brand-500">Em breve</p>
        <h1 className="mb-3 text-title-md font-bold text-gray-800 dark:text-white/90">
          {title}
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}
