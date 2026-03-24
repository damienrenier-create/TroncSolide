"use client"

import { useState, useEffect } from "react";
import { BookOpen, HelpCircle, ShieldAlert, Trophy, Award, Zap, Calendar, TrendingUp } from "lucide-react";
import { NATURE_LEVELS } from "@/lib/constants/levels";
import BadgeCatalogueClient from "@/components/badges/BadgeCatalogueClient";

export default function FAQClient({ badges, groups, catalogue, faqItems, agenda }: any) {
    const [activeTab, setActiveTab] = useState("rules"); // 'rules', 'agenda', 'progression', 'badges'

    // Automatically switch tabs based on hash in URL
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === "#niveaux") {
                setActiveTab("progression");
            } else if (hash === "#agenda") {
                setActiveTab("agenda");
            } else if (hash === "#jalons" || hash === "#periodiques" || hash === "#badges") {
                setActiveTab("badges");
            } else if (hash === "#concept" || hash === "#cagnotte" || hash === "#regles") {
                setActiveTab("rules");
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Scroll to top when tab changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [activeTab]);

    const tabs = [
        { id: "rules", label: "Le Manuel", icon: <BookOpen size={18} /> },
        { id: "agenda", label: "Agenda", icon: <Calendar size={18} /> },
        { id: "progression", label: "Niveaux", icon: <Zap size={18} /> },
        { id: "badges", label: "Trophées & Badges", icon: <Trophy size={18} /> }
    ];

    return (
        <div className="container dashboard-container" style={{ paddingBottom: "100px" }}>
            <header className="hero-card glass" style={{ padding: "2rem 1.5rem", marginTop: "1rem" }}>
                <BookOpen size={48} className="text-primary mb-4" strokeWidth={1.5} style={{ margin: "0 auto 1rem" }} />
                <h1 style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--foreground)", marginBottom: "0.5rem" }}>La Bible de Tronc Solide</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Règles du jeu, progression, niveaux et encyclopédie complète des trophées.</p>
            </header>

            {/* TAB NAVIGATION */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "2rem", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "none" }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "12px 20px", borderRadius: "100px", border: "none",
                            background: activeTab === tab.id ? "var(--primary)" : "rgba(255,255,255,0.05)",
                            color: activeTab === tab.id ? "white" : "var(--text-muted)",
                            fontWeight: 900, cursor: "pointer", transition: "all 0.2s",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT: RULES (LE MANUEL) */}
            {activeTab === "rules" && (
                <div style={{ animation: "fadeIn 0.3s ease-out", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    
                    {/* A. Concept Principal */}
                    <section className="glass" id="concept" style={{ padding: "1.5rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--primary)", marginBottom: "0.5rem", letterSpacing: "1px" }}>A. LE CONCEPT PRINCIPAL</div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                            <HelpCircle size={22} className="text-primary" />
                            Le Défi Quotidien
                        </h2>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "1rem", lineHeight: 1.6 }}>
                            <p><strong>Tronc Solide</strong> est un défi communautaire de gainage quotidien. Le but ultime ? Ne jamais rompre la chaîne et persévérer quoi qu'il arrive.</p>
                            <p>Chaque jour, un objectif t’est assigné. Tu dois le réaliser en une ou plusieurs fois, sur le même exercice ou sur plusieurs (Pompes, Squats, Gainage), mais surtout le <strong>loguer obligatoirement</strong> sur la page principale avant minuit pour qu'il soit comptabilisé.</p>
                            <div className="glass-premium" style={{ padding: "1.25rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", marginTop: "0.5rem" }}>
                                <div style={{ fontWeight: 900, color: "var(--foreground)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Zap size={16} className="text-primary" /> 💡 À Savoir :
                                </div>
                                <p style={{ fontSize: "0.80rem" }}>La difficulté augmente de <strong>1 seconde ou répétition par jour</strong>. C'est l'essence même de la progression lente mais inéluctable du Tronc.</p>
                            </div>
                        </div>
                    </section>

                    {/* B. XP et Niveau */}
                    <section className="glass" id="niveaux-info" style={{ padding: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                            <TrendingUp size={22} className="text-secondary" />
                            Le Concept Fun (mais secondaire)
                        </h2>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "1rem", lineHeight: 1.6 }}>
                            <p>Les <a href="#niveaux" onClick={(e) => { e.preventDefault(); setActiveTab("progression"); }} style={{ color: "var(--secondary)", fontWeight: 800, textDecoration: "underline" }}>niveaux</a> sont un jeu dans l’application pour stimuler les utilisateurs. La base des niveaux se fait avec des XP qui sont gagnés à chaque répétition :</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div className="glass-premium" style={{ padding: "0.75rem", borderRadius: "12px", textAlign: "center", fontWeight: 800, fontSize: "0.8rem" }}>1 Squat / Pompe = 1 XP</div>
                                <div className="glass-premium" style={{ padding: "0.75rem", borderRadius: "12px", textAlign: "center", fontWeight: 800, fontSize: "0.8rem" }}>1 Seconde Gainage = 1 XP</div>
                            </div>
                            <p>Comme dans tout jeu, il existe des raccourcis pour gagner des XP supplémentaires : en étant <a href="#jalons" onClick={(e) => { e.preventDefault(); setActiveTab("badges"); }} style={{ color: "var(--primary)", fontWeight: 800 }}>constant</a>, en établissant des <a href="#voleur" style={{ color: "var(--accent)", fontWeight: 800 }}>records</a>, ou via des défis spéciaux. Ces victoires s'accompagnent souvent de badges prestigieux.</p>
                        </div>
                    </section>
                    <section className="glass" id="expert" style={{ padding: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" }}>
                            <Trophy size={22} className="text-accent" />
                            Mécaniques Avancées
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {faqItems.map((item: any, i: number) => (
                                <div key={i} id={item.id} style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "20px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                                        <div style={{ padding: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "12px" }}>{item.icon}</div>
                                        <h4 style={{ fontSize: "1rem", fontWeight: 900 }}>{item.q}</h4>
                                    </div>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{item.a}</p>
                                    {item.id === "voleur" && (
                                        <div style={{ marginTop: "1rem", fontSize: "0.75rem", background: "rgba(245, 158, 11, 0.1)", color: "var(--accent)", padding: "8px 12px", borderRadius: "8px", fontWeight: 700 }}>
                                            💡 Retrouvez les records en direct dans l'onglet <a href="#badges" onClick={(e) => { e.preventDefault(); setActiveTab("badges"); }} style={{ color: "inherit", textDecoration: "underline" }}>Trophées & Badges</a>.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* C. Les Outils : Pour en faire plus & Suivi */}
                    <section className="glass" id="plus" style={{ padding: "1.5rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--primary)", marginBottom: "0.5rem", letterSpacing: "1px" }}>C. LES OUTILS</div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                            <BookOpen size={22} className="text-primary" />
                            Outils & Suivi
                        </h2>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "1.25rem", lineHeight: 1.6 }}>
                            <div className="glass-premium" style={{ padding: "1.25rem", borderRadius: "20px" }}>
                                <div style={{ fontWeight: 900, color: "var(--foreground)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Zap size={18} className="text-primary" /> Pour en faire plus ✨
                                </div>
                                <p style={{ fontSize: "0.85rem" }}>
                                    Cette section permet de loguer des <strong>tractions</strong>, de la <strong>course à pied</strong> ou des <strong>étirements</strong>. Pour l'instant, ces exercices ne rapportent pas d'XP et n'ont pas de badges dédiés, ils servent uniquement à ton suivi personnel.
                                </p>
                            </div>
                            
                            <p>Ton <strong>Carnet d’entraînement</strong> recense l'ensemble de tes activités, jour par jour. C'est ton journal de bord personnel vers la version la plus solide de toi-même. Tu peux y accéder via le Dashboard pour voir le détail de tes reps, tes durées de course ou d'étirement, ainsi que tes humeurs du jour.</p>
                        </div>
                    </section>

                    {/* D. Cagnotte, Objectif et Infirmerie */}
                    <section className="glass" id="cagnotte" style={{ padding: "1.5rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 900, color: "#ef4444", marginBottom: "0.5rem", letterSpacing: "1px" }}>D. CAGNOTTE & SANTÉ</div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem", color: "#ef4444" }}>
                            <ShieldAlert size={22} />
                            La Discipline de Fer
                        </h2>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "1.25rem", lineHeight: 1.6 }}>
                            <div className="glass-premium" style={{ padding: "1.25rem", borderRadius: "20px", border: "1px solid rgba(239, 68, 68, 0.1)" }}>
                                <div style={{ fontWeight: 900, color: "var(--foreground)", marginBottom: "8px" }}>📈 L'Objectif Quotidien</div>
                                <p style={{ fontSize: "0.85rem" }}>L'objectif augmente de <strong>1 par jour</strong>. Pas d'excuses, tous les exercices (Pompes, Squats, Gainage) comptent pour valider ta journée !</p>
                            </div>

                            <p><strong>La Cagnotte</strong> est l'outil de dissuasion radical. Une fois ton premier streak de 21 jours atteint, chaque jour manqué te coûte 2€ pour le pot commun.</p>
                            
                            <p>
                                <strong>L’Infirmerie 🏥</strong> : Tu es blessé ou malade ? Déclare tes dates dans ton Profil via les <strong>Certificats Médicaux</strong>. Ces jours seront validés automatiquement (0 XP) pour protéger ta série et ton portefeuille.
                            </p>
                        </div>
                    </section>
                </div>
            )}

            {/* TAB CONTENT: AGENDA */}
            {activeTab === "agenda" && (
                <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <section className="glass" style={{ padding: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                            <Calendar size={20} className="text-secondary" />
                            Agenda de la Ligue & Événements 🏆
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                            Marquez vos calendriers ! Ces journées spéciales offrent des multiplicateurs massifs et des trophées uniques que vous ne pouvez obtenir qu'une fois par an.
                        </p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {agenda?.map((item: any, idx: number) => (
                                <div key={idx} className="glass-premium" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "var(--primary)", letterSpacing: "1px" }}>{item.date}</div>
                                        <div style={{ fontWeight: "900", fontSize: "1rem", color: "var(--foreground)", marginTop: "2px" }}>{item.name}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{item.bonus}</div>
                                    </div>
                                    <div style={{ background: "rgba(0,0,0,0.04)", padding: "6px 12px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "800", color: "var(--foreground)", whiteSpace: "nowrap" }}>
                                        {item.award}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* TAB CONTENT: PROGRESSION */}
            {activeTab === "progression" && (
                <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <section className="glass" id="niveaux" style={{ padding: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                            <Zap size={20} className="text-primary" />
                            Gain d'XP & Hiérarchie de la Nature
                        </h2>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div className="glass-premium" style={{ padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <strong style={{ color: "var(--foreground)" }}>Le Fonctionnement de l'EXP est pur et méritocratique :</strong><br/>
                                <ul style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "20px" }}>
                                    <li>1 pompe valide réussie = <strong>1 XP</strong>.</li>
                                    <li>1 seconde de gainage tenue = <strong>1 XP</strong>.</li>
                                    <li>Même si tu dépasses ton objectif du jour, l'effort supplémentaire paie continuellement.</li>
                                </ul>
                            </div>
                            
                            <p style={{ marginTop: "0.5rem" }}>Cet XP s'accumule indéfiniment. Plus tu t'entraînes et tu repousses tes limites, plus l'XP croît, ce qui te permet de gravir les échelons et de débloquer de nouveaux <strong>Titres d'Évolution</strong> toujours plus prestigieux.</p>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px", marginTop: "1rem" }}>
                                {NATURE_LEVELS.map((level, idx) => {
                                    let requiredXP = 0;
                                    for (let i = 1; i <= idx; i++) requiredXP += i * 50;
                                    return (
                                        <div key={idx} style={{ background: "rgba(0,0,0,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)" }}>
                                            <div style={{ fontSize: "0.65rem", fontWeight: "900", color: "var(--primary)", letterSpacing: "1px" }}>NV. {idx + 1}</div>
                                            <div style={{ fontWeight: "900", fontSize: "1rem", color: "var(--foreground)", marginTop: "4px" }}>{level.emoji} {level.name}</div>
                                            <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", opacity: 0.8, marginTop: "6px" }}>{requiredXP.toLocaleString()} XP</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* TAB CONTENT: TROPHÉES & BADGES */}
            {activeTab === "badges" && (
                <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <section className="glass" id="jalons" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                            <Trophy size={20} className="text-primary" />
                            Jalons & Séries (La Constance pure)
                        </h2>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <p>Celui qui ne rompt jamais la chaîne est grassement récompensé. Des Badges de Jalon exclusifs existent pour témoigner de ta volonté de fer, offrant au passage d'importants bonus forfaitaires d'XP qui te catapulteront dans le classement.</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "0.5rem" }}>
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                                    <span style={{ fontSize: "1.5rem" }}>🥉</span>
                                    <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>7 Jours</div>
                                    <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#b45309" }}>+200 XP</div>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                                    <span style={{ fontSize: "1.5rem" }}>🥈</span>
                                    <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>30 Jours</div>
                                    <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#94a3b8" }}>+500 XP</div>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                                    <span style={{ fontSize: "1.5rem" }}>🥇</span>
                                    <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>100 Jours</div>
                                    <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#eab308" }}>+1,000 XP</div>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                                    <span style={{ fontSize: "1.5rem" }}>💎</span>
                                    <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>365 Jours</div>
                                    <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#06b6d4" }}>+5,000 XP</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="glass" id="periodiques" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "var(--primary)" }}>
                            <Award size={20} />
                            Trophées Périodiques (Bataille Sanglante)
                        </h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                            Attention, terrain miné ! Les trophées <strong>Champion de la Semaine</strong> et <strong>Champion du Mois</strong> ne sont pas des acquis. Ils sont décernés et remis en jeu à la fin de chaque période ! Ils reviennent de droit au joueur ayant accumulé le plus grand volume d'entraînement total (Pompes + Squats confondus) durant ladite période.<br/><br/>Tant que tu possèdes un Trophée, il te rapporte de l'expertise quotidiennement (le "Salaire du Roi"). Mais **si quelqu'un te le vole**, il te dépouille par la même occasion de la rente que tu étais censé toucher ! Ton trône n'est jamais acquis.
                        </p>
                    </section>

                    {/* Catalogue des Badges Complet */}
                    <div id="badges" style={{ animation: "fadeIn 0.5s ease-out" }}>
                        {badges ? (
                            <BadgeCatalogueClient groups={groups} faqItems={faqItems} />
                        ) : (
                            <div className="glass" style={{ textAlign: "center", padding: "3rem 2rem", borderRadius: "20px" }}>
                                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "800" }}>Connecte-toi pour explorer l'encyclopédie des hauts faits secrets et publics de ta ligue.</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
