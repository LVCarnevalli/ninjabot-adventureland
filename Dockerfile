FROM ubuntu:16.04

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Configure environment
RUN apt-get update && \
    apt-get install -y wget nano git && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  	echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
  	apt-get update && \
  	apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

ENV NVM_DIR /usr/local/.nvm
ENV NODE_VERSION 8.14.0

# Install nvm
RUN git clone https://github.com/creationix/nvm.git $NVM_DIR && \
    cd $NVM_DIR && \
    git checkout `git describe --abbrev=0 --tags`

# Install default version of Node.js
RUN source $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default

# Add nvm.sh to .bashrc for startup...
RUN echo "source ${NVM_DIR}/nvm.sh" > $HOME/.bashrc && \
    source $HOME/.bashrc

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Configure NinjaBot
WORKDIR /usr/src
RUN npm install

CMD node index.js