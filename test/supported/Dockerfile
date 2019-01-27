FROM busybox

LABEL name="shell-format for Dockerfile test"

ENV AUTHOR=foxundermoon website=https://fox.mn

WORKDIR /app

RUN   mkdr test && \
cd test && \
echo "hello world" > helloworld && \
cat helloworld && \
wget -qO-  ip.sb  | tee  buildip  && \
date -u  | tee builddate && \
echo "build success" && \
echo "enjoy shellscript and docker by vs-shell-format" && \
cd ..

VOLUME [ "/data" ]

CMD [ "sh","-c", "hello world" ]
