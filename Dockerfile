FROM ubuntu:18.04
RUN apt-get update && apt-get install -y apt-transport-https sudo git utils nodejs
RUN apt-get install --yes curl
RUN curl --silent --location https://deb.nodesource.com/setup_10.x | sudo bash -
RUN apt-get install --yes nodejs
RUN apt-get install --yes build-essential
RUN apt-get install --yes libreoffice
RUN mkdir /opt/validateme-csv-row-processor
WORKDIR /opt/validateme-csv-row-processor
COPY . /opt/validateme-csv-row-processor
EXPOSE 5000 
CMD [ "npm", "start" ]
