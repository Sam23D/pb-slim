# One PocketBase, dev and prod. Version and sha256 must match pb-build/assets/vendor/VERSIONS.json (server).
FROM alpine:3.22
ARG PB_VERSION=0.40.6
ARG PB_SHA256_amd64=0e1f609158ed945f809f8a02ae012aa0427129c66ebb63c1aee76f2c0309373f
ARG PB_SHA256_arm64=d22c66ceb67ca92b7d767f36d826e848a276bcfa3c197ead20bf87c42208984f
ARG TARGETARCH
RUN apk add --no-cache ca-certificates unzip \
 && wget -qO /tmp/pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" \
 && eval "sha=\$PB_SHA256_${TARGETARCH}" && echo "${sha}  /tmp/pb.zip" | sha256sum -c - \
 && unzip -q /tmp/pb.zip pocketbase -d /pb && rm /tmp/pb.zip
WORKDIR /pb
# In dev these are bind-mounted over; in prod the copies are what ships.
COPY pb_migrations ./pb_migrations
COPY pb_hooks ./pb_hooks
COPY pb_public ./pb_public
EXPOSE 8080
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
