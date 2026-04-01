"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { formatCurrency, cn } from "@/lib/utils";

interface PackageItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  duration: string;
  featured: boolean;
  active: boolean;
  destination: { name: string };
  _count?: { bookings: number };
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", destinationId: "", price: "", duration: "", groupSize: "10",
    included: "", excluded: "", featured: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = () => {
    fetch("/api/admin/packages")
      .then((r) => r.json())
      .then((d) => setPackages(d.packages || []))
      .catch(() => {});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          groupSize: parseInt(formData.groupSize),
          included: formData.included.split("\n").filter(Boolean),
          excluded: formData.excluded.split("\n").filter(Boolean),
        }),
      });
      setShowCreate(false);
      fetchPackages();
      setFormData({ title: "", description: "", destinationId: "", price: "", duration: "", groupSize: "10", included: "", excluded: "", featured: false });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
    fetchPackages();
  };

  const handleToggle = async (id: string, field: "active" | "featured", value: boolean) => {
    await fetch(`/api/admin/packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !value }),
    });
    fetchPackages();
  };

  const filtered = packages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          <input type="text" placeholder="Search packages..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} className="mr-2" /> Add Package
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/15">
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Package</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Destination</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Price</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Duration</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Status</th>
                <th className="text-right py-4 px-6 text-on-surface-variant font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pkg) => (
                <tr key={pkg.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-on-surface font-medium">{pkg.title}</p>
                      {pkg.featured && <span className="text-primary text-xs">Featured</span>}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{pkg.destination.name}</td>
                  <td className="py-4 px-6 text-primary font-medium">{formatCurrency(pkg.price, pkg.currency)}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{pkg.duration}</td>
                  <td className="py-4 px-6">
                    <button onClick={() => handleToggle(pkg.id, "active", pkg.active)}
                      className={cn("px-3 py-1 rounded-full text-xs font-medium", pkg.active ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600")}>
                      {pkg.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleToggle(pkg.id, "featured", pkg.featured)}
                        className={cn("p-2 rounded-lg transition-all", pkg.featured ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary")}>
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} className="p-2 rounded-lg text-on-surface-variant hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-on-surface-variant text-sm text-center py-12">No packages found</p>
          )}
        </div>
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Package">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Description</label>
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (GHS)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            <Input label="Duration" placeholder="e.g. 3 Days" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required />
          </div>
          <Input label="Group Size" type="number" value={formData.groupSize} onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Included (one per line)</label>
            <textarea rows={3} value={formData.included} onChange={(e) => setFormData({ ...formData, included: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="rounded" />
            <label htmlFor="featured" className="text-sm text-on-surface-variant">Featured package</label>
          </div>
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>Create Package</Button>
        </form>
      </Modal>
    </div>
  );
}
