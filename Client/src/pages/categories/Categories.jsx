import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryApi";

import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorMessage from "../../components/ErrorMessage";

const Categories = () => {
  const { isAdmin } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const [saving, setSaving] = useState(false);

  // Load categories
  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getCategories();

      let list = response.data || [];

      // Search filter
      if (search) {
        list = list.filter((category) =>
          category.name.toLowerCase().includes(search.toLowerCase()),
        );
      }

      // Status filter
      if (status) {
        list = list.filter((category) => category.status === status);
      }

      setCategories(list);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Load when status changes
  useEffect(() => {
    load();
  }, [status]);

  // Load when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  // Create / Update category
  const submit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      if (editing) {
        await updateCategory(editing._id, form);
      } else {
        await createCategory(form);
      }

      setModal(false);
      setEditing(null);

      setForm({
        name: "",
        description: "",
        status: "active",
      });

      load();
    } catch (error) {
      setError(error.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Edit category
  const edit = (category) => {
    setEditing(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
      status: category.status || "active",
    });

    setModal(true);
  };

  // Delete / deactivate category
  const remove = async (id) => {
    if (!window.confirm("Delete/deactivate this category?")) {
      return;
    }

    try {
      await deleteCategory(id);

      load();
    } catch (error) {
      setError(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>

          <p className="text-sm text-slate-500">Manage product categories</p>
        </div>

        {isAdmin && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setEditing(null);

              setForm({
                name: "",
                description: "",
                status: "active",
              });

              setModal(true);
            }}
          >
            + Add Category
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category..."
          className="block w-full min-w-0 flex-1 rounded-lg border bg-white px-4 py-2.5"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full min-w-0 rounded-lg border bg-white px-4 py-2.5 sm:w-auto"
        >
          <option value="">All status</option>

          <option value="active">Active</option>

          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Error */}
      <ErrorMessage message={error} />

      {/* Category List */}
      {loading ? (
        <Loader />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories" />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>

                <th className="px-4 py-3">Description</th>

                <th className="px-4 py-3">Status</th>

                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold">{category.name}</td>

                  <td className="px-4 py-3">{category.description || "-"}</td>

                  <td className="px-4 py-3">{category.status}</td>

                  <td className="px-4 py-3">
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => edit(category)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => remove(category._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={submit} className="space-y-4">
          {/* Category Name */}
          <input
            required
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            placeholder="Category name"
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
          />

          {/* Description */}
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            placeholder="Description"
            className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
          />

          {/* Status - Edit only */}
          {editing && (
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
              className="block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            >
              <option value="active">Active</option>

              <option value="inactive">Inactive</option>
            </select>
          )}

          {/* Submit */}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
