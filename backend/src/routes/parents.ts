import { Elysia, t } from "elysia"
import { handleError } from "../middlewares/error.middleware"
import { reportService } from "../services/report.service"
import { contactService } from "../services/contact.service"

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
  .post("/contact", async ({ body, set }) => {
	try {
		const saved = await contactService.create(body)
		return {
			message: "Merci pour votre message. Nous allons vous contacter sous peu.",
			parentName: saved.parentName,
			parentEmail: saved.parentEmail,
		}
	} catch (e) {
		const { status, body: err } = handleError(e)
		set.status = status
		return err
	}
	},{
		body: t.Object({
			parentName: t.String({ minLength: 2 }),
			parentEmail: t.String({ format: "email" }),
			message: t.String({ minLength: 10 }),
		})
	})

// Récupération du résumé complet du signalement pour les parents.
// Publique par code de suivi (cohérent avec GET /report/:code) : pas d'authentification.
.get("/report/:code/summary", async ({ params, set }) => {
	const { code } = params

	try {
		const report = await reportService.getSummary(code)
		return {
			trackingCode: report.trackingId,
			role: report.type,
			category: report.categorie,
			anonymat_level: report.anonymatLevel,
			report_status: report.status,
			is_crisis: report.crisisDetected,
			establishment_id: report.etablissementId,
			initial_feeling: report.summary?.initialFeeling ?? null,
			mood: report.summary?.mood ?? null,
			adult_contact: report.summary?.adultContact ?? null,
			contact_team: report.summary?.contactTeam ?? null,
			savedAt: report.summary?.updatedAt ?? report.updatedAt,
			supervisorName: "Mme Durand",
			supervisorJob: "Conseillère principale d'éducation",
			supervisorContact: "g.durand@gmail.com",
			nextSteps: "Suivi régulier avec la famille et l'école"
		}
	} catch (e) {
		const { status, body: err } = handleError(e)
		set.status = status
		return err
	}
})
