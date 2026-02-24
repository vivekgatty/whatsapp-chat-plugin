interface Props {
  status: string;
}

const COLOR_MAP: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  snoozed: "bg-gray-100 text-gray-600",
  new: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  follow_up: "bg-orange-100 text-orange-700",
  converted: "bg-purple-100 text-purple-700",
  lapsed: "bg-gray-100 text-gray-600",
  blocked: "bg-red-100 text-red-700",
  lead: "bg-blue-100 text-blue-700",
  prospect: "bg-indigo-100 text-indigo-700",
  customer: "bg-green-100 text-green-700",
  vip: "bg-amber-100 text-amber-700",
  churned: "bg-gray-100 text-gray-600",
  draft: "bg-gray-100 text-gray-600",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  sent: "bg-blue-100 text-blue-700",
  delivered: "bg-teal-100 text-teal-700",
  read: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
  sending: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-indigo-100 text-indigo-700",
  owner: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  agent: "bg-green-100 text-green-700",
  readonly: "bg-gray-100 text-gray-600",
  GREEN: "bg-green-100 text-green-700",
  YELLOW: "bg-yellow-100 text-yellow-700",
  RED: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: Props) {
  const colors = COLOR_MAP[status] ?? "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
