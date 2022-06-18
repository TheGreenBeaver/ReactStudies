FROM node:16.13.1-alpine as fe-builder

WORKDIR $APP_ROOT$APP_FRONTEND

COPY ./frontend-studies-fe/ .

RUN yarn install --production

RUN yarn build

FROM node:16.13.1-alpine as be-runner

COPY --from=fe-builder $APP_ROOT$APP_FRONTEND/build $APP_ROOT$APP_FRONTEND

WORKDIR $APP_ROOT$APP_BACKEND

COPY ./frontend-studies-be/ .

RUN yarn install --production

CMD ["yarn", "runserver"]