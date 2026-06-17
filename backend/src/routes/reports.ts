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
	const crisisAlert = containsAlertKeywords(body.contenu)
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
 
  // Mise à jour de la déposition après soumission du signalement
  // A faire : remplacer par prisma.report.update({ where: { trackingId: code }, data: { content } })
  .patch("/:code", ({ params, body, set }) => {
	const { code } = params
 
	// Vérification format du code
	if (!code.startsWith("HVN-")) {
		set.status = 404
		return { error: "Signalement non trouvé" }
	}
 
	const crisisAlert = containsAlertKeywords(body.content)
 
	return {
		trackingCode: code,
		statut: "deposition_reçue",
		crisisDetected: crisisAlert,
		updatedAt: new Date().toISOString(),
		// si mots clés détectés dans la déposition, on renvoie les numéros d'urgence
		...(crisisAlert && {
			urgence: {
				message: "Tu n'es pas seul(e), Contacte immédiatement :",
				numero: [
					{ nom: "Prévention suicide", numero: "3114" },
					{ nom: "Enfance en danger", numero: "119" },
					{ nom: "Cyberharcèlement", numero: "3018" },
					{ nom: "Pour les personnes sourd-aveugles", numero: "114" },
				]
			}
		})
	}
  }, {
	// Validation des données entrantes
	body: t.Object({
		content: t.String({ minLength: 10 }),
	})
  })
 
  // Sauvegarde du résumé complet du signalement pour l'équipe pédagogique
  // A faire : remplacer par prisma.report.update({ where: { trackingId: code }, data: { ...body } })
  .post("/:code/summary", ({ params, body, set }) => {
	const { code } = params
 
	// Vérification format du code
	if (!code.startsWith("HVN-")) {
		set.status = 404
		return { error: "Signalement non trouvé" }
	}
 
	return {
		trackingCode: code,
		statut: "resume_enregistre",
		savedAt: new Date().toISOString(),
		data: {
			role: body.role,
			report_type: body.report_type,
			anonymat_level: body.anonymat_level,
			class_level: body.class_level,
			identity: body.identity,
			category: body.category,
			initial_feeling: body.initial_feeling,
			report_status: body.report_status,
			mood: body.mood,
			is_crisis: body.is_crisis,
			adult_contact: body.adult_contact,
			contact_team: body.contact_team,
			establishment_id: body.establishment_id,
		}
	}
  }, {
	// Validation des données entrantes tous les champs optionnels car certains peuvent être vides selon le parcours
	body: t.Object({
		role: t.Optional(t.String()),
		report_type: t.Optional(t.String()),
		anonymat_level: t.Optional(t.String()),
		class_level: t.Optional(t.String()),
		identity: t.Optional(t.String()),
		category: t.Optional(t.String()),
		initial_feeling: t.Optional(t.String()),
		report_status: t.Optional(t.String()),
		mood: t.Optional(t.String()),
		is_crisis: t.Optional(t.String()),
		adult_contact: t.Optional(t.String()),
		contact_team: t.Optional(t.String()),
		establishment_id: t.Optional(t.String()),
	})
  })
 