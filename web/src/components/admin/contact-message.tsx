import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Loader2, Mail, Phone, Tag, Trash2 } from "lucide-react";
import { apiServerClient } from "#/lib/api";

type MessageStatus = "NEW" | "READ";

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
};

const SUBJECT_LABELS: Record<string, string> = {
  booking: "Booking",
  press: "Prise de contact",
  other: "Autres",
};

export function AdminMessagesTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all messages
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch("/contact", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : (data.data ?? data.items ?? []));
    } catch {
      toast.error("Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleRowClick = async (msg: Message) => {
    setSelected(msg);
    setDialogOpen(true);

    if (msg.status === "NEW") {
      try {
        const res = await apiServerClient.fetch(`/contact/${msg.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "READ" }),
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const updated: Message = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m)),
        );
        setSelected(updated);
      } catch {}
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    setActionLoading(true);
    try {
      const res = await apiServerClient.fetch(`/contact/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setMessages((prev) => prev?.filter((m) => m.id !== id));
      setDialogOpen(false);
      setSelected(null);
      toast.success("Message supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Messages</h2>
          <span className="text-sm text-muted-foreground">
            {(messages ?? []).filter((m) => m.status === "NEW").length} non
            lu(s)
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Aucun message pour l'instant.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages?.map((msg) => (
                <TableRow
                  key={msg.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(msg)}
                >
                  <TableCell className="font-medium">{msg.name}</TableCell>
                  <TableCell>{msg.email}</TableCell>
                  <TableCell>
                    {SUBJECT_LABELS[msg.subject] ?? msg.subject}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {msg.message}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={msg.status === "NEW" ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {msg.status === "NEW" ? "Nouveau" : "Lu"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="text-xl font-semibold leading-tight">
                    Message de {selected.name}
                  </DialogTitle>
                  <Badge
                    variant={
                      selected.status === "NEW" ? "success" : "destructive"
                    }
                    className="shrink-0 mt-0.5"
                  >
                    {selected.status === "NEW" ? "Nouveau" : "Lu"}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 shrink-0" />

                    <a
                      href={`mailto:${selected.email}`}
                      className="hover:text-foreground transition-colors underline underline-offset-2"
                    >
                      {selected.email}
                    </a>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{selected.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="w-4 h-4 shrink-0" />
                    <span>
                      {SUBJECT_LABELS[selected.subject] ?? selected.subject}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Reçu le{" "}
                    {new Date(selected.createdAt).toLocaleString("fr-FR", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleDelete(selected.id)}
                    className="gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Supprimer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
