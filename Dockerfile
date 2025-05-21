FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install build dependencies for canvas and other native modules
RUN apk add --no-cache python3 make g++ pkgconfig pixman-dev cairo-dev pango-dev jpeg-dev giflib-dev \
  && ln -sf python3 /usr/bin/python

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
