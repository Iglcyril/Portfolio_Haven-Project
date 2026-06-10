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
	// {body, set} : body contient les données du signalement, set permet de définir le code de statut de la réponse à retirer quand on fera le lien avec la base de donnée

  //.post("/", ({ body, set }: { body: any, set: any }) => {

	.post("/", (ctx) => {
  		const body = ctx.body as any
    	const trackingCode = generateTrackingCode()
		const crisisAlert = containsAlertKeywords (body.contenu)

	//ajout code erreur
		if (!body.etablissement_id || body.etablissement_id.trim() === "") {
		ctx.set.status = 400
		return { error: "L'identifiant de l'établissement est requis" }
	}
	ctx.set.status = 201

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
  },{
    // Validation des données entrantes
    body: t.Object({
      type: reportType,
      anonymat_level: anonymatLevel,
      contenu: t.String({ minLength: 10 }),
      categorie: reportCategories,
      etablissement_id: t.String()
    })
  })
  // récupération d'un signalement avec son code de suivi
  .get("/:code", (ctx) => {
	const { code } = ctx.params

	// Vérifiaction du suivi
	if (!code.startsWith("HVN-")) {
		ctx.set.status = 404
		return { error: "Code de suivi invalide" }
	}

	// A remplacé par prisma 
	return {
	tracking_code: code,
	current_status: "en_cours",
	category: "harcelement_scolaire",
	level: "haut",
	referent: "Madame Dupont",
	createdAt: "2026-05-15T10:30:00Z",
	last_update: "2026-05-15T10:30:00Z",
	timeline: [
		{
			step: "recu",
			timestamp: "2026-05-15T10:30:00Z",
			comment: "Signalement reçu, en attente de traitement",
		},
		{
			step: "en_cours",
			timestamp: "2026-05-16T14:45:00Z",
			comment: "Le référent de l'établissement a pris en charge le signalement",
		}
	],
	next_steps: [
		"Le référent de l'établissement prendra contact avec vous dans les plus brefs délais",
		"En cas d'urgence, n'hésitez pas à contacter les numéros d'urgence fournis"
	],
	}
})