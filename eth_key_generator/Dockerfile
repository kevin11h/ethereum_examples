FROM alpine:3.8

LABEL maintainer="matr1xc0in"

ENV SHELL=/bin/bash \
    ETH_USER=ethuser \
    ETH_UID=4888 \
    ETH_GID=5888
ENV HOME=/home/$ETH_USER

USER root

RUN addgroup -g $ETH_GID $ETH_USER && \
    adduser -u $ETH_UID -g $ETH_GID -h $HOME -S -s /bin/bash $ETH_USER && \
    chmod g+w /etc/passwd /etc/group

WORKDIR $HOME

RUN apk update && apk upgrade && \
    apk add --no-cache bash git \
    openssl \
    build-base \
    && rm -rf /var/cache/apk/*

RUN cd $HOME; \
    git clone --depth 1 https://github.com/maandree/libkeccak ;\
    cd libkeccak ; \
    make && make install && make clean ;\
    cd $HOME; rm -rf libkeccak ; \
    git clone --depth 1 https://github.com/maandree/sha3sum.git ;\
    cd sha3sum ; \
    make && make install && make clean ;\
    cd $HOME; rm -rf sha3sum

COPY _eth-wallet-gen.sh $HOME/_eth-wallet-gen.sh

USER $ETH_UID
WORKDIR $HOME

CMD ["./_eth-wallet-gen.sh"]
