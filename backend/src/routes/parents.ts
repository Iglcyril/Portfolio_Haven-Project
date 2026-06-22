import { Elysia, t } from "elysia"
import { handleError } from "../middlewares/error.middleware"
import { reportService } from "../services/report.service"

// Traitement de la soumission du formulaire de contact des parents pour un suivi personnalisé
export const parentsRoutes = new Elysia({ prefix: "/parents" })
  .get("/report/:code", async ({ params, set }) => {
  const { code } = params

  try {
	const report = await reportService.findPublicByTrackingId(code)

	// supervisorName/Job/Contact, actionsTaken et nextSteps n'ont pas de colonne
	// correspondante (pas d'assignation de référent ni de notes de suivi pour l'instant)
	return {
		trackingCode: report.trackingId,
		reportCategory: report.categorie,
		status: report.status,
		supervisorName: "Mme Durand",
		supervisorJob: "Conseillère principale d'éducation",
		supervisorContact: "g.durand@gmail.com",
		actionsTaken: [
			"Contactez l'école pour obtenir des informations supplémentaires"
		],
		nextSteps: "Suivi régulier avec la famille et l'école pour assurer la sécurité de l'enfant"
	}
  } catch (e) {
	const { status, body: err } = handleError(e)
	set.status = status
	return err
  }
  })
	// Retour des parents avec message, contact et nom pour un suivi personnalisé
  .post("/contact", ({ body }) => {
	const { parentName, parentEmail, message } = body
	return {
		message: "Merci pour votre message. Nous allons vous contacter sous peu.",
		parentName,
		parentEmail,
	}
		// Ici, on pourrait ajouter une logique pour envoyer un email à l'équipe de suivi ou créer une tâche dans un système de gestion de cas
		// validation des données
	},{
		body: t.Object({
			parentName: t.String({ minLength: 2 }),
			parentEmail: t.String({ format: "email" }),
			message: t.String({ minLength: 10 }),
		})
	})

// Récupération du résumé complet du signalement pour les parents
// A faire : remplacer par prisma.report.findUnique({ where: { trackingId: code }, include: { summary: true } })
.get("/report/:code/summary", ({ params, set }) => {
	const { code } = params

	// Vérification du format du code de suivi
	if (!code.startsWith("HVN-")) {
		set.status = 404
		return { error: "Code de suivi invalide" }
	}

	return {
		trackingCode: code,
		role: "victime",
		report_type: "harcelement_scolaire",
		anonymat_level: "partiel",
		category: "cyberharcelement",
		initial_feeling: "Je me sens très mal...",
		report_status: "EN_COURS",
		mood: "3",
		is_crisis: false,
		adult_contact: "oui",
		contact_team: "oui",
		establishment_id: "uuid-etablissement",
		savedAt: "2026-06-10T08:00:00Z",
		supervisorName: "Mme Durand",
		supervisorJob: "Conseillère principale d'éducation",
		supervisorContact: "g.durand@gmail.com",
		nextSteps: "Suivi régulier avec la famille et l'école"
	}
})
