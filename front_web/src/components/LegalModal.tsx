import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  type: 'cgu' | 'privacy'
  onClose: () => void
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Article({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        padding: '8px 14px',
        background: 'rgba(46,171,123,0.10)',
        borderLeft: '3px solid #2EAB7B',
        borderRadius: '0 8px 8px 0',
        marginBottom: 14,
      }}>
        <span style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.88rem',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.90)',
        }}>
          Article {number} — {title}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  )
}

function Body({ children }: { children: string }) {
  return (
    <p style={{
      fontFamily: "'Manrope', sans-serif",
      fontSize: '0.88rem',
      color: 'rgba(255,255,255,0.55)',
      lineHeight: 1.75,
      margin: 0,
    }}>{children}</p>
  )
}

function Sub({ children }: { children: string }) {
  return (
    <p style={{
      fontFamily: "'Manrope', sans-serif",
      fontSize: '0.85rem',
      fontWeight: 700,
      color: 'rgba(255,255,255,0.80)',
      margin: '6px 0 2px',
    }}>{children}</p>
  )
}

function Bullet({ children }: { children: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{
        flexShrink: 0,
        marginTop: 8,
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: '#2EAB7B',
        display: 'inline-block',
      }} />
      <p style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.88rem',
        color: 'rgba(255,255,255,0.55)',
        lineHeight: 1.75,
        margin: 0,
      }}>{children}</p>
    </div>
  )
}

function RetentionRow({ category, duration }: { category: string; duration: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 14px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 10,
      gap: 12,
    }}>
      <span style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.83rem',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.75)',
      }}>{category}</span>
      <span style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.83rem',
        fontWeight: 700,
        color: '#2EAB7B',
        whiteSpace: 'nowrap',
      }}>{duration}</span>
    </div>
  )
}

// ─── CGU content ─────────────────────────────────────────────────────────────

function CguContent() {
  return (
    <>
      <Article number="1" title="Objet">
        <Body>Haven est une application mobile mise à disposition des élèves, parents d'élèves et personnels de l'éducation nationale permettant le signalement, le suivi et la gestion de situations de harcèlement ou de violence scolaire au sein d'un établissement.</Body>
        <Body>L'utilisation de Haven implique l'acceptation sans réserve des présentes CGU.</Body>
      </Article>

      <Article number="2" title="Accès et utilisateurs">
        <Body>Haven est accessible aux catégories suivantes d'utilisateurs :</Body>
        <Bullet>Élèves de l'établissement</Bullet>
        <Bullet>Parents ou responsables légaux d'un élève de l'établissement</Bullet>
        <Bullet>Personnels de l'éducation nationale (direction, référents, CPE, etc.) habilités par l'établissement</Bullet>
        <Body>L'accès est subordonné à une authentification sécurisée fournie par l'établissement. Tout accès non autorisé est interdit.</Body>
      </Article>

      <Article number="3" title="Données personnelles et anonymat">
        <Body>Haven permet à l'utilisateur de choisir, lors d'un signalement, un niveau d'anonymat parmi :</Body>
        <Bullet>Anonymat complet</Bullet>
        <Bullet>Semi-anonymat (classe communiquée, identité masquée)</Bullet>
        <Bullet>Identité visible</Bullet>
        <Body>Ce choix détermine les informations transmises aux personnels de l'établissement dans le cadre du traitement ordinaire du dossier.</Body>
        <Body>Les données collectées sont traitées conformément au Règlement (UE) 2016/679 (RGPD) et à la loi n°78-17 du 6 janvier 1978 modifiée. L'établissement agit en qualité de responsable de traitement. Les données ne sont en aucun cas cédées à des tiers à des fins commerciales.</Body>
        <Body>Les utilisateurs mineurs bénéficient de protections renforcées conformément à l'article 8 du RGPD.</Body>
      </Article>

      <Article number="4" title="Levée de l'anonymat">
        <Body>Le choix d'anonymat exercé par l'utilisateur est respecté dans le cadre du traitement courant des signalements. Il ne constitue cependant pas un droit absolu et peut être levé dans les cas suivants, sans que le consentement préalable de l'utilisateur soit requis :</Body>
        <Sub>4.1 — Obligation légale de signalement</Sub>
        <Body>Conformément à l'article 40 du Code de procédure pénale, tout fonctionnaire ou agent public qui, dans l'exercice de ses fonctions, a connaissance d'un crime ou d'un délit est tenu d'en informer sans délai le Procureur de la République.</Body>
        <Body>Conformément à l'article L226-2-1 du CASF, tout professionnel intervenant auprès de mineurs estimant qu'un enfant est en danger est tenu de transmettre une information préoccupante à la CRIP.</Body>
        <Body>Dans ces hypothèses, les données permettant l'identification de la victime, du ou des auteurs et des témoins pourront être transmises aux autorités compétentes.</Body>
        <Sub>4.2 — Réquisition judiciaire</Sub>
        <Body>En application du Code de procédure pénale, Haven et l'établissement sont tenus de déférer à toute réquisition judiciaire émanant d'une autorité judiciaire compétente ordonnant la communication de données nominatives.</Body>
        <Sub>4.3 — Danger grave et imminent</Sub>
        <Body>Lorsqu'une situation signalée via Haven révèle un danger grave et imminent pour l'intégrité physique ou psychique d'un élève, l'établissement se réserve le droit de lever l'anonymat dans la stricte mesure nécessaire à la protection de la personne concernée.</Body>
        <Body>En utilisant Haven, l'utilisateur reconnaît avoir été informé de ces exceptions légales et y consent expressément.</Body>
      </Article>

      <Article number="5" title="Obligations des utilisateurs">
        <Body>L'utilisateur s'engage à :</Body>
        <Bullet>Utiliser Haven exclusivement pour des signalements sincères et de bonne foi</Bullet>
        <Bullet>Ne pas effectuer de faux signalements ou de signalements malveillants</Bullet>
        <Bullet>Ne pas tenter d'accéder aux données d'autres utilisateurs</Bullet>
        <Bullet>Respecter la confidentialité des informations auxquelles il aurait accès dans le cadre de l'application</Bullet>
        <Body>Tout usage abusif ou frauduleux est susceptible d'engager la responsabilité civile et/ou pénale de son auteur, notamment au titre de l'article 226-10 du Code pénal (dénonciation calomnieuse).</Body>
      </Article>

      <Article number="6" title="Obligations de l'établissement">
        <Body>L'établissement s'engage à :</Body>
        <Bullet>Traiter chaque signalement avec diligence et confidentialité</Bullet>
        <Bullet>Former les personnels habilités à l'utilisation de Haven et aux obligations légales afférentes</Bullet>
        <Bullet>Désigner un Délégué à la Protection des Données (DPO) conformément au RGPD</Bullet>
        <Bullet>Informer les utilisateurs en cas de violation de données (article 33 RGPD)</Bullet>
      </Article>

      <Article number="7" title="Responsabilité">
        <Body>Haven est un outil d'aide au signalement. Il ne se substitue pas aux procédures légales et réglementaires en vigueur dans l'Éducation nationale. L'éditeur de l'application ne saurait être tenu responsable des décisions prises par l'établissement dans le traitement des signalements.</Body>
      </Article>

      <Article number="8" title="Modification des CGU">
        <Body>Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront notifiés de toute modification substantielle. La poursuite de l'utilisation de Haven après notification vaut acceptation des nouvelles CGU.</Body>
      </Article>

      <Article number="9" title="Contact et DPO">
        <Body>Pour toute question relative aux présentes CGU ou à l'exercice de vos droits (accès, rectification, suppression, portabilité — articles 15 à 22 du RGPD), vous pouvez contacter :</Body>
        <Bullet>La direction de votre établissement</Bullet>
        <Bullet>Le Délégué à la Protection des Données de l'établissement</Bullet>
      </Article>
    </>
  )
}

// ─── Privacy content ──────────────────────────────────────────────────────────

function PrivacyContent() {
  return (
    <>
      <Article number="1" title="Responsable du traitement">
        <Body>Le responsable du traitement des données collectées via l'application Haven est l'établissement scolaire qui déploie l'application auprès de ses utilisateurs. À ce titre, l'établissement détermine les finalités et les moyens du traitement conformément au Règlement (UE) 2016/679 (RGPD) et à la loi n°78-17 du 6 janvier 1978 modifiée.</Body>
      </Article>

      <Article number="2" title="Données collectées">
        <Body>Selon le niveau d'anonymat choisi par l'utilisateur lors d'un signalement, Haven collecte tout ou partie des données suivantes :</Body>
        <Sub>Données d'identification</Sub>
        <Bullet>Adresse e-mail (pour les comptes professionnels)</Bullet>
        <Bullet>Nom et prénom (uniquement en mode « Identité visible »)</Bullet>
        <Bullet>Classe de l'élève (en mode « Semi-anonyme » ou « Identité visible »)</Bullet>
        <Sub>Données liées au signalement</Sub>
        <Bullet>Contenu textuel du signalement</Bullet>
        <Bullet>Niveau d'anonymat choisi</Bullet>
        <Bullet>Date et heure de soumission</Bullet>
        <Bullet>Pièces jointes transmises le cas échéant</Bullet>
        <Sub>Données de suivi</Sub>
        <Bullet>Historique des actions menées sur le dossier par les personnels habilités</Bullet>
        <Bullet>Niveau de risque évalué</Bullet>
        <Bullet>Progression du traitement du dossier</Bullet>
        <Sub>Données techniques</Sub>
        <Bullet>Logs de connexion (date, heure, identifiant de session)</Bullet>
        <Body>Aucun cookie tiers n'est utilisé. Haven ne recourt à aucun outil de tracking publicitaire.</Body>
      </Article>

      <Article number="3" title="Base légale du traitement">
        <Body>Le traitement des données repose sur les bases légales suivantes :</Body>
        <Bullet>Mission d'intérêt public (art. 6.1.e RGPD) : le traitement s'inscrit dans les missions légales de l'établissement en matière de protection des élèves, conformément aux articles L511-3-1 et L421-3 du Code de l'éducation et à la loi n°2022-299 du 2 mars 2022 visant à combattre le harcèlement scolaire.</Bullet>
        <Bullet>Obligation légale (art. 6.1.c RGPD) : certains traitements découlent d'obligations légales imposées à l'établissement, notamment l'article 40 du Code de procédure pénale et l'article L226-2-1 du Code de l'action sociale et des familles.</Bullet>
        <Bullet>Consentement (art. 6.1.a RGPD) pour les traitements non couverts par les bases précédentes.</Bullet>
      </Article>

      <Article number="4" title="Durée de conservation">
        <Body>Les données sont conservées pour les durées suivantes, après quoi elles sont supprimées ou anonymisées de manière irréversible :</Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
          <RetentionRow category="Dossiers de signalement actifs" duration="Durée de traitement + 1 an" />
          <RetentionRow category="Dossiers archivés" duration="5 ans à compter de la clôture" />
          <RetentionRow category="Logs de connexion" duration="12 mois glissants" />
          <RetentionRow category="Données compte professionnel" duration="Durée d'activité + 3 mois" />
        </div>
        <Body>Note : les durées indiquées sont fondées sur les délais de prescription civile (art. 2224 Code civil) et le décret n°2011-219 du 25 février 2011 pour les logs de connexion.</Body>
      </Article>

      <Article number="5" title="Destinataires des données">
        <Body>Les données collectées via Haven sont accessibles aux seules personnes habilitées au sein de l'établissement :</Body>
        <Bullet>La direction et les co-responsables désignés</Bullet>
        <Bullet>Les référents assignés au dossier concerné</Bullet>
        <Body>Aucune donnée n'est transmise à des tiers à des fins commerciales ou publicitaires.</Body>
        <Body>Les données peuvent être communiquées aux autorités compétentes dans les cas prévus à l'article 4 des CGU (levée de l'anonymat).</Body>
      </Article>

      <Article number="6" title="Protection des données des mineurs">
        <Body>Haven est destinée en partie à des utilisateurs mineurs. À ce titre :</Body>
        <Bullet>Les données des mineurs bénéficient d'une protection renforcée conformément à l'article 8 du RGPD</Bullet>
        <Bullet>Le niveau d'anonymat choisi est respecté dans le traitement courant du dossier</Bullet>
        <Bullet>Aucune donnée de mineur n'est utilisée à des fins de profilage ou de traitement automatisé produisant des effets juridiques</Bullet>
      </Article>

      <Article number="7" title="Sécurité des données">
        <Body>L'éditeur de Haven met en œuvre les mesures techniques et organisationnelles appropriées pour protéger les données contre tout accès non autorisé, toute divulgation, altération ou destruction. Les accès à l'application sont authentifiés et les données transmises via des protocoles sécurisés (HTTPS/TLS).</Body>
        <Body>En cas de violation de données susceptible d'engendrer un risque pour les droits et libertés des personnes, l'établissement s'engage à notifier la CNIL dans un délai de 72 heures (art. 33 RGPD), et les utilisateurs concernés si le risque est élevé (art. 34 RGPD).</Body>
      </Article>

      <Article number="8" title="Droits des utilisateurs">
        <Body>Conformément aux articles 15 à 22 du RGPD, tout utilisateur dispose des droits suivants :</Body>
        <Bullet>Droit d'accès : obtenir une copie des données le concernant</Bullet>
        <Bullet>Droit de rectification : faire corriger des données inexactes</Bullet>
        <Bullet>Droit à l'effacement : demander la suppression de ses données, sous réserve des obligations légales de conservation</Bullet>
        <Bullet>Droit à la limitation : demander la suspension temporaire du traitement</Bullet>
        <Bullet>Droit d'opposition : s'opposer au traitement pour des raisons tenant à sa situation particulière</Bullet>
        <Bullet>Droit à la portabilité : recevoir ses données dans un format structuré et lisible</Bullet>
        <Body>Ces droits s'exercent auprès du Délégué à la Protection des Données (DPO) de l'établissement ou directement auprès de la direction.</Body>
        <Body>En cas de litige, l'utilisateur peut introduire une réclamation auprès de la CNIL — www.cnil.fr</Body>
      </Article>

      <Article number="9" title="Modifications">
        <Body>La présente politique de confidentialité peut être mise à jour. Toute modification substantielle sera notifiée aux utilisateurs. La date de mise à jour figure en en-tête du document.</Body>
      </Article>
    </>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function LegalModal({ type, onClose }: Props) {
  const isCgu = type === 'cgu'

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.70)',
          backdropFilter: 'blur(6px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        <motion.div
          key="panel"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 720,
            maxHeight: '88vh',
            background: '#0D2622',
            borderRadius: '24px 24px 0 0',
            border: '1px solid rgba(255,255,255,0.07)',
            borderBottom: 'none',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.025em',
                margin: 0,
                lineHeight: 1.2,
              }}>
                {isCgu ? "Conditions Générales d'Utilisation" : 'Politique de confidentialité'}
              </h2>
              <p style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.35)',
                margin: '6px 0 0',
                fontStyle: 'italic',
              }}>
                Application Haven — Version 1.0 — Juin 2026
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                flexShrink: 0,
                marginLeft: 16,
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.60)',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ overflowY: 'auto', padding: '28px 28px 48px', flexGrow: 1 }}>
            {isCgu ? <CguContent /> : <PrivacyContent />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
