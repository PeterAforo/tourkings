"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Star, Edit } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface DestinationItem {
  id: string;
  name: string;
  country: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  featured: boolean;
  _count?: { packages: number };
}

const emptyForm = { name: "", country: "Ghana", description: "", imageUrl: "", featured: false };

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [isLoading, setIsLoading] = useState(false);

  const [editingDest, setEditingDest] = useState<DestinationItem | null>(null);
  const [editFormData, setEditFormData] = useState({ ...emptyForm });
  const [isEditLoading, setIsEditLoading] = useState(false);

  useEffect(() => { fetchDestinations(); }, []);

  const fetchDestinations = () => {
    csrfFetch("/api/admin/destinations")
      .then((r) => r.json())
      .then((d) => setDestinations(d.destinations || []))
      .catch(() => {});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await csrfFetch("/api/admin/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setShowCreate(false);
      fetchDestinations();
      setFormData({ ...emptyForm });
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this destination?")) return;
    await csrfFetch(`/api/admin/destinations/${id}`, { method: "DELETE" });
    fetchDestinations();
  };

  const openEdit = (dest: DestinationItem) => {
    setEditingDest(dest);
    setEditFormData({
      name: dest.name,
      country: dest.country,
      description: dest.description || "",
      imageUrl: dest.imageUrl || "",
      featured: dest.featured,
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDest) return;
    setIsEditLoading(true);
    try {
      const res = await csrfFetch(`/api/admin/destinations/${editingDest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditingDest(null);
      fetchDestinations();
    } catch (err) { console.error(err); } finally { setIsEditLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold text-on-surface">All Destinations</h2>
        <Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={18} className="mr-2" /> Add Destination</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <Card key={dest.id} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">{dest.name}</h3>
                <p className="text-on-surface-variant text-sm">{dest.country}</p>
              </div>
              {dest.featured && <Star size={16} className="text-primary fill-primary" />}
            </div>
            <p className="text-on-surface-variant text-sm mb-4">{dest._count?.packages || 0} packages</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => openEdit(dest)} className="text-primary hover:text-primary/80">
                <Edit size={14} className="mr-1" /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(dest.id)} className="text-red-500 hover:text-red-400">
                <Trash2 size={14} className="mr-1" /> Delete
              </Button>
            </div>
          </Card>
        ))}
        {destinations.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <p className="text-on-surface-variant">No destinations yet. Add your first one!</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Destination">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Description</label>
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" required />
          </div>
          <Input label="Image URL" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="rounded" />
            <label htmlFor="featured" className="text-sm text-on-surface-variant">Featured destination</label>
          </div>
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>Add Destination</Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingDest} onClose={() => setEditingDest(null)} title="Edit Destination">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="Name" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} required />
          <Input label="Country" value={editFormData.country} onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Description</label>
            <textarea rows={3} value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" required />
          </div>
          <Input label="Image URL" value={editFormData.imageUrl} onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="edit-featured" checked={editFormData.featured} onChange={(e) => setEditFormData({ ...editFormData, featured: e.target.checked })} className="rounded" />
            <label htmlFor="edit-featured" className="text-sm text-on-surface-variant">Featured destination</label>
          </div>
          <Button type="submit" variant="primary" className="w-full" isLoading={isEditLoading}>Save Changes</Button>
        </form>
      </Modal>
    </div>
  );
}
