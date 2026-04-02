"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { formatCurrency, cn } from "@/lib/utils";

interface PackageItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  groupSize: number;
  images: string[];
  included: string[];
  excluded: string[];
  featured: boolean;
  active: boolean;
  destinationId: string;
  destination: { name: string };
  _count?: { bookings: number };
}

interface Destination {
  id: string;
  name: string;
}

const emptyForm = {
  title: "",
  description: "",
  destinationId: "",
  price: "",
  currency: "GHS",
  duration: "",
  groupSize: "10",
  images: "",
  included: "",
  excluded: "",
  featured: false,
  active: true,
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageItem | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPackages();
    fetchDestinations();
  }, []);

  const fetchPackages = () => {
    fetch("/api/admin/packages")
      .then((r) => r.json())
      .then((d) => setPackages(d.packages || []))
      .catch(() => {});
  };

  const fetchDestinations = () => {
    fetch("/api/admin/destinations")
      .then((r) => r.json())
      .then((d) => setDestinations(d.destinations || []))
      .catch(() => {});
  };

  const openCreate = () => {
    setFormData({ ...emptyForm });
    setEditingPkg(null);
    setShowCreate(true);
  };

  const openEdit = (pkg: PackageItem) => {
    setEditingPkg(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description,
      destinationId: pkg.destinationId,
      price: String(pkg.price),
      currency: pkg.currency,
      duration: pkg.duration,
      groupSize: String(pkg.groupSize),
      images: (pkg.images || []).join(", "),
      included: (pkg.included || []).join("\n"),
      excluded: (pkg.excluded || []).join("\n"),
      featured: pkg.featured,
      active: pkg.active,
    });
    setShowCreate(true);
  };

  const closeModal = () => {
    setShowCreate(false);
    setEditingPkg(null);
    setFormData({ ...emptyForm });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      title: formData.title,
      description: formData.description,
      destinationId: formData.destinationId,
      price: parseFloat(formData.price),
      currency: formData.currency,
      duration: formData.duration,
      groupSize: parseInt(formData.groupSize),
      images: formData.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      included: formData.included.split("\n").filter(Boolean),
      excluded: formData.excluded.split("\n").filter(Boolean),
      featured: formData.featured,
      active: formData.active,
    };

    try {
      const url = editingPkg
        ? `/api/admin/packages/${editingPkg.id}`
        : "/api/admin/packages";
      await fetch(url, {
        method: editingPkg ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      closeModal();
      fetchPackages();
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

  const handleToggle = async (
    id: string,
    field: "active" | "featured",
    current: boolean
  ) => {
    await fetch(`/api/admin/packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !current }),
    });
    fetchPackages();
  };

  const set = (key: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const filtered = packages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectClass =
    "w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const textareaClass =
    "w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
          />
          <input
            type="text"
            placeholder="Search packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={18} className="mr-2" /> Add Package
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/15">
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">
                  Package
                </th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">
                  Destination
                </th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">
                  Price
                </th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">
                  Duration
                </th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">
                  Status
                </th>
                <th className="text-right py-4 px-6 text-on-surface-variant font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
                >
                  <td className="py-4 px-6">
                    <p className="text-on-surface font-medium">{pkg.title}</p>
                    {pkg.featured && (
                      <span className="text-primary text-xs">Featured</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">
                    {pkg.destination?.name}
                  </td>
                  <td className="py-4 px-6 text-primary font-medium">
                    {formatCurrency(pkg.price, pkg.currency)}
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">
                    {pkg.duration}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggle(pkg.id, "active", pkg.active)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        pkg.active
                          ? "bg-emerald-500/20 text-emerald-600"
                          : "bg-red-500/20 text-red-600"
                      )}
                    >
                      {pkg.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          handleToggle(pkg.id, "featured", pkg.featured)
                        }
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          pkg.featured
                            ? "text-primary bg-primary/10"
                            : "text-on-surface-variant hover:text-primary"
                        )}
                        title={
                          pkg.featured ? "Unfeature" : "Feature"
                        }
                      >
                        {pkg.featured ? (
                          <ToggleRight size={16} />
                        ) : (
                          <ToggleLeft size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(pkg)}
                        className="p-2 rounded-lg text-on-surface-variant hover:text-primary transition-all"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-2 rounded-lg text-on-surface-variant hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Package size={40} className="text-on-surface-variant/30" />
              <p className="text-on-surface-variant text-sm">
                No packages found
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showCreate}
        onClose={closeModal}
        title={editingPkg ? "Edit Package" : "Add New Package"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => set("description", e.target.value)}
              className={textareaClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              Destination
            </label>
            <select
              value={formData.destinationId}
              onChange={(e) => set("destinationId", e.target.value)}
              className={selectClass}
              required
            >
              <option value="">Select a destination</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => set("price", e.target.value)}
              required
            />
            <Input
              label="Currency"
              value={formData.currency}
              onChange={(e) => set("currency", e.target.value)}
            />
            <Input
              label="Duration"
              placeholder="e.g. 3 Days"
              value={formData.duration}
              onChange={(e) => set("duration", e.target.value)}
              required
            />
          </div>

          <Input
            label="Group Size"
            type="number"
            value={formData.groupSize}
            onChange={(e) => set("groupSize", e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              Images (comma-separated URLs)
            </label>
            <textarea
              rows={2}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              value={formData.images}
              onChange={(e) => set("images", e.target.value)}
              className={textareaClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                Included (one per line)
              </label>
              <textarea
                rows={3}
                value={formData.included}
                onChange={(e) => set("included", e.target.value)}
                className={textareaClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                Excluded (one per line)
              </label>
              <textarea
                rows={3}
                value={formData.excluded}
                onChange={(e) => set("excluded", e.target.value)}
                className={textareaClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-on-surface-variant">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => set("active", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-on-surface-variant">Active</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            {editingPkg ? "Update Package" : "Create Package"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
