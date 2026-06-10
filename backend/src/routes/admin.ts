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

  .get ("/reports/:id", ({ params }) => {
	const { id } = params
	// A faire : remplacer par une vraie requête Prisma -> prisma.report.findUnique({ where: { trackingCode: id } })
	const report = {
	trackingCode: id,
	status: "en_cours",
	category: "harcelement_scolaire",
	level: "HIGH",
	createdAt: "2026-05-15T10:30:00Z"
	}
	return report
	})


	.patch("/reports/:id", ({ params, body }) => {
	const { id } = params
	const { status, category, level } = body
	return {
	trackingCode: id,
	status: status || "en_cours",
	category: category || "harcelement_scolaire",
	level: level || "ELEVE",
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
	  t.Literal ("violence_verbale"),
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

 .get("/stats", ({query}) => {
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

 .get("/team", ({query}) => {
	const { team_info } = query

	return {
	  team_info: [
		{
			id: 1,
			name: "Alice Dupont",
			role: "Responsable de la sécurité",
			email: "alice.dupont@example.com",
			dispo: "Libre",
			assigned_cases: 5,
		},
		{
			id: 2,
			name: "Bob Martin",
			role: "Psychologue scolaire",
			email: "bob.martin@example.com",
			dispo: "Occupé",
			assigned_cases: 3
		},
		{
			id: 3,
			name: "Claire Durand",
			role: "Médiatrice",
			email: "claire.durand@example.com",
			dispo: "Absent",
			assigned_cases: 2
		}
	  ]
	}
 })