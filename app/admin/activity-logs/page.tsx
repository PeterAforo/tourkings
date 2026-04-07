"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatDate, cn } from "@/lib/utils";

interface LogItem {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  admin: { firstName: string; lastName: string; email: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    csrfFetch(`/api/admin/activity-logs?page=${page}&limit=20`)
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs || []);
        setPagination(d.pagination || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const actionColors: Record<string, string> = {
    CREATE: "bg-emerald-500/20 text-emerald-600",
    UPDATE: "bg-blue-500/20 text-blue-600",
    DELETE: "bg-red-500/20 text-red-600",
    REFUND: "bg-amber-500/20 text-amber-600",
  };

  const getActionColor = (action: string) => {
    const key = Object.keys(actionColors).find((k) =>
      action.toUpperCase().includes(k)
    );
    return key ? actionColors[key] : "bg-surface-container-highest text-on-surface-variant";
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Activity size={24} className="text-primary" />
        <h1 className="text-2xl font-headline font-bold text-on-surface">Activity Logs</h1>
        {pagination && (
          <span className="text-sm text-on-surface-variant ml-auto">
            {pagination.total} total entries
          </span>
        )}
      </motion.div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">No activity logs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/15">
                  <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Admin</th>
                  <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Action</th>
                  <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Entity</th>
                  <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Entity ID</th>
                  <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
                  >
                    <td className="py-3 px-6">
                      <p className="text-on-surface font-medium">
                        {log.admin.firstName} {log.admin.lastName}
                      </p>
                      <p className="text-on-surface-variant text-xs">{log.admin.email}</p>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          getActionColor(log.action)
                        )}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-on-surface-variant">{log.entity || "—"}</td>
                    <td className="py-3 px-6 text-on-surface-variant font-mono text-xs">
                      {log.entityId ? log.entityId.slice(0, 12) + "…" : "—"}
                    </td>
                    <td className="py-3 px-6 text-on-surface-variant">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-surface-container-highest hover:bg-surface-container-highest/80 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm text-on-surface-variant">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page >= pagination.totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-surface-container-highest hover:bg-surface-container-highest/80 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
