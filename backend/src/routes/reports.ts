import { Elysia, t } from "elysia"
import { bearer } from "@elysiajs/bearer"
import { requireAuth } from "../middlewares/auth.middleware"
import { handleError } from "../middlewares/error.middleware"
import { reportService } from "../services/report.service"

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
  .use(bearer())
  // Pas d'authentification obligatoire : le chatbot crée des signalements anonymes, sans compte.
  // Si un bearer valide est fourni (utilisateur connecté), le rapport lui est rattaché.
  .post("/", async ({ body, bearer, set }) => {
	try {
		let userId: string | undefined
		if (bearer) {
			try { userId = requireAuth(bearer).userId } catch { /* token absent ou invalide : signalement anonyme */ }
		}

		const crisisAlert = body.contenu ? containsAlertKeywords(body.contenu) : false

		const report = await reportService.create({
			userId,
			type: body.type,
			category: body.categorie,
			anonymatLevel: body.anonymat_level,
			contenu: body.contenu,
			establishment_id: body.etablissement_id,
			crisisDetected: crisisAlert
		})

		return {
			trackingCode: report.trackingId,
			statut: report.status,
			crisisDetected: report.crisisDetected,
			createdAt: report.createdAt,
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
	} catch (e) {
		const { status, body: err } = handleError(e)
		set.status = status
		return err
	}
  },{
    // Validation des données entrantes
    body: t.Object({
      type: reportType,
      anonymat_level: anonymatLevel,
      // Optionnel : le chatbot crée d'abord le signalement vide, le contenu arrive ensuite via POST /:code
      contenu: t.Optional(t.String({ minLength: 10 })),
      categorie: reportCategories,
      etablissement_id: t.String()
    })
  })
 
  // Mise à jour de la déposition après soumission du signalement
  // En POST (et non PATCH) : c'est la méthode envoyée par le webhook du chatbot Typebot.
  // Pas d'authentification : même logique que POST / (signalement anonyme possible, accessible par trackingCode)
  .post("/:code", async ({ params, body, set }) => {
	const { code } = params

	try {
		const crisisAlert = containsAlertKeywords(body.content)

		const report = await reportService.addDeposition(code, body.content, crisisAlert)

		return {
			trackingCode: report.trackingId,
			statut: report.status,
			crisisDetected: report.crisisDetected,
			updatedAt: report.updatedAt,
			// si mots clés détectés dans la déposition, on renvoie les numéros d'urgence
			...(report.crisisDetected && {
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
	} catch (e) {
		const { status, body: err } = handleError(e)
		set.status = status
		return err
	}
  }, {
	// Validation des données entrantes
	body: t.Object({
		content: t.String({ minLength: 10 }),
	})
  })

  // Consultation de son propre signalement par un utilisateur connecté.
  // L'accès (STUDENT → ses rapports, PARENT → ceux de ses enfants, SUPERVISOR/ADMIN → tout)
  // est entièrement géré par reportService.findByTrackingId.
  .get("/:code", async ({ params, bearer, set }) => {
	const { code } = params

	try {
		const { userId, role } = requireAuth(bearer ?? "")
		return await reportService.findByTrackingId(code, userId, role)
	} catch (e) {
		const { status, body: err } = handleError(e)
		set.status = status
		return err
	}
  })

  // Annulation d'un signalement par son auteur (sous 5 minutes) ou par le staff (à tout moment).
  // La logique de propriétaire/délai est entièrement gérée par reportService.delete.
  .delete("/:code", async ({ params, bearer, set }) => {
	const { code } = params

	try {
		const { userId, role } = requireAuth(bearer ?? "")
		return await reportService.delete(code, userId, role)
	} catch (e) {
		const { status, body: err } = handleError(e)
		set.status = status
		return err
	}
  })

  // Sauvegarde du résumé narratif complet du signalement, collecté par le chatbot.
  // Noms de champs alignés sur ce que le webhook du chatbot Typebot envoie réellement (variantes "victime/témoin").
  // role/anonymat_level/category/is_crisis/establishment_id sont acceptés (compat webhook) mais pas ré-écrits :
  // ces champs sont déjà gérés de façon fiable par create()/addDeposition() et ne doivent pas être écrasés.
  .post("/:code/summary", async ({ params, body, set }) => {
	const { code } = params

	try {
		const summary = await reportService.saveSummary(code, {
			classLevel: body.classe,
			identity: body.identite,
			initialFeeling: body.ressenti_initial,
			mood: body.humeur,
			adultContact: body.contact_adulte,
			contactTeam: body.interpeller_equipe,
			witnessContext: body.contexte_vu,
			victimInfo: body.infos_victime,
			victimIdentity: body.identite_victime,
			bullyInfo: body.infos_harceleur,
			bullyIdentity: body.identite_harceleur,
			situationDescription: body.description_situation
		})

		return {
			trackingCode: code,
			savedAt: summary.updatedAt
		}
	} catch (e) {
		const { status, body: err } = handleError(e)
		set.status = status
		return err
	}
  }, {
	// Validation des données entrantes : tout est optionnel car les deux variantes du chatbot
	// (signalement en tant que victime/témoin) n'envoient pas exactement les mêmes champs
	body: t.Object({
		tracking_code: t.Optional(t.String()),
		role: t.Optional(t.String()),
		type_signalement: t.Optional(t.String()),
		anonymat_level: t.Optional(t.String()),
		classe: t.Optional(t.String()),
		identite: t.Optional(t.String()),
		category: t.Optional(t.String()),
		ressenti_initial: t.Optional(t.String()),
		statut: t.Optional(t.String()),
		humeur: t.Optional(t.String()),
		is_crisis: t.Optional(t.String()),
		contact_adulte: t.Optional(t.String()),
		interpeller_equipe: t.Optional(t.String()),
		establishment_id: t.Optional(t.String()),
		contexte_vu: t.Optional(t.String()),
		infos_victime: t.Optional(t.String()),
		identite_victime: t.Optional(t.String()),
		infos_harceleur: t.Optional(t.String()),
		identite_harceleur: t.Optional(t.String()),
		description_situation: t.Optional(t.String()),
	})
  })
 