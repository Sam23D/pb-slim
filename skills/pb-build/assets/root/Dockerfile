# One PocketBase, dev and prod. Version and sha256 must match pb-build/assets/vendor/VERSIONS.json (server).
FROM alpine:3.22
ARG PB_VERSION=0.42.3
ARG PB_SHA256_amd64=89b1ded352404c648dd92c2d884fc8ff7858138697cb1ccb52722ccaa0bbd2a9
ARG PB_SHA256_arm64=f2af25259c5565e856aac5907a8fd9a7ce01d18375ac70b18121c9d41fd56dbe
ARG TARGETARCH
RUN apk add --no-cache ca-certificates unzip \
 && wget -qO /tmp/pb.zip "https://ganigeorgiev.com/meta/pocketbase/pocketbase/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" \
 && eval "sha=\$PB_SHA256_${TARGETARCH}" && echo "${sha}  /tmp/pb.zip" | sha256sum -c - \
 && unzip -q /tmp/pb.zip pocketbase -d /pb && rm /tmp/pb.zip
WORKDIR /pb
# In dev these are bind-mounted over; in prod the copies are what ships.
COPY pb_migrations ./pb_migrations
COPY pb_hooks ./pb_hooks
COPY pb_public ./pb_public
EXPOSE 8080
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
