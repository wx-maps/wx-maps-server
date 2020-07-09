FROM balenalib/raspberry-pi
WORKDIR /app

RUN mkdir -p /app/node_modules && touch /root/.profile

#Install Deps
RUN install_packages git pigpio python build-essential libudev-dev libbluetooth-dev


#Install node
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

# So we don't have to call bash and source .bashrc on every RUN
SHELL ["/bin/bash", "-c", "-i"]

RUN nvm install lts/dubnium && nvm alias default lts/dubnium

COPY package*.json ./
RUN npm install

COPY . .

CMD ["/bin/bash", "-c", "-i", "bin/run.sh"]
