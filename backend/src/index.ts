import { Elysia } from "elysia"
import { swagger } from "@elysiajs/swagger"
import { cors } from "@elysiajs/cors"

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

  .get("/",() => ({
	Message: "Haven API is running",
	version: "0.1.0"
  }))

  .listen(3000)

console.log('Haven API is running on http://localhost:3000')
console.log('Swagger documentation available at http://localhost:3000/swagger')
