# Base image
FROM node:20.15.0 as base

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

# Install app dependencies
RUN npm install 

# Generate Prisma Schemas
RUN npm run prisma:generate

RUN npx prisma migrate

# Push DB Schema to DB
RUN npx prisma db push

# Creates a "dist" folder with the production build
RUN npm run build

# Prod-Ready Image
FROM node:20.15.0 as prod
RUN mkdir dist node_modules

ENV TZ="Asia/Kolkata"
RUN date

COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package*.json ./

# Start the server using the production build
CMD [ "npm", "run", "start" ]
