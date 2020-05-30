FROM balenalib/raspberry-pi
#FROM resin/raspberry-pi-debian:buster
WORKDIR /app


RUN mkdir -p /app/node_modules && touch /root/.profile

#Install Deps
RUN install_packages git pigpio python build-essential libudev-dev libbluetooth-dev

COPY package*.json ./

#Install node
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

# So we don't have to call bash and source .bashrc on every RUN
SHELL ["/bin/bash", "-c", "-i"]

RUN nvm install lts/dubnium && nvm alias default lts/dubnium
RUN npm install

COPY . .
# FIXME move this to ENV vars
RUN mv /app/config /

CMD ["/bin/bash", "-c", "-i", "node index.js"]
