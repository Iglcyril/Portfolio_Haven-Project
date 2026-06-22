import { Elysia, t } from "elysia"
import { requireAdmin } from "../middlewares/auth.middleware"
import { handleError } from "../middlewares/error.middleware"
import { reportService } from "../services/report.service"
import { authService } from "../services/auth.service"

// Route d'administration pour la gestion des signalements et des utilisateurs
export const adminRoutes = new Elysia({ prefix: "/admin" })

// liste de tous les signalements avec filtrage
  .get("/reports", async ({query, headers, set}) => {

	//Vérification du token d'authentification et des droits d'accès
	const token = headers.authorization?.replace("Bearer ", "") ?? ""
	let payload
	try {
		payload = requireAdmin(token)
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

	try {
		const reports = await reportService.findAll(payload.userId, payload.role)

		// Filtrer par status si fourni
		const filtered = status
			? reports.filter(r => r.status === status)
			: reports

		return {
			data: filtered,
			total: filtered.length
		}
	} catch (e) {
		const { status: httpStatus, body: err } = handleError(e)
		set.status = httpStatus
		return err
	}
  })

  .get ("/reports/:id", async ({params, headers, set}) => {
	// vérification du token d'authentification et des droits d'accès
	const token = headers.authorization?.replace("Bearer ", "") ?? ""
	let payload
	try {
		payload = requireAdmin(token)
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

	try {
		return await reportService.findByTrackingId(id, payload.userId, payload.role)
	} catch (e) {
		const { status, body: err } = handleError(e)
		set.status = status
		return err
	}
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

	.patch("/reports/:id", async ({ params, body, headers, set }) => {
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
	const { status, category, level, assigne_a, note_interne } = body

	try {
		// category, assigne_a et note_interne n'ont pas de colonne correspondante sur Report :
		// ils sont validés mais pas encore persistés (pas de support schéma pour l'instant)
		let updatedStatus, updatedSeverity
		if (status) updatedStatus = await reportService.updateStatus(id, { status })
		if (level) updatedSeverity = await reportService.updateSeverity(id, { severity: level })

		return {
			trackingCode: id,
			status: updatedStatus?.status ?? status ?? "EN_COURS",
			category: category || "harcelement_scolaire",
			level: updatedSeverity?.severity ?? level ?? "ELEVE",
			assigne_a: assigne_a || null,
			note_interne: note_interne || null,
			updatedAt: updatedSeverity?.updatedAt ?? updatedStatus?.updatedAt ?? new Date().toISOString()
		}
	} catch (e) {
		const { status: httpStatus, body: err } = handleError(e)
		set.status = httpStatus
		return err
	}
	},{
  // Validation des données entrantes tous les champs sont optionnels
  body: t.Object({
    status: t.Optional(t.Union([
      t.Literal("EN_ATTENTE"),
      t.Literal("EN_COURS"),
      t.Literal("RESOLU"),
      t.Literal("ARCHIVE")
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

 .get("/stats", async ({query, headers, set}) => {
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

	try {
		return await reportService.getStats(establishment_id)
	} catch (e) {
		const { status, body: err } = handleError(e)
		set.status = status
		return err
	}
  })

// A faire : remplacer par une requète prisma data team

 .get("/team", async ({query, headers, set}) => {
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

	try {
		const staff = await authService.listStaff()
		// dispo et assigned_cases n'ont pas de colonne correspondante (pas de champ
		// disponibilité sur User, pas de relation d'assignation sur Report) : absents pour l'instant
		const team = staff.map(member => ({
			id: member.id,
			name: [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email,
			role: member.role,
			email: member.email
		}))

		// Filtrer par rôle si fourni, sinon retourner toute l'équipe
		const filtered = team_info
			? team.filter(m => m.role === team_info.toUpperCase())
			: team

		return {
			hierarchy,
			total: filtered.length,
			team_info: filtered
		}
	} catch (e) {
		const { status, body: err } = handleError(e)
		set.status = status
		return err
	}
 })