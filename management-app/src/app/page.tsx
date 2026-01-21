import { STAGE_LABELS, STAGE_COLORS, ManufacturingStage } from "@/lib/types";

// Mock data - will be replaced with API calls
const mockStats = {
  newOrders: 12,
  inTufting: 5,
  qcPending: 3,
  readyToShip: 8,
  totalActive: 28,
  completedThisWeek: 15,
};

const mockRecentWorkOrders = [
  {
    id: "wo_1",
    title: "Custom Moroccan Rug 5x7",
    stage: "tufting" as ManufacturingStage,
    priority: "high",
    dueDate: "2026-01-25",
  },
  {
    id: "wo_2",
    title: "Vintage Persian 8x10",
    stage: "washing" as ManufacturingStage,
    priority: "normal",
    dueDate: "2026-01-26",
  },
  {
    id: "wo_3",
    title: "Modern Abstract 4x6",
    stage: "qc" as ManufacturingStage,
    priority: "urgent",
    dueDate: "2026-01-22",
  },
  {
    id: "wo_4",
    title: "Bohemian Runner 2x8",
    stage: "packing" as ManufacturingStage,
    priority: "normal",
    dueDate: "2026-01-23",
  },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Manufacturing overview and quick actions
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="New Orders"
          value={mockStats.newOrders}
          icon="📦"
          color="from-blue-500 to-blue-600"
          change="+3 today"
        />
        <KPICard
          title="In Tufting"
          value={mockStats.inTufting}
          icon="🧵"
          color="from-orange-500 to-orange-600"
          change="2 urgent"
        />
        <KPICard
          title="QC Pending"
          value={mockStats.qcPending}
          icon="✅"
          color="from-red-500 to-red-600"
          change="Review needed"
        />
        <KPICard
          title="Ready to Ship"
          value={mockStats.readyToShip}
          icon="🚚"
          color="from-green-500 to-green-600"
          change="+5 this week"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Work Orders */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Priority Work Orders
            </h2>
            <a
              href="/work-orders"
              className="text-sm text-amber-500 hover:text-amber-400"
            >
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {mockRecentWorkOrders.map((wo) => (
              <div
                key={wo.id}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-2 h-2 rounded-full ${STAGE_COLORS[wo.stage]}`}
                  ></span>
                  <div>
                    <p className="text-sm font-medium text-white">{wo.title}</p>
                    <p className="text-xs text-gray-500">
                      {STAGE_LABELS[wo.stage]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-medium ${wo.priority === "urgent" ? "text-red-400" : wo.priority === "high" ? "text-orange-400" : "text-gray-400"}`}
                  >
                    {wo.priority.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">Due: {wo.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Overview */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Stage Overview</h2>
            <a
              href="/kanban"
              className="text-sm text-amber-500 hover:text-amber-400"
            >
              Kanban Board →
            </a>
          </div>
          <div className="space-y-3">
            {(
              [
                "tufting",
                "trimming",
                "washing",
                "finishing",
                "qc",
                "packing",
              ] as ManufacturingStage[]
            ).map((stage) => (
              <div key={stage} className="flex items-center gap-4">
                <div
                  className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]}`}
                ></div>
                <span className="text-sm text-gray-300 flex-1">
                  {STAGE_LABELS[stage]}
                </span>
                <div className="w-32 bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${STAGE_COLORS[stage]}`}
                    style={{ width: `${Math.random() * 80 + 20}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-8">
                  {Math.floor(Math.random() * 10)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition">
            + Create Work Order
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition">
            View Orders
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition">
            Add Artisan
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon,
  color,
  change,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  change: string;
}) {
  return (
    <div className="relative overflow-hidden bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full -translate-y-8 translate-x-8`}
      ></div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{change}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
