import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * PUBLIC_INTERFACE
 * TaskForm
 *
 * Form for creating or editing a task.
 * Includes fields: title, description, status, due_date.
 *
 * Props:
 * - initial: initial task values (for editing)
 * - onCancel: function()
 * - onSubmit: function(values) => void
 * - submitLabel: string button label
 */
export default function TaskForm({
  initial = null,
  onCancel,
  onSubmit,
  submitLabel = "Save Task",
}) {
  const [values, setValues] = useState({
    title: "",
    description: "",
    status: "todo",
    due_date: "",
  });
  const [errors, setErrors] = useState({});
  const titleInputId = "task-title";
  const descInputId = "task-description";
  const statusSelectId = "task-status";
  const dueDateId = "task-due-date";

  useEffect(() => {
    if (initial) {
      setValues({
        title: initial.title || "",
        description: initial.description || "",
        status: initial.status || "todo",
        due_date: initial.due_date || "",
      });
    }
  }, [initial]);

  useEffect(() => {
    // focus first field when mounting
    const el = document.getElementById(titleInputId);
    if (el) {
      try {
        el.focus();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const validate = () => {
    const e = {};
    if (!values.title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit &&
      onSubmit({
        title: values.title.trim(),
        description: values.description.trim() || null,
        status: values.status,
        due_date: values.due_date || null,
      });
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCancel && onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={onKeyDown} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor={titleInputId} className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id={titleInputId}
            type="text"
            value={values.title}
            onChange={handleChange("title")}
            placeholder="Enter task title"
            aria-invalid={errors.title ? "true" : "false"}
            aria-describedby={errors.title ? `${titleInputId}-error` : undefined}
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? "border-red-300" : "border-gray-200"
            }`}
          />
          {errors.title && (
            <p id={`${titleInputId}-error`} className="mt-1 text-xs text-red-600">{errors.title}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={descInputId} className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id={descInputId}
            rows={3}
            value={values.description}
            onChange={handleChange("description")}
            placeholder="Add more details..."
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor={statusSelectId} className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id={statusSelectId}
            value={values.status}
            onChange={handleChange("status")}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label htmlFor={dueDateId} className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            id={dueDateId}
            type="date"
            value={values.due_date || ""}
            onChange={handleChange("due_date")}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
          aria-label="Cancel and close task form"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary rounded-lg px-4 py-2 text-sm"
          aria-label={submitLabel}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

TaskForm.propTypes = {
  initial: PropTypes.object,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  submitLabel: PropTypes.string,
};
