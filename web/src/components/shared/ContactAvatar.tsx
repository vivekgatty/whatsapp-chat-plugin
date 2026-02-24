interface Props {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getColor(name: string): string {
  const colors = [
    "bg-green-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-red-500",
  ];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function ContactAvatar({ name, imageUrl, size = "md" }: Props) {
  if (imageUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={imageUrl} alt={name} className={`rounded-full object-cover ${SIZE_MAP[size]}`} />
    );
  }

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-medium text-white ${SIZE_MAP[size]} ${getColor(name)}`}
    >
      {getInitials(name)}
    </div>
  );
}
