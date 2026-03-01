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

function CopyCell({ value, className = "" }: { value: string | null; className?: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-gray-700">—</span>;
  return (
    <span
      className={`cursor-pointer hover:text-blue-400 transition-colors ${copied ? "text-green-400" : ""} ${className}`}
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title="Click to copy"
    >
      {copied ? "✓ Copied!" : value}
    </span>
  );
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Account>>({});
  const [adding, setAdding] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({ username: "" });
  const [loading, setLoading] = useState(true);

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

  const fields: (keyof Account)[] = ["batch", "username", "password", "steamId", "usedBy", "email", "emailPassword", "emailProvider", "notes"];
  const copyableFields = ["username", "password", "email", "emailPassword"];

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/" className="text-gray-500 hover:text-gray-300 text-sm">← DotaWatch</a>
            <h1 className="text-3xl font-bold mt-1">Accounts</h1>
          </div>
          <div className="flex gap-3">
            <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
              <option value="">All Players</option>
              <option value="WANGYIRAN">WANGYIRAN</option>
              <option value="HUCAIRUI">HUCAIRUI</option>
              <option value="JAY">JAY</option>
            </select>
            <button onClick={() => setAdding(true)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium">+ Add</button>
          </div>
        </div>

        {loading ? <p className="text-gray-500">Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-2 text-gray-500 font-medium">#</th>
                  {fields.map(f => <th key={f} className="text-left p-2 text-gray-500 font-medium">{f}</th>)}
                  <th className="text-left p-2 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adding && (
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <td className="p-2 text-gray-600">new</td>
                    {fields.map(f => (
                      <td key={f} className="p-2">
                        <input className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-full" placeholder={f}
                          value={(newAccount as Record<string, string>)[f] || ""} onChange={e => setNewAccount({ ...newAccount, [f]: e.target.value })} />
                      </td>
                    ))}
                    <td className="p-2 flex gap-1">
                      <button onClick={addAccount} className="text-green-400 hover:text-green-300 text-xs">Save</button>
                      <button onClick={() => setAdding(false)} className="text-gray-500 hover:text-gray-300 text-xs">Cancel</button>
                    </td>
                  </tr>
                )}
                {accounts.map((acc, i) => (
                  <tr key={acc.id} className={`border-b border-gray-800/50 hover:bg-gray-900/30 ${i % 2 === 0 ? "bg-gray-900/10" : ""}`}>
                    <td className="p-2 text-gray-600">{i + 1}</td>
                    {fields.map(f => (
                      <td key={f} className="p-2 font-mono text-xs">
                        {editing === acc.id ? (
                          <input className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-full"
                            value={(editData as Record<string, string>)[f] || ""} onChange={e => setEditData({ ...editData, [f]: e.target.value || null })} />
                        ) : copyableFields.includes(f) ? (
                          <CopyCell value={acc[f] as string | null} />
                        ) : (
                          <span className={acc[f] ? "" : "text-gray-700"}>{(acc[f] as string) || "—"}</span>
                        )}
                      </td>
                    ))}
                    <td className="p-2">
                      {editing === acc.id ? (
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="text-green-400 hover:text-green-300 text-xs">Save</button>
                          <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-300 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(acc)} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                          <button onClick={() => deleteAccount(acc.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-gray-600 text-xs mt-4">💡 Click on username, password, email, or email password to copy to clipboard</p>
      </div>
    </main>
  );
}
