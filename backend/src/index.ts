import { Elysia } from "elysia"
import { swagger } from "@elysiajs/swagger"
import { cors } from "@elysiajs/cors"
import { reportsRoutes } from "./routes/reports"
import { parentsRoutes } from "./routes/parents"
import { adminRoutes } from "./routes/admin"
import { authRoutes } from "./routes/auth"

const app = new Elysia()
  .use(cors())
  .use(swagger({
	documentation: {
		info: {
			title: "Haven API",
			version: "0.1.0",
			description: "Bulling report API for schools",
		}
	}
  }))
  .use(reportsRoutes)
  .use(parentsRoutes)
  .use(adminRoutes)
  .use(authRoutes)
  .get("/",() => ({
	Message: "Haven API is running",
	version: "0.1.0"
  }))

  .listen(3000)

console.log('Haven API is running on http://localhost:3000')
console.log('Swagger documentation available at http://localhost:3000/swagger')
