import { Elysia, t } from "elysia"

// creation of tracking number
function generateTrackingCode(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const randomPart = (length: number) =>
    Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("")

// HVN-XXXX-XXXX => HVN pour Haven, suivi de 8 caractères alphanumériques divisés en deux groupes de 4 pour faciliter la lecture
  return `HVN-${randomPart(4)}-${randomPart(4)}`
}

// création d'une liste de mots clés pour déclencher une alerte, à compléter prendre en compte niveau orthographe.
const alertKeywords = ["suicide", "me suicider", "me tuer", "je veux mourir", "je ne veux plus vivre", "je veux me faire du mal"
	, "je veux me tuer", "en finir", "violer", "viol",  
]

// détection de mots clés dans le message pour déclencher l'alerte
function containsAlertKeywords(message: string): boolean {
	const lowerCaseMessage = message.toLowerCase()
	return alertKeywords.some(keyword => lowerCaseMessage.includes(keyword))
}

// création route POST/reports
const reportType = t.Union([
	t.Literal("victime"),
	t.Literal("temoin"),
])

// création route POST/anonymat
const anonymatLevel = t.Union([
	t.Literal("total"),
	t.Literal("partiel"),
	t.Literal("pas_anonyme"),
])

// création route POST/catégories
const reportCategories = t.Union([
	t.Literal("harcelement_scolaire"),
	t.Literal("violence_physique"),
	t.Literal("violence_verbale"),
	t.Literal("cyberharcelement"),
	t.Literal("discrimination"),
	t.Literal("mal_etre"),
	t.Literal("autre"),
])
// traitement d'un nouveau signalement avec génération du suivi et détection mots clés
export const reportsRoutes = new Elysia({ prefix: "/reports" })
  .post("/", ({ body }) => {
    const trackingCode = generateTrackingCode()
	const crisisAlert = containsAlertKeywords (body.contenu)
	 return {
	trackingCode,
	statut: "recu",
	crisisDetected: crisisAlert,
	createdAt: new Date().toISOString(),
	// si mots clés détectés, on ajoute numéro urgence avec message réconfortant
	...(crisisAlert && {
		urgence: {
			message: "Tu n'es pas seul (e), Contacte immédiatement :",
			numero: [
				{ nom: "Prévention suicide", numero: "3114" },
				{ nom: "Enfance en danger", numero: "119" },
				{ nom: "Cyberharcèlement", numero: "3018" },
				{ nom: "Pour les personnes sourd-aveugles", numero: "114" },
				]
			}
		})
	}
  },