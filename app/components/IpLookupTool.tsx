'use client';

import { useState } from 'react';

export default function IpLookupTool() {
  const [ipInput, setIpInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/lookup?ip=${encodeURIComponent(ipInput.trim())}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'analyse.');
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getThreatStatus = (security: any) => {
    if (!security) return { label: 'Inconnu', bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' };
    if (security.tor) return { label: 'CRITIQUE (Tor Exit)', bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-500/40' };
    if (security.proxy || security.vpn) return { label: 'SUSPECT (VPN/Proxy)', bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-500/40' };
    if (security.hosting) return { label: 'DATA CENTER / BOT', bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-500/40' };
    return { label: 'PROPRE (Résidentiel)', bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/40' };
  };

  const threat = result ? getThreatStatus(result.security) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-red-500 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
          Advanced IP Intelligence Center
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Investigation OSINT approfondie : analyse réseau, géolocalisation complète et vecteurs de risques.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          placeholder="Entrez une adresse IPv4 ou IPv6 (ex: 8.8.4.4)..."
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-orange-500 text-slate-200 placeholder-slate-500 text-sm transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-medium text-sm rounded-lg transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? 'Analyse...' : 'Lancer l\'investigation'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-400 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* LIGNE PRINCIPALE / STATUS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <span className="text-xs font-mono text-slate-500 block uppercase tracking-wider">Cible analysée</span>
              <h2 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
                {result.ip}
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-sans font-normal">{result.type}</span>
              </h2>
            </div>
            <div className={`px-4 py-2 rounded-lg border text-xs font-bold tracking-wider uppercase text-center ${threat?.bg} ${threat?.text} ${threat?.border}`}>
              Statut de menace : {threat?.label}
            </div>
          </div>

          {/* GRILLE D'INFORMATIONS MAXIMALES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. GÉOLOCALISATION ULTRA DÉTAILLÉE */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                🌐 Géolocalisation
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs text-slate-500 block">Pays / Continent</label>
                  <p className="text-slate-200 font-medium flex items-center gap-2">
                    {result.flag?.emoji} {result.country} ({result.country_code}) • {result.continent}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Région / Ville</label>
                  <p className="text-slate-200 font-medium">{result.region} ({result.region_code}) • {result.city}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Code Postal / Code Tel</label>
                  <p className="text-slate-200 font-mono">{result.postal || 'N/A'} • +{result.calling_code}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Capitale & Frontières</label>
                  <p className="text-slate-300 text-xs">Capitale : {result.capital} <br />Limites : {result.borders || 'Aucune (Île)'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Coordonnées GPS</label>
                  <p className="text-orange-400 font-mono text-xs">{result.latitude}, {result.longitude}</p>
                </div>
              </div>
            </div>

            {/* 2. INFRASTRUCTURE & ROUTAGE RESEAU */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                🎛️ Routage & Infrastructure
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs text-slate-500 block">Système Autonome (ASN)</label>
                  <p className="text-orange-400 font-mono font-bold">AS{result.connection?.asn}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Fournisseur d'accès (ISP)</label>
                  <p className="text-slate-200 font-medium">{result.connection?.isp}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Organisation propriétaire</label>
                  <p className="text-slate-200 font-medium">{result.connection?.org}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Nom de domaine associé</label>
                  <p className="text-slate-400 font-mono text-xs">{result.connection?.domain || 'Aucun lié'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Statut Européen</label>
                  <p className="text-slate-300 text-xs">{result.is_eu ? '🇪🇺 Membre de l\'Union Européenne' : '❌ Hors Union Européenne'}</p>
                </div>
              </div>
            </div>

            {/* 3. CONTEXTE TEMPOREL & FINANCIER */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                ⏱️ Contexte Local (OSINT)
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs text-slate-500 block">Fuseau Horaire</label>
                  <p className="text-slate-200 font-medium">{result.timezone?.id} ({result.timezone?.abbr})</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Heure locale de la cible</label>
                  <p className="text-emerald-400 font-mono font-semibold">
                    {result.timezone?.current_time ? new Date(result.timezone.current_time).toLocaleTimeString('fr-FR') : 'N/A'}
                  </p>
                  <span className="text-xs text-slate-500">Offset: {result.timezone?.utc} (Heure d'été : {result.timezone?.is_dst ? 'Oui' : 'Non'})</span>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Devise Locale</label>
                  <p className="text-slate-200 font-medium">{result.currency?.name} ({result.currency?.symbol} - {result.currency?.code})</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Taux de change (vs USD)</label>
                  <p className="text-slate-400 font-mono text-xs">1 USD = {result.currency?.exchange_rate} {result.currency?.code}</p>
                </div>
              </div>
            </div>

          </div>

          {/* VECTEURS DE RISQUES & CYBER DETECTIONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              🛡️ Analyse Avancée Anti-Masquage
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Connexion VPN', 
                  value: result.security?.vpn, 
                  desc: 'Utilisation d\'un tunnel chiffré commercial.' 
                },
                { 
                  label: 'Proxy Réseau', 
                  value: result.security?.proxy, 
                  desc: 'Relais intermédiaire de protocole HTTP/SOCKS.' 
                },
                { 
                  label: 'Nœud de Sortie Tor', 
                  value: result.security?.tor, 
                  desc: 'Trafic anonymisé via le réseau Onion.' 
                },
                { 
                  label: 'Infrastructure Hosting', 
                  value: result.security?.hosting, 
                  desc: 'L\'IP appartient à un Data Center (Bot/Script potentiel).' 
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{item.label}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </div>
                  <div className="pt-2">
                    <span className={`inline-block w-full text-center text-xs py-1 rounded font-bold ${item.value ? 'bg-red-950/40 text-red-400 border border-red-900/50' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'}`}>
                      {item.value ? '🚨 IDENTIFIÉ' : '✅ AUCUN'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}