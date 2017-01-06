#!/usr/bin/env bash
COUNTER=0
while [ $COUNTER -lt 5 ]; do
	COUNTER=$(expr $COUNTER + 1)
	echo $COUNTER
done

echo 'type <CTRL-D> to terminate'
echo -n 'enter your most liked film: '
while read FILM; do
	echo "Yeah! great film the $FILM"
done

a=0
until [ ! $a -lt 10 ]; do
	echo $a
	a=$(expr $a + 1)
	if [ $a -eq 3 ]; then
		echo "yeah i am three"
	fi
done
