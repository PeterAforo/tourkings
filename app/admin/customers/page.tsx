"use client";

import { useState, useEffect } from "react";
import { Users, Search, Wallet, Edit, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  wallet: { balance: number; currency: string } | null;
  _count: { bookings: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", role: "CUSTOMER" });
  const [isEditLoading, setIsEditLoading] = useState(false);

  const fetchCustomers = () => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []))
      .catch(() => {});
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setEditForm({
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone || "",
      role: c.role || "CUSTOMER",
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsEditLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) { console.error(err); } finally { setIsEditLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer? This action cannot be undone.")) return;
    try {
      await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      fetchCustomers();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
        <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/15">
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Customer</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Email</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Role</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Wallet Balance</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Bookings</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Joined</th>
                <th className="text-right py-4 px-6 text-on-surface-variant font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">{c.firstName[0]}{c.lastName[0]}</span>
                      </div>
                      <span className="text-on-surface font-medium">{c.firstName} {c.lastName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{c.email}</td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      c.role === "ADMIN" ? "bg-primary/15 text-primary" : "bg-surface-container-highest text-on-surface-variant"
                    )}>
                      {c.role || "CUSTOMER"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Wallet size={14} /> {formatCurrency(c.wallet?.balance || 0, c.wallet?.currency || "GHS")}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{c._count.bookings}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{formatDate(c.createdAt)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors" title="Edit">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-on-surface-variant text-sm text-center py-12">No customers found</p>}
        </div>
      </Card>

      {/* Edit Customer Modal */}
      <Modal isOpen={!!editingCustomer} onClose={() => setEditingCustomer(null)} title="Edit Customer">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="First Name" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} required />
          <Input label="Last Name" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} required />
          <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Role</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <Button type="submit" variant="primary" className="w-full" isLoading={isEditLoading}>Save Changes</Button>
        </form>
      </Modal>
    </div>
  );
}
