---
layout: post
title: "Baby JS Blacklist JavaScript Jail Challenge Writeup | University of Toronto CTF"
author: "Colleirose"
permalink: /uoft-ctf-baby-js-blacklist-writeup
date: 2024-01-15
---

We're given this challenge:

![image](/assets/img/baby%20js%20writeup_html_97da4d113759bfed.webp)

Downloading <code>chal.js</code>, my first thought is that I could possibly overwrite the modules that check if something is a function call:

![image](/assets/img/baby%20js%20writeup_html_a507a86c6d10dcbc.webp)

![image](/assets/img/baby%20js%20writeup_html_1e72427725866094.webp)

![image](/assets/img/baby%20js%20writeup_html_bb39b67e1e55766.webp)

However, I didn't succeed in doing this. Although I overwrote every function on non-constant modules to <code>function(){ return true }</code> or <code>function() { return false }</code>, nothing changed and I still couldn't call any functions.

I then looked up how to call a function without parentheses and found <a href="https://portswigger.net/research/the-seventh-way-to-call-a-javascript-function-without-parentheses" rel="noopener">https://portswigger.net/research/the-seventh-way-to-call-a-javascript-function-without-parentheses</a>. I tried running <code>fetch`example.com`</code>, which did indeed invoke the fetch function, but triggered this error (in retrospect, this is probably because the Docker instance doesn't have Internet access, but I just assumed the approach was flawed at the time):

![image](/assets/img/baby%20js%20writeup_html_b0a6f054afc88a9f.webp)

Ok, back to the drawing board…

<img src="/assets/img/baby%20js%20writeup_html_528c9aa660c40b7b.webp"/>

I went back and reviewed the code, then an idea stuck out to me: I could simply overwrite the checkSafe function.

<img src="/assets/img/baby%20js%20writeup_html_45282170fe481152.webp"/>

I ran the following code:
<pre><code class="language-javascript">
this.checkSafe = () => { return true }
console.log(1337);
</code></pre>

<img src="/assets/img/baby%20js%20writeup_html_a364fc3ae318c0db.webp" />

Working! Now to get that flag… Hmm… Wait, where <i>is</i> that flag?

I went back to the <code>chal.js</code> and didn't see any flag declaration. Oops, I must've missed something. I checked the <code>Dockerfile</code>, and, ah, sure enough, there it is:

<img src="/assets/img/baby%20js%20writeup_html_88d3c036ae9e048c.webp" />

Hmm, okay, that's easy!

<img src="/assets/img/baby%20js%20writeup_html_f42ba338ae741ba9.webp" /> 

Uh, huh? 

Oh, yeah, <code>require()</code> doesn't work here, because the <code>package.json</code> says <code>"type": "module"</code>.

Okay, time for a new solution…

I tried doing <code>import * as fs from "fs"</code> but this didn't work because it's not in a module. I was running out of ideas, so I took a break for a few hours then got back to work.

I looked up online how to read files without using fs and I read about <code>process.binding("fs")</code>.

I wasn't really sure what to do with this, so I started by just typing <code>process.binding("fs")</code> into console and seeing what happens

<img src="/assets/img/baby%20js%20writeup_html_ca7664b9d913c5a3.webp" />

I started by trying to use the <code>read</code> and <code>open</code> functions to read <code>./flag</code>, but didn't know what the parameters were. It took a bit of research to realize <code>process.binding</code> is 1) written entirely in C++ (because it lets you interact with Node internals) and 2) is almost entirely undocumented, with the exception of functions that simply mimic GNU/Linux.

I eventually realized that the code I need to look at <a href="https://github.com/nodejs/node/blob/b488b19eaf2b2e7a3ca5eccd2445e245847a5f76/src/node_file.cc" rel="noopener">https://github.com/nodejs/node/blob/b488b19eaf2b2e7a3ca5eccd2445e245847a5f76/src/node_file.cc</a>. I spent quite a bit of time trying to figure out how to use <code>open()</code> and <code>read()</code> and realized that the first parameter in <code>open()</code> had something to do with permissions and only worked when set 0 and the second parameter just needed to be 0 for some reason. <code>read()</code> was thankfully <a href="https://github.com/nodejs/node/blob/b488b19eaf2b2e7a3ca5eccd2445e245847a5f76/src/node_file.cc#L1189-L1247" rel="noopener">somewhat documented through code comments</a>, but I hit an impasse when I needed to use Buffers (nearly 6 years of coding experience and I still don't really understand what Buffer does is in NodeJS, mostly because I've never had a use for it)

There were only a few hours on the CTF clock so I really didn't want to spend this time figuring out how Buffer works. So I went back to the original output of <code>process.binding("fs")</code> and realized I overlooked<code>readFileUtf8</code>. It looked simpler, so I just guessed what the parameters probably were based on what happened with the<code>open()</code> function:

<img src="/assets/img/baby%20js%20writeup_html_e0667347208b6543.webp" />

And it worked! Our flag is <code>uoftctf{b4by_j4v4scr1p7_gr3w_up_4nd_b3c4m3_4_h4ck3r}</code>

Honestly, someone with a bit more knowledge of Node, UNIX-based operating systems like GNU/Linux, and C++ could probably have figured this out quicker, but oh well, if it works, it works.