import { Elysia, t } from "elysia"

// creation of tracking number
function trackingNumberCode(): string {
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

