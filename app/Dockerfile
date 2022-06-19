FROM node:16.13.1-alpine as fe-builder

WORKDIR /usr/src/fe

COPY ./frontend-studies-fe/ .

RUN yarn install --production

RUN yarn build

FROM node:16.13.1-alpine as be-runner

COPY --from=fe-builder /usr/src/fe/build/ /usr/src/frontend-studies-app/frontend

WORKDIR /usr/src/frontend-studies-app/backend

COPY ./frontend-studies-be/ .

RUN yarn install --production

CMD ["yarn", "runserver"]