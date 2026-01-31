import Image from "next/image";

export default function ChatBoxHeader() {
  return (
    <div className="sticky flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 xl:px-6">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-full max-w-12 rounded-full">
          <Image
            src="/images/user/user-17.jpg"
            alt="Consultor de estilo"
            width={48}
            height={48}
            className="object-cover object-center w-full h-full overflow-hidden rounded-full"
          />
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
            Consultor de Estilo
          </h5>
          <p className="text-theme-xs text-gray-500 dark:text-gray-400">
            Chat guiado para definir seu estilo
          </p>
        </div>
      </div>
    </div>
  );
}
