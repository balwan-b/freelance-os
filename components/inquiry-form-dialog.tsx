"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InquiryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    name: string;
    service: string;
    email?: string;
    phone?: string;
    budget?: string;
    notes?: string;
    tags: string[];
  }) => Promise<void> | void;
}

export function InquiryFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: InquiryFormDialogProps) {
  const [form, setForm] = useState({
    name: "",
    service: "",
    email: "",
    phone: "",
    budget: "",
    notes: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        service: "",
        email: "",
        phone: "",
        budget: "",
        notes: "",
        tags: "",
      });
      setSubmitting(false);
    }
  }, [open]);

  async function handleSubmit() {
    if (!form.name.trim() || !form.service.trim()) return;
    setSubmitting(true);
    await onSubmit({
      name: form.name.trim(),
      service: form.service.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      budget: form.budget.trim() || undefined,
      notes: form.notes.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    onOpenChange(false);
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Inquiry</DialogTitle>
          <DialogDescription>
            Capture a lead so it can move through your workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="inquiry-name">Client Name</Label>
              <Input
                id="inquiry-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inquiry-service">Service</Label>
              <Input
                id="inquiry-service"
                value={form.service}
                onChange={(e) => setForm((prev) => ({ ...prev, service: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="inquiry-email">Email</Label>
              <Input
                id="inquiry-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inquiry-phone">Phone</Label>
              <Input
                id="inquiry-phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="inquiry-budget">Budget</Label>
              <Input
                id="inquiry-budget"
                value={form.budget}
                onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inquiry-tags">Tags</Label>
              <Input
                id="inquiry-tags"
                placeholder="urgent, redesign"
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inquiry-notes">Notes</Label>
            <Textarea
              id="inquiry-notes"
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!form.name.trim() || !form.service.trim() || submitting}>
            {submitting ? "Saving..." : "Create Inquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
