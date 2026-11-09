import { useRef, useState } from "react";
import { Facebook, Instagram, Youtube, Linkedin, MessageCircle, Music2, Send, Globe, Plus, Pencil, Trash2, Upload, Save } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const iconOptions = ["facebook", "instagram", "youtube", "linkedin", "whatsapp", "tiktok", "telegram", "globe"] as const;
const IconMap = { facebook: Facebook, instagram: Instagram, youtube: Youtube, linkedin: Linkedin, whatsapp: MessageCircle, tiktok: Music2, telegram: Send, globe: Globe };
const paletteFields = [
  ["brand_red", "Primary red", "#E11D2E"], ["brand_yellow", "Warm yellow", "#FFC107"],
  ["brand_green", "Leaf green", "#0B7D32"], ["brand_charcoal", "Charcoal", "#222222"], ["brand_sand", "Sand", "#F4F1E8"],
] as const;

async function makeLogoTransparent(file: File): Promise<File> {
  if (file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0); bitmap.close();
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = image.data, w = canvas.width, h = canvas.height;
    const seen = new Uint8Array(w * h);
    const queue = new Int32Array(w * h); let head = 0, tail = 0;
    const isMatte = (i: number) => px[i + 3] > 0 && px[i] >= 222 && px[i + 1] >= 222 && px[i + 2] >= 222;
    const enqueue = (index: number) => { if (!seen[index] && isMatte(index * 4)) { seen[index] = 1; queue[tail++] = index; } };
    for (let x = 0; x < w; x++) { enqueue(x); enqueue((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { enqueue(y * w); enqueue(y * w + w - 1); }
    while (head < tail) {
      const i = queue[head++], x = i % w, y = Math.floor(i / w);
      if (x > 0) enqueue(i - 1); if (x + 1 < w) enqueue(i + 1);
      if (y > 0) enqueue(i - w); if (y + 1 < h) enqueue(i + w);
    }
    for (let i = 0; i < seen.length; i++) if (seen[i]) {
      const p = i * 4, min = Math.min(px[p], px[p + 1], px[p + 2]);
      const alpha = min >= 248 ? 0 : 255 - min;
      if (!alpha) { px[p] = px[p + 1] = px[p + 2] = px[p + 3] = 0; continue; }
      const coverage = alpha / 255, matte = 1 - coverage;
      for (let c = 0; c < 3; c++) px[p + c] = Math.max(0, Math.min(255, Math.round((px[p + c] / 255 - matte) / coverage * 255)));
      px[p + 3] = alpha;
    }
    ctx.putImageData(image, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.png`, { type: "image/png" }) : file;
  } catch { return file; }
}

export default function AdminSiteEditor() {
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const { data: settings } = useQuery({ queryKey: ["business-settings"], queryFn: async () => { const { data, error } = await supabase.from("business_settings").select("*").eq("id", 1).single(); if (error) throw error; return data; } });
  const { data: socials = [] } = useQuery({ queryKey: ["social-links"], queryFn: async () => { const { data, error } = await supabase.from("social_media_links").select("*").order("display_order"); if (error) throw error; return data; } });
  const { data: faqs = [] } = useQuery({ queryKey: ["faqs"], queryFn: async () => { const { data, error } = await supabase.from("faqs").select("*").order("display_order"); if (error) throw error; return data; } });
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [faqDraft, setFaqDraft] = useState<{ id?: number; question: string; answer: string; is_active: boolean }>({ question: "", answer: "", is_active: true });
  const [socialDraft, setSocialDraft] = useState<{ id?: number; platform_name: string; icon_name: string; url: string; is_enabled: boolean }>({ platform_name: "", icon_name: "globe", url: "", is_enabled: true });
  const [uploading, setUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"logo_url" | "hero_image_url">("hero_image_url");
  const settingsValues = settings as unknown as Record<string, string | null | undefined> | undefined;
  const value = (key: string) => draft[key] ?? settingsValues?.[key] ?? (paletteFields.find(([k]) => k === key)?.[2] ?? "");

  const saveDesign = async () => {
    const invalid = paletteFields.find(([key]) => !/^#[0-9a-f]{6}$/i.test(value(key)));
    if (invalid) return toast.error(`${invalid[1]} must be a six-digit hex color`);
    const payload = {
      brand_red: value("brand_red"), brand_yellow: value("brand_yellow"), brand_green: value("brand_green"), brand_charcoal: value("brand_charcoal"), brand_sand: value("brand_sand"),
      heading_font: draft.heading_font ?? settingsValues?.heading_font ?? "Montserrat", body_font: draft.body_font ?? settingsValues?.body_font ?? "Inter",
      hero_title_line1: draft.hero_title_line1 ?? settingsValues?.hero_title_line1 ?? "Savor the taste.", hero_title_line2: draft.hero_title_line2 ?? settingsValues?.hero_title_line2 ?? "Indulge in quality.",
      hero_intro: draft.hero_intro ?? settingsValues?.hero_intro ?? "A trusted food distribution partner for homes, hotels, restaurants, and businesses across Palawan since 2017.",
      site_tagline: draft.site_tagline ?? settingsValues?.site_tagline ?? "More than a supplier. A partner in your success.",
    };
    const { error } = await supabase.from("business_settings").update(payload).eq("id", 1);
    if (error) return toast.error(`Could not save design: ${error.message}`);
    await qc.invalidateQueries({ queryKey: ["business-settings"] }); toast.success("Brand design saved");
  };

  const uploadImage = async (source?: File) => {
    if (!source) return;
    if (!source.type.startsWith("image/")) return toast.error("Choose an image file");
    if (source.size > 8 * 1024 * 1024) return toast.error("Images must be smaller than 8 MB");
    setUploading(true);
    const file = uploadTarget === "logo_url" ? await makeLogoTransparent(source) : source;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `site/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error(`Upload failed: ${error.message}`); setUploading(false); return; }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    const publicUrl = uploadTarget === "logo_url" ? `${data.publicUrl}?transparent=1` : data.publicUrl;
    const update = uploadTarget === "logo_url" ? { logo_url: publicUrl } : { hero_image_url: publicUrl };
    const { error: saveError } = await supabase.from("business_settings").update(update).eq("id", 1);
    setUploading(false);
    if (saveError) return toast.error(`Upload succeeded, but saving failed: ${saveError.message}`);
    await qc.invalidateQueries({ queryKey: ["business-settings"] }); toast.success(uploadTarget === "logo_url" ? "Transparent logo uploaded and saved" : "Homepage image uploaded and saved");
  };

  const saveFaq = async () => {
    const question = faqDraft.question.trim(), answer = faqDraft.answer.trim();
    if (!question || !answer) return toast.error("Enter both a question and an answer");
    const payload = { question, answer, is_active: faqDraft.is_active, display_order: faqDraft.id ? faqs.find((item) => item.id === faqDraft.id)?.display_order ?? faqs.length : faqs.length };
    const result = faqDraft.id ? await supabase.from("faqs").update(payload).eq("id", faqDraft.id) : await supabase.from("faqs").insert(payload);
    if (result.error) return toast.error(`FAQ save failed: ${result.error.message}`);
    setFaqDraft({ question: "", answer: "", is_active: true }); await qc.invalidateQueries({ queryKey: ["faqs"] }); toast.success("FAQ saved");
  };
  const deleteFaq = async (id: number) => {
    if (!window.confirm("Delete this FAQ? This cannot be undone.")) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return toast.error(`Could not delete FAQ: ${error.message}`);
    await qc.invalidateQueries({ queryKey: ["faqs"] }); toast.success("FAQ deleted");
  };
  const saveSocial = async () => {
    const platform_name = socialDraft.platform_name.trim();
    if (!platform_name || !socialDraft.url.trim()) return toast.error("Enter a social name and URL");
    let url = socialDraft.url.trim(); if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try { new URL(url); } catch { return toast.error("Enter a valid website URL"); }
    const payload = { platform_name, icon_name: socialDraft.icon_name, url, is_enabled: socialDraft.is_enabled, display_order: socialDraft.id ? socials.find((item) => item.id === socialDraft.id)?.display_order ?? socials.length : socials.length };
    const result = socialDraft.id ? await supabase.from("social_media_links").update(payload).eq("id", socialDraft.id) : await supabase.from("social_media_links").insert(payload);
    if (result.error) return toast.error(`Social link save failed: ${result.error.message}`);
    setSocialDraft({ platform_name: "", icon_name: "globe", url: "", is_enabled: true }); await qc.invalidateQueries({ queryKey: ["social-links"] }); toast.success("Social link saved");
  };
  const deleteSocial = async (id: number) => {
    const { error } = await supabase.from("social_media_links").delete().eq("id", id);
    if (error) return toast.error(`Could not delete link: ${error.message}`);
    await qc.invalidateQueries({ queryKey: ["social-links"] }); toast.success("Social link removed");
  };

  return <div className="space-y-6">
    <div><h2 className="text-xl font-semibold">Website editor</h2><p className="text-sm text-muted-foreground">Manage the visual identity, homepage messaging, social links and FAQs.</p></div>
    <Card><CardHeader><CardTitle>Brand palette, typography &amp; homepage</CardTitle></CardHeader><CardContent className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{paletteFields.map(([key, label, fallback]) => <div key={key} className="space-y-2"><Label htmlFor={key}>{label}</Label><div className="flex gap-2"><Input id={key} type="color" className="h-10 w-14 p-1" value={value(key) || fallback} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}/><Input aria-label={`${label} hex value`} value={value(key) || fallback} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}/></div></div>)}</div>
      <div className="grid gap-4 sm:grid-cols-2">{([["heading_font", "Heading font", "Montserrat"], ["body_font", "Body font", "Inter"]] as const).map(([key, label, fallback]) => <div key={key} className="space-y-2"><Label>{label}</Label><Select value={draft[key] ?? settingsValues?.[key] ?? fallback} onValueChange={(v) => setDraft((d) => ({ ...d, [key]: v }))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["Montserrat", "Inter", "Poppins", "Roboto", "Lato"].map((font) => <SelectItem key={font} value={font}>{font}</SelectItem>)}</SelectContent></Select></div>)}</div>
      <div className="space-y-3 border-t pt-4"><h3 className="font-semibold">Homepage messaging</h3><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label>Headline — first line</Label><Input value={value("hero_title_line1") || "Savor the taste."} onChange={(e) => setDraft((d) => ({ ...d, hero_title_line1: e.target.value }))}/></div><div className="space-y-2"><Label>Headline — second line</Label><Input value={value("hero_title_line2") || "Indulge in quality."} onChange={(e) => setDraft((d) => ({ ...d, hero_title_line2: e.target.value }))}/></div></div><div className="space-y-2"><Label>Hero introduction</Label><Textarea rows={3} value={value("hero_intro") || "A trusted food distribution partner for homes, hotels, restaurants, and businesses across Palawan since 2017."} onChange={(e) => setDraft((d) => ({ ...d, hero_intro: e.target.value }))}/></div><div className="space-y-2"><Label>Brand tagline</Label><Input value={value("site_tagline") || "More than a supplier. A partner in your success."} onChange={(e) => setDraft((d) => ({ ...d, site_tagline: e.target.value }))}/></div></div>
      <div className="flex flex-wrap items-center gap-3"><Button onClick={saveDesign}><Save className="mr-2 h-4 w-4"/>Save design</Button><input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => { void uploadImage(e.target.files?.[0]); e.currentTarget.value = ""; }}/><Select value={uploadTarget} onValueChange={(v: "logo_url" | "hero_image_url") => setUploadTarget(v)}><SelectTrigger className="w-48"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="hero_image_url">Homepage hero image</SelectItem><SelectItem value="logo_url">Header logo</SelectItem></SelectContent></Select><Button variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()}><Upload className="mr-2 h-4 w-4"/>{uploading ? "Uploading…" : "Upload image"}</Button></div>
      {uploadTarget === "logo_url" && <p className="text-xs text-muted-foreground">White backgrounds are removed from uploaded logos; transparent PNG is recommended. Images max 8 MB.</p>}
      {settingsValues?.[uploadTarget] && <img src={settingsValues[uploadTarget] ?? undefined} alt="Current uploaded site image" className="h-14 max-w-40 object-contain"/>}
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Social links</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="space-y-2">{socials.map((item) => { const Icon = IconMap[item.icon_name as keyof typeof IconMap] ?? Globe; return <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3"><Icon className="h-5 w-5 text-primary"/><div className="min-w-0 flex-1"><strong>{item.platform_name}</strong><div className="truncate text-xs text-muted-foreground">{item.url}</div></div><span className="text-xs">{item.is_enabled ? "Visible" : "Hidden"}</span><Button variant="ghost" size="icon" aria-label={`Edit ${item.platform_name}`} onClick={() => setSocialDraft({ id: item.id, platform_name: item.platform_name, icon_name: item.icon_name, url: item.url, is_enabled: item.is_enabled })}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" aria-label={`Delete ${item.platform_name}`} onClick={() => void deleteSocial(item.id)}><Trash2 className="h-4 w-4"/></Button></div>; })}</div>
      <div className="grid gap-3 rounded-lg bg-muted/50 p-4 md:grid-cols-2"><div className="space-y-2"><Label>Platform label</Label><Input value={socialDraft.platform_name} onChange={(e) => setSocialDraft((d) => ({ ...d, platform_name: e.target.value }))} placeholder="Facebook"/></div><div className="space-y-2"><Label>Lucide icon</Label><Select value={socialDraft.icon_name} onValueChange={(v) => setSocialDraft((d) => ({ ...d, icon_name: v }))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{iconOptions.map((name) => <SelectItem key={name} value={name}>{name[0].toUpperCase() + name.slice(1)}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2 md:col-span-2"><Label>Profile URL</Label><Input value={socialDraft.url} onChange={(e) => setSocialDraft((d) => ({ ...d, url: e.target.value }))} placeholder="https://…"/></div><div className="flex items-center gap-2"><Switch checked={socialDraft.is_enabled} onCheckedChange={(v) => setSocialDraft((d) => ({ ...d, is_enabled: v }))}/><Label>Show on site</Label></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setSocialDraft({ platform_name: "", icon_name: "globe", url: "", is_enabled: true })}>Clear</Button><Button onClick={() => void saveSocial()}>{socialDraft.id ? "Update link" : <><Plus className="mr-2 h-4 w-4"/>Add link</>}</Button></div></div>
      <p className="text-xs text-muted-foreground">Icons: Facebook, Instagram, YouTube, LinkedIn, WhatsApp, TikTok, Telegram, and Globe.</p>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Frequently asked questions</CardTitle></CardHeader><CardContent className="space-y-4">
      {faqs.map((faq) => <div key={faq.id} className="flex items-start gap-3 rounded-lg border p-3"><div className="min-w-0 flex-1"><p className="font-semibold">{faq.question}</p><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{faq.answer}</p><span className="text-xs text-muted-foreground">{faq.is_active ? "Published" : "Hidden"}</span></div><Button variant="ghost" size="icon" aria-label="Edit FAQ" onClick={() => setFaqDraft({ id: faq.id, question: faq.question, answer: faq.answer, is_active: faq.is_active ?? true })}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" aria-label="Delete FAQ" onClick={() => void deleteFaq(faq.id)}><Trash2 className="h-4 w-4"/></Button></div>)}
      <div className="space-y-3 rounded-lg bg-muted/50 p-4"><h3 className="font-semibold">{faqDraft.id ? "Edit FAQ" : "Add a question"}</h3><div className="space-y-2"><Label>Question</Label><Input value={faqDraft.question} onChange={(e) => setFaqDraft((d) => ({ ...d, question: e.target.value }))} placeholder="How do I place an order?"/></div><div className="space-y-2"><Label>Answer</Label><Textarea rows={4} value={faqDraft.answer} onChange={(e) => setFaqDraft((d) => ({ ...d, answer: e.target.value }))} placeholder="Write a clear answer…"/></div><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Switch checked={faqDraft.is_active} onCheckedChange={(v) => setFaqDraft((d) => ({ ...d, is_active: v }))}/><Label>Publish on site</Label></div><div className="flex gap-2"><Button variant="outline" onClick={() => setFaqDraft({ question: "", answer: "", is_active: true })}>Cancel</Button><Button onClick={() => void saveFaq()}>{faqDraft.id ? "Save changes" : "Add FAQ"}</Button></div></div></div>
    </CardContent></Card>
  </div>;
}
