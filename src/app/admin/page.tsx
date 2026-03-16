export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-2">Admin</h1>
        <p className="text-gray-400 mb-10">Manage IPs and platform integrations</p>

        <div className="grid gap-6">
          {/* Add IP */}
          <section className="bg-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Connected IPs</h2>
            <p className="text-gray-500 text-sm">No IPs connected yet. Connect Supabase to get started.</p>
          </section>

          {/* YouTube */}
          <section className="bg-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-1">YouTube Integration</h2>
            <p className="text-gray-400 text-sm mb-4">Connect YouTube channels via Channel ID.</p>
            <div className="grid gap-3">
              <label className="block">
                <span className="text-gray-400 text-xs uppercase tracking-widest">YouTube Channel ID</span>
                <input
                  type="text"
                  placeholder="UCxxxxxxxxxxxxxxxx"
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>
          </section>

          {/* Instagram */}
          <section className="bg-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-1">Instagram Integration</h2>
            <p className="text-gray-400 text-sm mb-4">Connect via Meta Graph API or OAuth.</p>
            <div className="grid gap-3">
              {['Instagram Handle', 'Business Account ID', 'Facebook Page ID', 'Access Token'].map((field) => (
                <label key={field} className="block">
                  <span className="text-gray-400 text-xs uppercase tracking-widest">{field}</span>
                  <input
                    type="text"
                    placeholder={`Enter ${field.toLowerCase()}`}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
            <button className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
              Connect via Meta Login
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
