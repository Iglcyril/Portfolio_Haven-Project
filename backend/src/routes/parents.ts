import { Elysia, t } from "elysia"

// Traitement de la soumission du formulaire de contact des parents pour un suivi personnalisé
export const parentsRoutes = new Elysia({ prefix: "/parents" })
  .get("/report/:code", ({ params }) => {
	const { code } = params
	const report = {
	trackingCode: code,
	studentName: "Jean Dupont",
	incidentDate: "2024-05-15",
	reportCategories: "harcelement_scolaire",
	status: "en_cours",
	supervisorName: "Mme Durand",
	supervisorJob: "Conseillère principale d'éducation",
	supervisorContact: "g.durand@gmail.com",
	actionsTaken: [
		"Contactez l'école pour obtenir des informations supplémentaires"
	],
	nextSteps: "Suivi régulier avec la famille et l'école pour assurer la sécurité de l'enfant"
}
	return report
  })
	// Retour des parents avec message, contact et nom pour un suivi personnalisé
  .post("/contact", ({ body }) => {
	const { parentName, parentEmail, message } = body
	return {
		confirmation: "Merci pour votre message. Nous allons vous contacter sous peu.",
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