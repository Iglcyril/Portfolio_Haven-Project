import { Elysia, t } from "elysia"
import { requireAdmin } from "../middlewares/auth.middleware"

// Route d'administration pour la gestion des signalements et des utilisateurs
export const adminRoutes = new Elysia({ prefix: "/admin" })

// liste de tous les signalements avec filtrage
  .get("/reports", ({query}) => {
	const { status } = query

	    // A faire : remplacer par une vraie requête Prisma → prisma.report.findMany()
    const reports = [
      {
        trackingCode: "HVN-AB12-CD34",
        status: "urgent",
        categorie: "harcelement_scolaire",
        severite: "HIGH",
        createdAt: "2026-05-15T10:30:00Z"
      },
      {
        trackingCode: "HVN-EF56-GH78",
        status: "en_cours",
        categorie: "cyberharcelement",
        severite: "MEDIUM",
        createdAt: "2026-05-20T14:00:00Z"
      },
      {
        trackingCode: "HVN-IJ90-KL12",
        status: "traite",
        categorie: "mal_etre",
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
	categorie: "harcelement_scolaire",
	level: "HIGH",
	createdAt: "2026-05-15T10:30:00Z"
	}
	return report
	})


	.patch("/reports/:id", ({ params, body }) => {
	const { id } = params
	const { status, categorie, level } = body
	return {
	trackingCode: id,
	status: status || "en_cours",
	categorie: categorie || "harcelement_scolaire",
	level: level || "HIGH",
	updatedAt: new Date().toISOString()
	}
	},{
  // Validation des données entrantes — tous les champs sont optionnels
  body: t.Object({
    status: t.Optional(t.Union([
      t.Literal("urgent"),
      t.Literal("en_cours"),
      t.Literal("traite"),
      t.Literal("archive")
    ])),
    assigne_a: t.Optional(t.String()),
    note_interne: t.Optional(t.String()),
	categorie: t.Optional(t.Union([
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




