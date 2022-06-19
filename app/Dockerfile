FROM node:16.13.1-alpine as fe-builder

WORKDIR /usr/src/fe

COPY frontend-studies-fe/package.json .

COPY frontend-studies-fe/yarn.lock .

RUN yarn install --production

COPY frontend-studies-fe/ .

RUN yarn build

COPY frontend-studies-fe/ .

FROM node:16.13.1-alpine as be-runner

COPY --from=fe-builder /usr/src/fe/build/ /usr/src/frontend-studies-app/frontend

WORKDIR /usr/src/frontend-studies-app/backend

COPY ./frontend-studies-be/ .

RUN yarn install --production

CMD ["yarn", "runserver"]