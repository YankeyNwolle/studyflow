// =============================================================================
// LandingPage.jsx — Page d'accueil publique (avant connexion)
// -----------------------------------------------------------------------------
// C'est la toute première page vue par un visiteur qui ne s'est pas encore
// connecté : elle présente StudyFlow et pousse à créer un compte ("S'inscrire")
// ou à se connecter. Elle ne fait aucun appel API : c'est une page 100%
// statique, uniquement composée de JSX + CSS (voir LandingPage.css) — à
// l'exception de la section "CHIFFRES", animée par le composant CompteurAnime.
//
// On la garde dans un seul fichier (comme LoginPage/RegisterPage) car il n'y a
// ni état ni logique : juste de la présentation, section par section.
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

// -----------------------------------------------------------------------------
// CompteurAnime — affiche un nombre qui "monte" de 0 jusqu'à `valeur`
// -----------------------------------------------------------------------------
// Notions utilisées ici :
//
// • useState  : mémorise le nombre actuellement affiché. Chaque fois qu'on le
//               modifie, React ré-affiche le composant → l'utilisateur voit le
//               chiffre défiler.
// • useRef    : garde une référence vers l'élément HTML réel (le <span>), sans
//               provoquer de ré-affichage. On en a besoin pour savoir quand cet
//               élément entre à l'écran.
// • useEffect : exécute du code APRÈS l'affichage (ici : lancer l'animation) et
//               permet de faire le ménage quand le composant disparaît.
// • IntersectionObserver : API du navigateur qui prévient quand un élément
//               devient visible dans la fenêtre. Sans ça, l'animation se
//               jouerait pendant que la section est encore hors écran et
//               l'utilisateur n'en verrait rien.
// • requestAnimationFrame : demande au navigateur d'appeler notre fonction
//               juste avant le prochain rafraîchissement (≈60 fois/seconde).
//               C'est plus fluide et plus économe qu'un setInterval.
//
// Props :
//   valeur    -> le nombre à atteindre (ex : 40000, 92, 4.8)
//   decimales -> nb de chiffres après la virgule (ex : 1 pour "4.8")
//   prefixe / suffixe -> texte collé avant/après (ex : "+", "%", "/5")
//   duree     -> durée de l'animation en millisecondes
const CompteurAnime = ({
  valeur,
  decimales = 0,
  prefixe = "",
  suffixe = "",
  duree = 2000,
}) => {
  const [affichage, setAffichage] = useState(0);
  const refElement = useRef(null);

  useEffect(() => {
    const element = refElement.current;
    if (!element) return;

    // identifiant de l'animation en cours, pour pouvoir l'annuler au nettoyage
    let idAnimation;

    const lancerAnimation = () => {
      const debut = performance.now(); // horodatage de départ, en ms

      const etape = (maintenant) => {
        // progression entre 0 (début) et 1 (fin). Math.min évite de dépasser 1
        // si le navigateur nous rappelle un peu trop tard.
        const progression = Math.min((maintenant - debut) / duree, 1);

        // "easing" : au lieu d'avancer à vitesse constante (linéaire), on
        // ralentit vers la fin. Cette formule (ease-out cubique) donne un
        // mouvement bien plus naturel à l'œil.
        const adouci = 1 - Math.pow(1 - progression, 3);

        setAffichage(valeur * adouci);

        // tant qu'on n'est pas à 100 %, on redemande une image suivante
        if (progression < 1) {
          idAnimation = requestAnimationFrame(etape);
        }
      };

      idAnimation = requestAnimationFrame(etape);
    };

    // Si l'utilisateur a demandé "réduire les animations" dans son système, on
    // affiche directement la valeur finale : c'est une question d'accessibilité.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAffichage(valeur);
      return;
    }

    // On observe le <span> : dès qu'il devient visible, on lance l'animation
    // puis on arrête d'observer (unobserve) pour ne la jouer qu'une seule fois.
    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          if (entree.isIntersecting) {
            lancerAnimation();
            observateur.unobserve(entree.target);
          }
        });
      },
      { threshold: 0.4 } // se déclenche quand 40 % de l'élément est visible
    );

    observateur.observe(element);

    // Fonction de nettoyage : React l'appelle quand le composant est retiré de
    // la page. Indispensable pour ne pas laisser tourner une animation ou un
    // observateur dans le vide (fuite mémoire).
    return () => {
      observateur.disconnect();
      cancelAnimationFrame(idAnimation);
    };
  }, [valeur, duree]);

  // toLocaleString("fr-FR") formate le nombre à la française : 40000 -> "40 000"
  const texte = affichage.toLocaleString("fr-FR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });

  return (
    <span ref={refElement} className="landing-chiffres__valeur">
      {prefixe}
      {texte}
      {suffixe}
    </span>
  );
};

// ---- Petites icônes SVG réutilisées dans les cartes de fonctionnalités ----
// (on les garde en composants locaux plutôt qu'en fichiers séparés : elles ne
// servent qu'ici, pas ailleurs dans l'appli)
const IconeNotes = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 4h9l5 5v11a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z"
      stroke="white"
      strokeWidth="1.8"
    />
    <path
      d="M9 12h6M9 16h6M9 8h3"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconeEcheances = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="white" strokeWidth="1.8" />
    <path d="M3 9h18M8 3v4M16 3v4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconeFlashcards = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="6" width="13" height="9" rx="2" stroke="white" strokeWidth="1.8" />
    <rect
      x="7"
      y="9"
      width="13"
      height="9"
      rx="2"
      fill="white"
      fillOpacity="0.2"
      stroke="white"
      strokeWidth="1.8"
    />
  </svg>
);

const IconeObjectifs = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="white" strokeWidth="1.8" />
    <path d="M12 6v6l4 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const LandingPage = () => {
  return (
    <div className="landing">
      {/* ============================= EN-TÊTE ============================= */}
      <header className="landing-header">
        <div className="landing-header__brand">
          <div className="landing-header__logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" />
              <path
                d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="landing-header__nom">StudyFlow</span>
        </div>

        <nav className="landing-header__nav">
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#tarifs">Tarifs</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="landing-header__actions">
          <Link to="/login" className="landing-header__connexion">
            Se connecter
          </Link>
          <Link to="/register" className="btn-pill-dark">
            S'inscrire
          </Link>
        </div>
      </header>

      {/* ============================== HERO ================================ */}
      <section className="landing-hero">
        <div className="landing-hero__badge">
          <span className="landing-hero__badge-point" />
          <span>Rejoint par 40 000+ étudiants</span>
        </div>

        <h1 className="landing-hero__titre">
          Reprends le contrôle
          <br />
          de <span className="landing-hero__titre-degrade">tes études</span>
        </h1>

        <p className="landing-hero__sous-titre">
          Notes, échéances, flashcards, objectifs et progression réunis au même
          endroit. Fini le stress de dernière minute, place à une révision qui
          a du sens.
        </p>

        <div className="landing-hero__actions">
          <Link to="/register" className="btn-pill-primary">
            Commencer gratuitement
          </Link>
          <a href="#fonctionnalites" className="btn-pill-outline">
            Voir la démo
          </a>
        </div>

        <p className="landing-hero__note">
          Aucune carte bancaire requise · Gratuit pour toujours
        </p>

        {/* Aperçu du tableau de bord : purement décoratif (données inventées) */}
        <div className="landing-mockup">
          <div className="landing-mockup__cadre">
            <div className="landing-mockup__barre">
              <span className="landing-mockup__point landing-mockup__point--rouge" />
              <span className="landing-mockup__point landing-mockup__point--jaune" />
              <span className="landing-mockup__point landing-mockup__point--vert" />
            </div>

            <div className="landing-mockup__contenu">
              <div className="landing-mockup__colonne">
                <div className="landing-mockup__carte">
                  <div className="landing-mockup__carte-entete">
                    <span>Prochaines échéances</span>
                    <span className="landing-mockup__lien">Voir tout</span>
                  </div>
                  <div className="landing-mockup__liste">
                    <div className="landing-mockup__ligne landing-mockup__ligne--urgent">
                      <span className="landing-mockup__puce landing-mockup__puce--rouge" />
                      <span className="landing-mockup__texte">
                        Dissertation — Histoire
                      </span>
                      <span className="landing-mockup__delai landing-mockup__delai--rouge">
                        Demain
                      </span>
                    </div>
                    <div className="landing-mockup__ligne landing-mockup__ligne--amber">
                      <span className="landing-mockup__puce landing-mockup__puce--amber" />
                      <span className="landing-mockup__texte">
                        QCM — Chimie organique
                      </span>
                      <span className="landing-mockup__delai landing-mockup__delai--amber">
                        3 jours
                      </span>
                    </div>
                    <div className="landing-mockup__ligne">
                      <span className="landing-mockup__puce landing-mockup__puce--gris" />
                      <span className="landing-mockup__texte">
                        Rendu — Projet Marketing
                      </span>
                      <span className="landing-mockup__delai">8 jours</span>
                    </div>
                  </div>
                </div>

                <div className="landing-mockup__carte landing-mockup__carte--grandit">
                  <span className="landing-mockup__carte-titre">Notes récentes</span>
                  <div className="landing-mockup__notes">
                    <div className="landing-mockup__note landing-mockup__note--violet">
                      <span>Économie · Ch.4</span>
                      <p>Offre et demande, élasticité...</p>
                    </div>
                    <div className="landing-mockup__note landing-mockup__note--bleu">
                      <span>Biologie · TD3</span>
                      <p>Mitose, cycle cellulaire...</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="landing-mockup__colonne">
                <div className="landing-mockup__flashcard">
                  <span className="landing-mockup__flashcard-label">
                    FLASHCARD · 12/30
                  </span>
                  <p>Quelle est la formule de la photosynthèse ?</p>
                  <div className="landing-mockup__flashcard-barres">
                    <span className="landing-mockup__flashcard-barre landing-mockup__flashcard-barre--pleine" />
                    <span className="landing-mockup__flashcard-barre" />
                    <span className="landing-mockup__flashcard-barre" />
                  </div>
                </div>

                <div className="landing-mockup__objectif">
                  <div className="landing-mockup__anneau">
                    <div className="landing-mockup__anneau-centre">78%</div>
                  </div>
                  <span>Objectif hebdo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================== FONCTIONNALITÉS ========================= */}
      <section id="fonctionnalites" className="landing-section">
        <div className="landing-section__entete">
          <span className="landing-section__label">Fonctionnalités</span>
          <h2 className="landing-section__titre">
            Tout ce qu'il te faut, un seul endroit
          </h2>
          <p className="landing-section__texte">
            Pense moins à t'organiser, concentre-toi sur apprendre.
          </p>
        </div>

        <div className="landing-features">
          <div className="landing-feature-card landing-feature-card--large landing-feature-card--claire">
            <div className="landing-feature-card__icone landing-feature-card__icone--violet">
              <IconeNotes />
            </div>
            <h3>Notes de cours organisées</h3>
            <p>
              Classe tes cours par matière, ajoute des tags, retrouve tout en
              quelques secondes. Fini les feuilles volantes et les fichiers
              perdus.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-card__icone landing-feature-card__icone--rouge">
              <IconeEcheances />
            </div>
            <h3>Échéances sous contrôle</h3>
            <p>
              Devoirs, examens, rendus : des rappels au bon moment pour ne
              plus rien découvrir la veille.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-card__icone landing-feature-card__icone--bleu">
              <IconeFlashcards />
            </div>
            <h3>Flashcards qui s'adaptent</h3>
            <p>
              Révise avec des cartes qui reviennent plus souvent quand tu
              bloques, moins quand tu maîtrises.
            </p>
          </div>

          <div className="landing-feature-card landing-feature-card--large landing-feature-card--sombre">
            <div className="landing-feature-card__icone landing-feature-card__icone--vert">
              <IconeObjectifs />
            </div>
            <div>
              <h3>Objectifs &amp; statistiques</h3>
              <p>
                Fixe des objectifs de révision et suis ton temps d'étude, ton
                taux de réussite et ta régularité en un coup d'œil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FONCTIONNEMENT ========================= */}
      <section className="landing-comment">
        <div className="landing-comment__inner">
          <div className="landing-section__entete">
            <span className="landing-section__label">Comment ça marche</span>
            <h2 className="landing-section__titre">
              Trois étapes, zéro friction
            </h2>
          </div>

          <div className="landing-etapes">
            <div className="landing-etapes__trait" />

            <div className="landing-etape">
              <div className="landing-etape__entete">
                <div className="landing-etape__icone landing-etape__icone--violet">
                  <IconeNotes />
                </div>
                <span className="landing-etape__numero">01</span>
              </div>
              <h3>Organise tes cours</h3>
              <p>
                Importe tes notes et échéances, StudyFlow range tout par
                matière automatiquement.
              </p>
            </div>

            <div className="landing-etape">
              <div className="landing-etape__entete">
                <div className="landing-etape__icone landing-etape__icone--bleu">
                  <IconeFlashcards />
                </div>
                <span className="landing-etape__numero">02</span>
              </div>
              <h3>Révise avec les flashcards</h3>
              <p>
                Des sessions courtes et ciblées qui s'adaptent à ce que tu
                maîtrises déjà.
              </p>
            </div>

            <div className="landing-etape">
              <div className="landing-etape__entete">
                <div className="landing-etape__icone landing-etape__icone--vert">
                  <IconeObjectifs />
                </div>
                <span className="landing-etape__numero">03</span>
              </div>
              <h3>Suis ta progression</h3>
              <p>
                Visualise ton temps d'étude et ton taux de réussite pour
                ajuster tes efforts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== CHIFFRES ============================= */}
      <section className="landing-chiffres">
        <div className="landing-chiffres__grille">
          <div>
            <CompteurAnime valeur={40000} suffixe="+" />
            <p>Étudiants actifs</p>
          </div>
          <div>
            <CompteurAnime valeur={92} suffixe="%" />
            <p>Taux de réussite aux examens</p>
          </div>
          <div>
            <CompteurAnime valeur={4.8} decimales={1} suffixe="/5" />
            <p>Note moyenne sur les stores</p>
          </div>
        </div>
      </section>

      {/* ================================ TARIFS ============================== */}
      <section id="tarifs" className="landing-section landing-section--etroite">
        <div className="landing-section__entete">
          <span className="landing-section__label">Tarifs</span>
          <h2 className="landing-section__titre">Simple, sans surprise</h2>
          <p className="landing-section__texte">
            Commence gratuitement, passe en Premium quand tu es prêt.
          </p>
        </div>

        <div className="landing-tarifs">
          <div className="landing-carte-tarif">
            <h3>Gratuit</h3>
            <p className="landing-carte-tarif__sous-titre">Pour bien démarrer</p>
            <div className="landing-carte-tarif__prix">
              <span>0€</span>
              <span className="landing-carte-tarif__periode"> /mois</span>
            </div>
            <div className="landing-carte-tarif__avantages">
              <span>✓ Notes illimitées</span>
              <span>✓ Suivi des échéances</span>
              <span>✓ 50 flashcards actives</span>
              <span>✓ Statistiques de base</span>
            </div>
            <Link to="/register" className="landing-carte-tarif__bouton">
              Commencer gratuitement
            </Link>
          </div>

          <div className="landing-carte-tarif landing-carte-tarif--premium">
            <span className="landing-carte-tarif__badge">Populaire</span>
            <h3>Premium</h3>
            <p className="landing-carte-tarif__sous-titre">Pour viser plus haut</p>
            <div className="landing-carte-tarif__prix">
              <span>6,99€</span>
              <span className="landing-carte-tarif__periode"> /mois</span>
            </div>
            <div className="landing-carte-tarif__avantages">
              <span>✓ Tout le plan Gratuit</span>
              <span>✓ Flashcards illimitées</span>
              <span>✓ Objectifs personnalisés</span>
              <span>✓ Statistiques avancées</span>
              <span>✓ Export &amp; synchronisation</span>
            </div>
            <Link
              to="/register"
              className="landing-carte-tarif__bouton landing-carte-tarif__bouton--premium"
            >
              Passer en Premium
            </Link>
          </div>
        </div>
      </section>

      {/* ============================ APPEL FINAL ============================ */}
      <section className="landing-cta-finale">
        <h2>Prêt·e à étudier sans stresser ?</h2>
        <p>Rejoins des milliers d'étudiants qui ont déjà repris le contrôle.</p>
        <Link to="/register" className="btn-pill-primary">
          Essayer gratuitement
        </Link>
      </section>

      {/* ================================ PIED DE PAGE ======================== */}
      <footer id="contact" className="landing-footer">
        <div className="landing-footer__grille">
          <div>
            <div className="landing-footer__marque">
              <div className="landing-footer__logo" />
              <span>StudyFlow</span>
            </div>
            <p>
              L'appli qui aide les étudiants à s'organiser, réviser et
              progresser sans y laisser leur énergie.
            </p>
          </div>

          <div>
            <span className="landing-footer__titre-colonne">Produit</span>
            <a href="#fonctionnalites">Fonctionnalités</a>
            <a href="#tarifs">Tarifs</a>
            <a href="#">Application mobile</a>
          </div>

          <div>
            <span className="landing-footer__titre-colonne">Entreprise</span>
            <a href="#">À propos</a>
            <a href="#">Blog</a>
            <a href="#">Carrières</a>
          </div>

          <div>
            <span className="landing-footer__titre-colonne">Contact</span>
            <a href="mailto:nwolle14@gmail.com">nwolle14@gmail.com</a>
            <a href="#">Support</a>
          </div>
        </div>

        <div className="landing-footer__bas">
          <span>© 2026 StudyFlow. Tous droits réservés.</span>
          <span>Fait avec ♥ pour les étudiants</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
