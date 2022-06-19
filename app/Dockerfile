FROM node:16.13.1-alpine as fe-builder

WORKDIR /usr/src/fe

COPY ./frontend-studies-fe/ .

RUN yarn install --production

RUN yarn build

FROM node:16.13.1-alpine as be-runner

ARG APP_ROOT
ARG APP_FRONTEND
ARG APP_BACKEND

COPY --from=fe-builder /usr/src/fe/build/ $APP_ROOT$APP_FRONTEND

WORKDIR $APP_ROOT$APP_BACKEND

COPY ./frontend-studies-be/ .

RUN yarn install --production

CMD ["yarn", "runserver"]