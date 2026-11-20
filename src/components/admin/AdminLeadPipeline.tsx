import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["contact_form_submissions"]["Row"];
const stages = ["new", "qualified", "contacted", "quotation", "won", "lost"];

function LeadCard({ lead }: { lead: Lead }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const result = await supabase.from("contact_form_submissions").update({
        sales_stage: String(data.get("stage")),
        follow_up_notes: String(data.get("notes")).trim(),
      }).eq("id", lead.id).select("id").single();
      if (result.error) throw result.error;
      await queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    } catch {
      setError("Could not save the lead. Check access and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{lead.name}</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>{[lead.business_location, lead.business_category, lead.email, lead.phone].filter(Boolean).join(" · ")}</p>
        <p>{lead.source_url ? "Sourced prospect" : "Website inquiry"} · {new Date(lead.created_at).toLocaleDateString()}</p>
        {lead.source_url && <a className="underline" href={lead.source_url} target="_blank" rel="noreferrer">Public source</a>}
        <p className="whitespace-pre-wrap break-words">{lead.message}</p>
        <form className="space-y-2" onSubmit={save}>
          <label className="block">
            Sales stage
            <select className="ml-2 rounded border bg-background p-1 capitalize" name="stage" defaultValue={lead.sales_stage}>
              {stages.map(stage => <option key={stage} value={stage}>{stage}</option>)}
            </select>
          </label>
          <label className="block">
            Follow-up or quotation notes
            <Textarea name="notes" defaultValue={lead.follow_up_notes} maxLength={4000} />
          </label>
          {error && <p role="alert">{error}</p>}
          <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : "Save follow-up"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminLeadPipeline() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const leads = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_form_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function addProspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const field = (name: string) => String(fields.get(name) ?? "").trim();
    setSaving(true);
    setError("");
    try {
      const { error } = await supabase.from("contact_form_submissions").insert({
        name: field("name"), business_location: field("location"), business_category: field("category"),
        email: field("email"), phone: field("phone") || null, message: field("interest"), source_url: field("source"),
      });
      if (error) throw error;
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    } catch {
      setError("Could not save the prospect. Check access and the public source URL.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Inquiries and prospects</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">Record a sourced prospect</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={addProspect}>
            <label>Business name<Input name="name" required maxLength={100} /></label>
            <label>Location<Input name="location" required maxLength={120} /></label>
            <label>Business category<Input name="category" required maxLength={120} /></label>
            <label>Public source URL<Input name="source" required type="url" maxLength={1000} /></label>
            <label>Public business email<Input name="email" type="email" maxLength={254} /></label>
            <label>Public business phone<Input name="phone" type="tel" maxLength={40} /></label>
            <label className="sm:col-span-2">Product interest or reason for follow-up<Textarea name="interest" required maxLength={4000} /></label>
            {error && <p role="alert" className="sm:col-span-2">{error}</p>}
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save prospect"}</Button>
          </form>
        </CardContent>
      </Card>
      {leads.isPending && <p role="status">Loading leads…</p>}
      {leads.isError && <p role="alert">Could not load the pipeline. Check Supabase access.</p>}
      {leads.data?.length === 0 && <p>No inquiries or prospects yet.</p>}
      {leads.data?.map(lead => <LeadCard key={lead.id} lead={lead} />)}
    </section>
  );
}
