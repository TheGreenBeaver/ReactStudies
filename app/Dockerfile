FROM node:16.13.1-alpine as fe-builder

WORKDIR /usr/src/frontend-prep

COPY ./frontend-studies-fe/ .

RUN yarn install --production

RUN yarn build

FROM node:16.13.1-alpine as be-runner

COPY --from=fe-builder /usr/src/frontend-prep/build/ /usr/share/frontend-static

WORKDIR /usr/src/frontend-studies-app

COPY ./frontend-studies-be/ .

RUN yarn install --production

CMD ["yarn", "runserver"]