import {PrismaClient} from "@prisma/client"
import config from "./seed.config.json"

const prisma = new PrismaClient()

async function seed() {
	for (const [modelName, operations] of Object.entries(config)) {
		for (const operation of operations) {
			if (operation.where && operation.create) {
				// Handle `upsert` logic
				const data = await (
					prisma[modelName as keyof typeof prisma] as any
				).upsert({
					where: operation.where,
					update: {},
					create: await processCreateData(operation.create)
				})
				console.log(`Seeded ${modelName}:`, data)
			} else if (operation.where && operation.create) {
				const existing = await (
					prisma[modelName as keyof typeof prisma] as any
				).findFirst({
					where: operation.where
				})
				if (!existing) {
					const data = await (
						prisma[modelName as keyof typeof prisma] as any
					).create({
						data: await processCreateData(operation.create)
					})
					console.log(`Created ${modelName}:`, data)
				}
			}
		}
	}
}

async function processCreateData(createData: any) {
	const processedData = {...createData}

	if (createData.serviceIdField && createData.serviceSlug) {
		const relatedModel = createData.serviceIdField
		const relatedRecord = await (
			prisma[relatedModel as keyof typeof prisma] as any
		).findUnique({
			where: {slug: createData.serviceSlug}
		})
		if (relatedRecord) {
			processedData.serviceId = relatedRecord.id
		}
		delete processedData.serviceIdField
		delete processedData.serviceSlug
	}

	return processedData
}

seed()
	.then(async () => {
		console.log("Database seeded successfully!")
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error("Error seeding database:", e)
		await prisma.$disconnect()
		process.exit(1)
	})
