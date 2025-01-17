# Build the manager binary
FROM golang:1.17.2-alpine as builder

ARG LDFLAGS
ARG PKGNAME
ARG BUILD

WORKDIR /go/src/github.com/gocrane/crane

# Add build deps, including git
RUN apk add --no-cache build-base git

# Set GOPROXY to a reliable source
RUN go env -w GOPROXY=https://proxy.golang.org,direct

# Copy the Go Modules manifests
COPY go.mod go.mod
COPY go.sum go.sum

# Cache dependencies before building the source
RUN go mod download

# Copy the go source
COPY pkg pkg/
COPY cmd cmd/

# Build
RUN go build -ldflags="${LDFLAGS}" -a -o ${PKGNAME} /go/src/github.com/gocrane/crane/cmd/${PKGNAME}/main.go

# Final image
FROM alpine:3.13.5
RUN apk add --no-cache tzdata
WORKDIR /
ARG PKGNAME
COPY --from=builder /go/src/github.com/gocrane/crane/${PKGNAME} .
