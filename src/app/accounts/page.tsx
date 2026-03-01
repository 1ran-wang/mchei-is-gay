"use client";
import { useState, useEffect, useCallback } from "react";

interface Account {
  id: number;
  batch: string | null;
  username: string;
  password: string | null;
  steamId: string | null;
  usedBy: string | null;
  email: string | null;
  emailPassword: string | null;
  emailProvider: string | null;
  notes: string | null;
}

function CopyCell({ label, value }: { label: string; value: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <div
      className="group flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800/60 hover:bg-gray-700/80 cursor-pointer transition-all duration-150 active:scale-95"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      title={`Copy ${label}`}
    >
      <span className="text-gray-500 text-xs shrink-0 w-16">{label}</span>
      <span className={`font-mono text-xs truncate transition-colors ${copied ? "text-green-400" : "text-gray-200 group-hover:text-white"}`}>
        {copied ? "✓ Copied!" : value}
      </span>
      <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

function TableCopy({ value }: { value: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-gray-700">—</span>;
  return (
    <span
      className={`font-mono cursor-pointer hover:text-blue-400 transition-colors active:scale-95 ${copied ? "text-green-400" : "text-gray-300"}`}
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      title="Click to copy"
    >{copied ? "✓" : value}</span>
  );
}

const PLAYER_COLORS: Record<string, string> = {
  WANGYIRAN: "border-blue-500/50 bg-blue-500/5",
  HUCAIRUI: "border-red-500/50 bg-red-500/5",
  JAY: "border-green-500/50 bg-green-500/5",
};

const PLAYER_BADGE: Record<string, string> = {
  WANGYIRAN: "bg-blue-500/20 text-blue-400",
  HUCAIRUI: "bg-red-500/20 text-red-400",
  JAY: "bg-green-500/20 text-green-400",
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Account>>({});
  const [adding, setAdding] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({ username: "" });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const fetchAccounts = useCallback(async () => {
    const url = filter ? `/api/accounts?usedBy=${filter}` : "/api/accounts";
    const res = await fetch(url);
    const data = await res.json();
    setAccounts(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const startEdit = (acc: Account) => { setEditing(acc.id); setEditData({ ...acc }); };

  const saveEdit = async () => {
    if (!editing) return;
    await fetch(`/api/accounts/${editing}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editData) });
    setEditing(null);
    fetchAccounts();
  };

  const deleteAccount = async (id: number) => {
    if (!confirm("Delete this account?")) return;
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    fetchAccounts();
  };

  const addAccount = async () => {
    if (!newAccount.username) return;
    await fetch("/api/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newAccount) });
    setAdding(false);
    setNewAccount({ username: "" });
    fetchAccounts();
  };

  const filtered = accounts.filter(acc => {
    if (!search) return true;
    const s = search.toLowerCase();
    return [acc.username, acc.password, acc.steamId, acc.email, acc.emailPassword, acc.batch, acc.notes]
      .some(v => v?.toLowerCase().includes(s));
  }).sort((a, b) => {
    // Extract batch number for sorting (highest first)
    const numA = parseInt(a.batch?.match(/\d+/)?.[0] || "0");
    const numB = parseInt(b.batch?.match(/\d+/)?.[0] || "0");
    return numB - numA;
  });

  const editFields: (keyof Account)[] = ["batch", "username", "password", "steamId", "usedBy", "email", "emailPassword", "emailProvider", "notes"];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← DotaWatch</a>
            <h1 className="text-3xl font-bold mt-1">Accounts</h1>
            <p className="text-gray-500 text-sm mt-1">{accounts.length} accounts • Click any field to copy</p>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:border-gray-500"
            />
            <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
              <option value="">All Players</option>
              <option value="WANGYIRAN">WANGYIRAN</option>
              <option value="HUCAIRUI">HUCAIRUI</option>
              <option value="JAY">JAY</option>
            </select>
            <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("cards")} className={`px-3 py-2 text-sm ${viewMode === "cards" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-white"}`} title="Card view">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button onClick={() => setViewMode("table")} className={`px-3 py-2 text-sm ${viewMode === "table" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-white"}`} title="Table view">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" /></svg>
              </button>
            </div>
            <button onClick={() => setAdding(true)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Add</button>
          </div>
        </div>

        {/* Add form */}
        {adding && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium mb-3">New Account</h3>
            <div className="grid grid-cols-3 gap-3">
              {editFields.map(f => (
                <div key={f}>
                  <label className="text-xs text-gray-500 block mb-1">{f}</label>
                  <input className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:border-gray-400"
                    value={(newAccount as Record<string, string>)[f] || ""} onChange={e => setNewAccount({ ...newAccount, [f]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={addAccount} className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded text-sm transition-colors">Save</button>
              <button onClick={() => setAdding(false)} className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded text-sm transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? <p className="text-gray-500">Loading...</p> : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((acc) => {
              const cardColor = acc.usedBy ? (PLAYER_COLORS[acc.usedBy] || "border-gray-700") : "border-gray-700 bg-gray-900/20";
              const badgeColor = acc.usedBy ? (PLAYER_BADGE[acc.usedBy] || "bg-gray-700 text-gray-300") : "bg-gray-700 text-gray-400";

              if (editing === acc.id) {
                return (
                  <div key={acc.id} className="border border-yellow-500/50 bg-yellow-500/5 rounded-xl p-4">
                    <div className="grid gap-2">
                      {editFields.map(f => (
                        <div key={f} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-20 shrink-0">{f}</span>
                          <input className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-full font-mono focus:outline-none focus:border-gray-400"
                            value={(editData as Record<string, string>)[f] || ""} onChange={e => setEditData({ ...editData, [f]: e.target.value || null })} />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs transition-colors">Save</button>
                      <button onClick={() => setEditing(null)} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs transition-colors">Cancel</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={acc.id} className={`border rounded-xl p-4 transition-colors hover:border-opacity-80 ${cardColor}`}>
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {acc.usedBy && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{acc.usedBy}</span>}
                      {acc.batch && <span className="text-xs text-gray-600">{acc.batch}</span>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(acc)} className="text-gray-600 hover:text-blue-400 p-1 transition-colors" title="Edit">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => deleteAccount(acc.id)} className="text-gray-600 hover:text-red-400 p-1 transition-colors" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Copyable fields */}
                  <div className="space-y-1.5">
                    <CopyCell label="User" value={acc.username} />
                    <CopyCell label="Pass" value={acc.password} />
                    <CopyCell label="Steam" value={acc.steamId} />
                    <CopyCell label="Email" value={acc.email} />
                    <CopyCell label="E-Pass" value={acc.emailPassword} />
                    <CopyCell label="Provider" value={acc.emailProvider} />
                    {acc.notes && <CopyCell label="Notes" value={acc.notes} />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">#</th>
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">Batch</th>
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">User</th>
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">Password</th>
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">Steam ID</th>
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">Used By</th>
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">Email</th>
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">E-Pass</th>
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">Provider</th>
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">Notes</th>
                  <th className="text-left p-2 text-gray-500 font-medium text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((acc, i) => (
                  <tr key={acc.id} className={`border-b border-gray-800/50 hover:bg-gray-900/30 ${i % 2 === 0 ? "bg-gray-900/10" : ""}`}>
                    <td className="p-2 text-gray-600 text-xs">{i + 1}</td>
                    <td className="p-2 text-xs"><TableCopy value={acc.batch} /></td>
                    <td className="p-2 text-xs"><TableCopy value={acc.username} /></td>
                    <td className="p-2 text-xs"><TableCopy value={acc.password} /></td>
                    <td className="p-2 text-xs"><TableCopy value={acc.steamId} /></td>
                    <td className="p-2 text-xs">{acc.usedBy ? <span className={`px-1.5 py-0.5 rounded text-xs ${PLAYER_BADGE[acc.usedBy] || "bg-gray-700 text-gray-400"}`}>{acc.usedBy}</span> : <span className="text-gray-700">&mdash;</span>}</td>
                    <td className="p-2 text-xs"><TableCopy value={acc.email} /></td>
                    <td className="p-2 text-xs"><TableCopy value={acc.emailPassword} /></td>
                    <td className="p-2 text-xs"><TableCopy value={acc.emailProvider} /></td>
                    <td className="p-2 text-xs"><TableCopy value={acc.notes} /></td>
                    <td className="p-2 text-xs flex gap-1">
                      <button onClick={() => startEdit(acc)} className="text-blue-400 hover:text-blue-300">Edit</button>
                      <button onClick={() => deleteAccount(acc.id)} className="text-red-400 hover:text-red-300">Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="text-center text-gray-700 text-xs mt-8 pb-4">
          Click any field to copy to clipboard
        </footer>
      </div>
    </main>
  );
}
