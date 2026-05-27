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