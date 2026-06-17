import { Elysia, t } from "elysia"
import { requireAdmin } from "../middlewares/auth.middleware"

// Route d'administration pour la gestion des signalements et des utilisateurs
export const adminRoutes = new Elysia({ prefix: "/admin" })

// liste de tous les signalements avec filtrage
  .get("/reports", ({query, headers, set}) => {

	//Vérification du token d'authentification et des droits d'accès
	const token = headers.authorization?.replace("Bearer ", "") ?? ""
	try {
		requireAdmin(token)
	}
	catch (e: any) {
		if (e.message === "INVALID_TOKEN") {
			set.status = 401
			return { error: "Token manquant ou expiré" }
		}
		set.status = 403
		return { error: "Accès refusé" }
	}
	const { status } = query

	    // A faire : remplacer par une vraie requête Prisma → prisma.report.findMany()
    const reports = [
      {
        trackingCode: "HVN-AB12-CD34",
        status: "urgent",
        category: "harcelement_scolaire",
        severite: "HIGH",
        createdAt: "2026-05-15T10:30:00Z"
      },
      {
        trackingCode: "HVN-EF56-GH78",
        status: "en_cours",
        category: "cyberharcelement",
        severite: "MEDIUM",
        createdAt: "2026-05-20T14:00:00Z"
      },
      {
        trackingCode: "HVN-IJ90-KL12",
        status: "traite",
        category: "mal_etre",
        severite: "LOW",
        createdAt: "2026-05-22T09:15:00Z"
      }
    ]

    // Filtrer par status si fourni
    const filtered = status
      ? reports.filter(r => r.status === status)
      : reports

    return {
      data: filtered,
      total: filtered.length
    }
  })

  .get ("/reports/:id", ({params, headers, set}) => {
	// vérification du token d'authentification et des droits d'accès
	const token = headers.authorization?.replace("Bearer ", "") ?? ""
	try {
		requireAdmin(token)
	}
	catch (e: any) {
		if (e.message === "INVALID_TOKEN") {
			set.status = 401
			return { error: "Token manquant ou expiré" }
		}
		set.status = 403
		return { error: "Accès refusé" }
	}
	const { id } = params
	// A faire : remplacer par une vraie requête Prisma -> prisma.report.findUnique({ where: { trackingCode: id } })
	// vérification format id
	if (!id.startsWith("HVN-")) {
		set.status = 404
		return { error: "Signalement non trouvé" }
	}

	const report = {
	trackingCode: id,
	status: "en_cours",
	category: "harcelement_scolaire",
	level: "HIGH",
	createdAt: "2026-05-15T10:30:00Z"
	}
	return report
	})

	.get("/reports/:id/summary", ({ params, headers, set }) => {
	// vérification du token d'authentification et des droits d'accès
	const token = headers.authorization?.replace("Bearer ", "") ?? ""
	try {
		requireAdmin(token)
	}
	catch (e: any) {
		if (e.message === "INVALID_TOKEN") {
			set.status = 401
			return { error: "Token manquant ou expiré" }
		}
		set.status = 403
		return { error: "Accès refusé" }
	}

	const { id } = params

	// vérification format id
	if (!id.startsWith("HVN-")) {
		set.status = 404
		return { error: "Signalement non trouvé" }
	}

	// A faire : remplacer par prisma.report.findUnique({ where: { trackingId: id }, include: { summary: true } })
	return {
		trackingCode: id,
		role: "victime",
		report_type: "harcelement_scolaire",
		anonymat_level: "partiel",
		class_level: "3ème",
		identity: null,
		category: "cyberharcelement",
		content: "Je me fais harceler depuis plusieurs semaines...",
		initial_feeling: "Très mal",
		report_status: "en_cours",
		mood: "2",
		is_crisis: false,
		adult_contact: "oui",
		contact_team: "oui",
		establishment_id: "uuid-etablissement",
		createdAt: "2026-06-10T08:00:00Z",
		updatedAt: new Date().toISOString()
	}
})

	.post("/reports/:id/assign", ({ params, body, headers, set }) => {
	// vérification du token d'authentification et des droits d'accès
	const token = headers.authorization?.replace("Bearer ", "") ?? ""
	try {
		requireAdmin(token)
	}
	catch (e: any) {
		if (e.message === "INVALID_TOKEN") {
			set.status = 401
			return { error: "Token manquant ou expiré" }
		}
		set.status = 403
		return { error: "Accès refusé" }
	}

	const { id } = params

	// vérification format id
	if (!id.startsWith("HVN-")) {
		set.status = 404
		return { error: "Signalement non trouvé" }
	}

	// A faire : remplacer par prisma.report.update({ where: { trackingId: id }, data: { assignedTo: body.referent_id } })
	return {
		trackingCode: id,
		referent_id: body.referent_id,
		referent_name: "Alice Dupont",
		assignedAt: new Date().toISOString()
	}
}, {
	body: t.Object({
		referent_id: t.String()
	})
})

	.patch("/reports/:id", ({ params, body, headers, set }) => {
	// vérification du token d'authentification et des droits d'accès
	const token = headers.authorization?.replace("Bearer ", "") ?? ""
	try {
		requireAdmin(token)
	}
	catch (e: any) {
		if (e.message === "INVALID_TOKEN") {
			set.status = 401
			return { error: "Token manquant ou expiré" }
		}
		set.status = 403
		return { error: "Accès refusé" }
	}
	const { id } = params

	// vérification format id
	if (!id.startsWith("HVN-")) {
		set.status = 404
		return { error: "Signalement non trouvé" }
	}

	// A faire : remplacer par une vraie requête Prisma -> prisma.report.update({ where: { trackingCode: id }, data: { ...body } })
	const { status, category, level, assigne_a, note_interne } = body

	return {
		trackingCode: id,
		status: status || "en_cours",
		category: category || "harcelement_scolaire",
		level: level || "ELEVE",
		assigne_a: assigne_a || null,
		note_interne: note_interne || null,
		updatedAt: new Date().toISOString()
	}
	},{
  // Validation des données entrantes tous les champs sont optionnels
  body: t.Object({
    status: t.Optional(t.Union([
      t.Literal("urgent"),
      t.Literal("en_cours"),
      t.Literal("traite"),
      t.Literal("archive")
    ])),
    assigne_a: t.Optional(t.String()),
    note_interne: t.Optional(t.String()),
	category: t.Optional(t.Union([
	  t.Literal("harcelement_scolaire"),
	  t.Literal("violence_physique"),
	  t.Literal("violence_verbale"),
	  t.Literal("cyberharcelement"),
	  t.Literal("discrimination"),
	  t.Literal("mal_etre"),
	  t.Literal("autre"),
	])),
	level: t.Optional(t.Union([
	  t.Literal("BAS"),
	  t.Literal("MOYEN"),
	  t.Literal("ELEVE")
	]))
  })
  })

 .get("/stats", ({query, headers, set}) => {
	// vérification du token d'authentification et des droits d'accès
	const token = headers.authorization?.replace("Bearer ", "") ?? ""
	try {
		requireAdmin(token)
	}
	catch (e: any) {
		if (e.message === "INVALID_TOKEN") {
			set.status = 401
			return { error: "Token manquant ou expiré" }
		}
		set.status = 403
		return { error: "Accès refusé" }
	}

	const { establishment_id } = query
	// A faire : remplacer par une vraie requête Prisma -> prisma.report.groupBy({ by: ['category'], where: { establishment_id } })

	return {
	  establishment_id,
	  // repartition par catégories
	  by_category: [
		{ category: "harcelement_scolaire", count: 10 },
		{ category: "violence_physique", count: 2 },
		{ category: "violence_verbale", count: 1 },
		{ category: "cyberharcelement", count: 5 },
		{ category: "discrimination", count: 0 },
		{ category: "mal_etre", count: 3 },
		{ category: "autre", count: 0 }
	  ],
	  // repartition par statut
	  by_status: [
		{ status: "urgent", count: 4 },
		{ status: "en_cours", count: 8 },
		{ status: "traite", count: 5 },
		{ status: "archive", count: 1 }
	  ],
	  // repartition par niveau de gravité
	  by_level: [
		{ level: "BAS", count: 6 },
		{ level: "MOYEN", count: 7 },
		{ level: "ELEVE", count: 5 },
	  ],
	  // chiffres clés à voir si implémenté
	  total_reports: 20,
	  resolution_amount: "50%",
	  average_resolution_time: "3 jours"
	}
  })

// A faire : remplacer par une requète prisma data team

 .get("/team", ({query, headers, set}) => {
	// vérification du token d'authentification et des droits d'accès
	const token = headers.authorization?.replace("Bearer ", "") ?? ""
	try {
		requireAdmin(token)
	}
	catch (e: any) {
		if (e.message === "INVALID_TOKEN") {
			set.status = 401
			return { error: "Token manquant ou expiré" }
		}
		set.status = 403
		return { error: "Accès refusé" }
	}

	const { team_info } = query

	// Hiérarchie des rôles
	const hierarchy = ["SUPERVISOR", "ADMIN", "RECTORAT"]

	// A faire : remplacer par prisma.user.findMany({ where: { role: team_info } })
	const team = [
		{
			id: 1,
			name: "Alice Dupont",
			role: "ADMIN",
			email: "alice.dupont@example.com",
			dispo: "Libre",
			assigned_cases: 5,
		},
		{
			id: 2,
			name: "Bob Martin",
			role: "SUPERVISOR",
			email: "bob.martin@example.com",
			dispo: "Occupé",
			assigned_cases: 3
		},
		{
			id: 3,
			name: "Claire Durand",
			role: "SUPERVISOR",
			email: "claire.durand@example.com",
			dispo: "Absent",
			assigned_cases: 2
		}
	]

	// Filtrer par rôle si fourni, sinon retourner toute l'équipe
	const filtered = team_info
		? team.filter(m => m.role === team_info.toUpperCase())
		: team

	return {
		hierarchy,
		total: filtered.length,
		team_info: filtered
	}
 })