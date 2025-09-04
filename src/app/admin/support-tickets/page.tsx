"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import GlassPanel from "@/components/ui/GlassPanel";
import { SupportTicket, TicketStatus, TicketCategory } from "@/types/support";
import { useToast } from "@/components/ui/Toast";
import { useAdminPageLoading } from "@/hooks/useRedirects";

export default function SupportTicketsPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [filter, setFilter] = useState({
    status: "" as TicketStatus | "",
    category: "" as TicketCategory | "",
  });
  const [responseText, setResponseText] = useState("");
  const [updating, setUpdating] = useState(false);

  // Simple admin check with loading
  const { isLoading: authLoading, isAdmin } = useAdminPageLoading();

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      if (filter.category) params.append("category", filter.category);

      const response = await fetch(`/api/admin/support-tickets?${params}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets);
      } else {
        showToast({ message: "Failed to fetch tickets", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      showToast({ message: "Failed to fetch tickets", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [filter.status, filter.category, showToast]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) return;

    fetchTickets();
  }, [authLoading, isAdmin, fetchTickets]);

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/support-tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        showToast({ message: "Ticket status updated", type: "success" });
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.ticket);
        }
      } else {
        showToast({ message: "Failed to update ticket", type: "error" });
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      showToast({ message: "Failed to update ticket", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const sendResponse = async (ticketId: string) => {
    if (!responseText.trim()) {
      showToast({ message: "Please enter a response", type: "error" });
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/support-tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: {
            message: responseText,
            authorId: session?.user?.id,
            authorEmail: session?.user?.email,
            authorName: session?.user?.name,
            isAdmin: true,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast({ message: "Response sent", type: "success" });
        setResponseText("");
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.ticket);
        }
      } else {
        showToast({ message: "Failed to send response", type: "error" });
      }
    } catch (error) {
      console.error("Error sending response:", error);
      showToast({ message: "Failed to send response", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "bg-blue-500/20 text-blue-400";
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-400";
      case "resolved":
        return "bg-green-500/20 text-green-400";
      case "closed":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  const getCategoryIcon = (category: TicketCategory) => {
    switch (category) {
      case "bug":
        return "🐛";
      case "feature_request":
        return "✨";
      case "account":
        return "👤";
      case "billing":
        return "💳";
      default:
        return "📝";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/60">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
        Support Tickets
      </h1>

      {/* Filters */}
      <GlassPanel className="p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <select
            value={filter.status}
            onChange={(e) =>
              setFilter({
                ...filter,
                status: e.target.value as TicketStatus | "",
              })
            }
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 font-body"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filter.category}
            onChange={(e) =>
              setFilter({
                ...filter,
                category: e.target.value as TicketCategory | "",
              })
            }
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 font-body"
          >
            <option value="">All Categories</option>
            <option value="bug">Bug Report</option>
            <option value="feature_request">Feature Request</option>
            <option value="account">Account Issue</option>
            <option value="billing">Billing Question</option>
            <option value="other">Other</option>
          </select>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white/80 mb-3">
            Tickets ({tickets.length})
          </h2>

          {tickets.length === 0 ? (
            <GlassPanel className="p-6 text-center text-white/60">
              No tickets found
            </GlassPanel>
          ) : (
            tickets.map((ticket) => (
              <GlassPanel
                key={ticket.id}
                className={`p-4 cursor-pointer transition-all hover:border-purple-400/50 ${
                  selectedTicket?.id === ticket.id ? "border-purple-400" : ""
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getCategoryIcon(ticket.category)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-white/40">
                    {ticket.createdAt &&
                      new Date(
                        ticket.createdAt.seconds * 1000
                      ).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-white font-semibold mb-1 line-clamp-1">
                  {ticket.subject}
                </h3>
                <p className="text-white/60 text-sm line-clamp-2 mb-2">
                  {ticket.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    {ticket.userEmail}
                  </span>
                  {ticket.responses && ticket.responses.length > 0 && (
                    <span className="text-xs text-purple-400">
                      {ticket.responses.length} response(s)
                    </span>
                  )}
                </div>
              </GlassPanel>
            ))
          )}
        </div>

        {/* Ticket Details */}
        <div>
          <h2 className="text-xl font-semibold text-white/80 mb-3">
            Ticket Details
          </h2>

          {selectedTicket ? (
            <GlassPanel className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {getCategoryIcon(selectedTicket.category)}
                  </span>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedTicket.subject}
                  </h3>
                </div>

                <div className="flex gap-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/60">
                    {selectedTicket.category.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <div className="text-sm text-white/60 space-y-1 mb-4">
                  <p>User: {selectedTicket.userEmail}</p>
                  <p>
                    Created:{" "}
                    {selectedTicket.createdAt &&
                      new Date(
                        selectedTicket.createdAt.seconds * 1000
                      ).toLocaleString()}
                  </p>
                  {selectedTicket.brandId && (
                    <p>Brand ID: {selectedTicket.brandId}</p>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-white/5 mb-4">
                  <p className="text-white/80 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Status Update */}
                <div className="mb-4">
                  <label className="block text-white/60 text-sm mb-2">
                    Update Status
                  </label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      updateTicketStatus(
                        selectedTicket.id,
                        e.target.value as TicketStatus
                      )
                    }
                    disabled={updating}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 font-body disabled:opacity-50"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Responses */}
                {selectedTicket.responses &&
                  selectedTicket.responses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-white/60 text-sm mb-2">Responses</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedTicket.responses.map((response, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              response.isAdmin
                                ? "bg-purple-500/10 border border-purple-500/30"
                                : "bg-white/5 border border-white/10"
                            }`}
                          >
                            <div className="flex justify-between text-xs text-white/40 mb-1">
                              <span>
                                {response.authorEmail}{" "}
                                {response.isAdmin && "(Admin)"}
                              </span>
                              <span>
                                {response.createdAt &&
                                  new Date(
                                    response.createdAt.seconds * 1000
                                  ).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-white/80 text-sm">
                              {response.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Add Response */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Add Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 font-body placeholder-white/30 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={() => sendResponse(selectedTicket.id)}
                    disabled={updating || !responseText.trim()}
                    className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-body disabled:opacity-50"
                  >
                    Send Response
                  </button>
                </div>
              </div>
            </GlassPanel>
          ) : (
            <GlassPanel className="p-6 text-center text-white/60">
              Select a ticket to view details
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
