interface Props {
  body: string;
  header?: string;
  footer?: string;
}

export function WhatsAppPreview({ body, header, footer }: Props) {
  return (
    <div className="mx-auto max-w-xs rounded-2xl bg-[#e5ddd5] p-4">
      <div className="rounded-lg bg-white p-3 shadow-sm">
        {header && <p className="mb-1 text-sm font-semibold text-gray-900">{header}</p>}
        <p className="text-sm whitespace-pre-wrap text-gray-800">{body}</p>
        {footer && <p className="mt-2 text-xs text-gray-400">{footer}</p>}
        <p className="mt-1 text-right text-xs text-gray-400">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
